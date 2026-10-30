const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { PROOF_DIR } = require("../middleware/proofUpload");

const FREE_SHIPPING_MIN = 500000; // sama dengan ShoppingCart.jsx
const SHIPPING_FEE = 15000;
const MAX_LINE_ITEMS = 30;
const MAX_QUANTITY = 99;
const PAYMENT_METHODS = ["cod", "qris", "bank_transfer"];
const PAYMENT_INFO_FIELDS =
  "shopName shopQris shopBankName shopBankAccount shopBankHolder";

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const unitPrice = (product) =>
  Math.round(product.price * (1 - (product.discountPercentage || 0) / 100));

const generateOrderNumber = () =>
  `SE-${Date.now().toString(36).toUpperCase()}-${crypto
    .randomBytes(3)
    .toString("hex")
    .toUpperCase()}`;

function removeProofFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(PROOF_DIR, path.basename(filename)), () => {});
}

// Kembalikan stok: lines = [{ product, quantity }]
async function restoreStock(lines) {
  await Promise.all(
    lines.map((line) =>
      Product.updateOne({ _id: line.product }, { $inc: { stock: line.quantity } })
    )
  );
}

// Jangan kirim nama file bukti bayar ke client
function toClientOrder(order) {
  const data =
    typeof order.toObject === "function" ? order.toObject() : { ...order };
  data.hasPaymentProof = Boolean(data.paymentProof);
  delete data.paymentProof;
  return data;
}

const sellerAccepts = (seller, method) =>
  method === "qris"
    ? Boolean(seller.shopQris)
    : Boolean(
        seller.shopBankName && seller.shopBankAccount && seller.shopBankHolder
      );

// POST /api/orders  (satu order dibuat untuk tiap toko)
exports.createOrder = async (req, res) => {
  const reserved = []; // stok yang sudah dikurangi, buat rollback
  const createdOrders = [];

  try {
    const { items, shippingAddress = {}, paymentMethod, promoCode } = req.body;

    if (
      !Array.isArray(items) ||
      items.length === 0 ||
      items.length > MAX_LINE_ITEMS
    ) {
      return res.status(400).json({ message: "Your cart is empty." });
    }

    // Validate each line while keeping different variant selections separate.
    const quantities = new Map();
    const lines = new Map();

    for (const item of items) {
      const productId = String(item?.productId || "");
      const quantity = Number(item?.quantity);
      const variants = item?.variants === undefined ? [] : item.variants;

      if (
        !isValidId(productId) ||
        !Number.isInteger(quantity) ||
        quantity < 1 ||
        quantity > MAX_QUANTITY ||
        !Array.isArray(variants) ||
        variants.some(
          (variant) =>
            typeof variant?.name !== "string" ||
            typeof variant?.value !== "string" ||
            !variant.name.trim() ||
            !variant.value.trim()
        )
      ) {
        return res.status(400).json({ message: "Invalid cart item." });
      }

      quantities.set(productId, (quantities.get(productId) || 0) + quantity);
      const lineKey = `${productId}:${JSON.stringify(variants)}`;
      const existingLine = lines.get(lineKey);
      lines.set(lineKey, {
        productId,
        variants,
        quantity: (existingLine?.quantity || 0) + quantity,
      });
    }

    // Validasi alamat
    const address = {
      fullName: String(shippingAddress.fullName || "").trim(),
      phone: String(shippingAddress.phone || "").trim(),
      address: String(shippingAddress.address || "").trim(),
      city: String(shippingAddress.city || "").trim(),
      postalCode: String(shippingAddress.postalCode || "").trim(),
      notes: String(shippingAddress.notes || "").trim(),
    };

    if (!address.fullName || address.fullName.length > 100) {
      return res.status(400).json({ message: "Enter the recipient's name." });
    }
    if (!/^[0-9+\-\s]{8,20}$/.test(address.phone)) {
      return res.status(400).json({ message: "Enter a valid phone number." });
    }
    if (!address.address || address.address.length > 300) {
      return res.status(400).json({ message: "Enter your full address." });
    }
    if (!address.city || address.city.length > 100) {
      return res.status(400).json({ message: "Enter your city." });
    }
    if (!/^\d{5}$/.test(address.postalCode)) {
      return res.status(400).json({ message: "Postal code must be 5 digits." });
    }
    if (address.notes.length > 300) {
      return res
        .status(400)
        .json({ message: "Notes cannot exceed 300 characters." });
    }
    if (!PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ message: "Choose a payment method." });
    }

    // Ambil produk dari database (harga & stok selalu dari server)
    const products = await Product.find({
      _id: { $in: [...quantities.keys()] },
    });
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    for (const productId of quantities.keys()) {
      const product = productMap.get(productId);

      if (!product || product.isActive === false) {
        return res.status(409).json({
          message: "A product in your cart is no longer available.",
        });
      }

      if (String(product.seller?._id || product.seller) === String(req.user.userId)) {
        return res.status(400).json({
          message: `You can't buy your own product: "${product.name}".`,
        });
      }
    }

    const normalizedLines = [];
    for (const line of lines.values()) {
      const product = productMap.get(line.productId);
      const options = product.variantOptions || [];
      const selected = new Map();

      for (const variant of line.variants) {
        const name = variant.name.trim();
        const value = variant.value.trim();
        if (selected.has(name)) {
          return res.status(400).json({
            message: `Choose only one value for each variant of "${product.name}".`,
          });
        }
        selected.set(name, value);
      }

      if (
        selected.size !== options.length ||
        options.some(
          (option) => !selected.has(option.name) || !option.values.includes(selected.get(option.name))
        )
      ) {
        return res.status(400).json({
          message: `Choose valid variants for "${product.name}".`,
        });
      }

      normalizedLines.push({
        ...line,
        variants: options.map((option) => ({
          name: option.name,
          value: selected.get(option.name),
        })),
      });
    }

    // Pembayaran non-COD: pastikan tiap toko sudah mengisi info pembayaran
    if (paymentMethod !== "cod") {
      const sellerIds = [...new Set(products.map((p) => String(p.seller)))];
      const sellers = await User.find({ _id: { $in: sellerIds } }).select(
        PAYMENT_INFO_FIELDS
      );

      if (sellers.length !== sellerIds.length) {
        return res.status(409).json({
          message: "A shop in your cart is no longer available.",
        });
      }

      for (const seller of sellers) {
        if (!sellerAccepts(seller, paymentMethod)) {
          return res.status(409).json({
            message: `${seller.shopName || "A shop in your cart"} doesn't accept ${
              paymentMethod === "qris" ? "QRIS" : "bank transfer"
            } yet. Please choose another payment method.`,
          });
        }
      }
    }

    // Kurangi stok secara atomik (gagal kalau stok kurang)
    for (const [productId, quantity] of quantities) {
      const updated = await Product.findOneAndUpdate(
        { _id: productId, isActive: { $ne: false }, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } }
      );

      if (!updated) {
        await restoreStock(reserved);
        return res.status(409).json({
          message: `Not enough stock for "${productMap.get(productId).name}".`,
        });
      }

      reserved.push({ product: productId, quantity });
    }

    // Kelompokkan item per toko
    const groups = new Map();

    for (const line of normalizedLines) {
      const product = productMap.get(line.productId);
      const sellerId = String(product.seller);
      const cover =
        (Array.isArray(product.images) && product.images[0]) ||
        product.image ||
        "";

      if (!groups.has(sellerId)) groups.set(sellerId, []);

      groups.get(sellerId).push({
        product: product._id,
        seller: product.seller,
        name: product.name,
        image: cover,
        price: unitPrice(product),
        variants: line.variants,
        quantity: line.quantity,
      });
    }

    const promoActive =
      String(promoCode || "").trim().toUpperCase() === "SHOP10";

    for (const [sellerId, orderItems] of groups) {
      const subtotal = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const shippingFee = subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE;
      const discountAmount = promoActive ? Math.round(subtotal * 0.1) : 0;

      const order = await Order.create({
        orderNumber: generateOrderNumber(),
        buyer: req.user.userId,
        seller: sellerId,
        items: orderItems,
        shippingAddress: address,
        paymentMethod,
        // COD langsung diproses, QRIS/transfer menunggu pembayaran
        status: paymentMethod === "cod" ? "processing" : "pending_payment",
        subtotal,
        shippingFee,
        discountAmount,
        total: subtotal + shippingFee - discountAmount,
      });

      createdOrders.push(order);
    }

    return res.status(201).json({
      message: "Order placed successfully.",
      orders: createdOrders.map(toClientOrder),
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    try {
      if (createdOrders.length > 0) {
        await Order.deleteMany({
          _id: { $in: createdOrders.map((order) => order._id) },
        });
      }
      if (reserved.length > 0) {
        await restoreStock(reserved);
      }
    } catch (rollbackError) {
      console.error("Rollback error:", rollbackError.message);
    }

    return res.status(500).json({ message: "Failed to place order." });
  }
};

// GET /api/orders/mine  (pesanan sebagai buyer)
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ buyer: req.user.userId })
      .sort({ createdAt: -1 })
      .populate(
        "seller",
        "name shopName shopDescription shopImage profileImage shopLocation"
      );

    return res.status(200).json({ orders: orders.map(toClientOrder) });
  } catch (error) {
    console.error("Get orders error:", error.message);
    return res.status(500).json({ message: "Failed to load orders." });
  }
};

// GET /api/orders/:id  (buyer) + info pembayaran toko
exports.getOrderById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Order not found." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      buyer: req.user.userId,
    }).populate("seller", PAYMENT_INFO_FIELDS);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    const seller = order.seller && order.seller._id ? order.seller : null;
    const data = toClientOrder(order);

    data.seller = seller ? String(seller._id) : data.seller;
    data.paymentInfo = seller
      ? {
          shopName: seller.shopName || "",
          qris: seller.shopQris || "",
          bankName: seller.shopBankName || "",
          bankAccount: seller.shopBankAccount || "",
          bankHolder: seller.shopBankHolder || "",
        }
      : null;

    return res.status(200).json({ order: data });
  } catch (error) {
    console.error("Get order error:", error.message);
    return res.status(500).json({ message: "Failed to load order." });
  }
};

// PUT /api/orders/:id/cancel  (buyer, selama belum dibayar / dikirim)
exports.cancelOrder = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Order not found." });
    }

    const previous = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        buyer: req.user.userId,
        paymentStatus: { $in: ["unpaid", "waiting_verification"] },
        status: { $in: ["pending_payment", "processing"] },
      },
      { $set: { status: "cancelled" } },
      { new: false }
    );

    if (!previous) {
      return res
        .status(400)
        .json({ message: "This order can no longer be cancelled." });
    }

    await restoreStock(
      previous.items.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      }))
    );
    removeProofFile(previous.paymentProof);

    const order = await Order.findById(previous._id);

    return res.status(200).json({
      message: "Order cancelled.",
      order: toClientOrder(order),
    });
  } catch (error) {
    console.error("Cancel order error:", error.message);
    return res.status(500).json({ message: "Failed to cancel order." });
  }
};

// POST /api/orders/:id/proof  (buyer upload bukti bayar, field "proof")
exports.uploadPaymentProof = async (req, res) => {
  const fail = (status, message) => {
    if (req.file) removeProofFile(req.file.filename);
    return res.status(status).json({ message });
  };

  try {
    if (!isValidId(req.params.id)) {
      return fail(404, "Order not found.");
    }

    if (!req.file) {
      return fail(400, "Please upload your payment proof.");
    }

    const previous = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        buyer: req.user.userId,
        paymentMethod: { $ne: "cod" },
        status: "pending_payment",
        paymentStatus: { $in: ["unpaid", "waiting_verification"] },
      },
      {
        $set: {
          paymentProof: req.file.filename,
          paymentProofAt: new Date(),
          paymentStatus: "waiting_verification",
          paymentNote: "",
        },
      },
      { new: false }
    );

    if (!previous) {
      return fail(400, "This order can't accept a payment proof right now.");
    }

    removeProofFile(previous.paymentProof);

    const order = await Order.findById(previous._id);

    return res.status(200).json({
      message: "Payment proof uploaded. Waiting for the seller to confirm.",
      order: toClientOrder(order),
    });
  } catch (error) {
    console.error("Upload proof error:", error.message);
    return fail(500, "Failed to upload payment proof.");
  }
};

// GET /api/orders/:id/proof  (hanya buyer & seller order tersebut)
exports.getPaymentProof = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Payment proof not found." });
    }

    const order = await Order.findOne({
      _id: req.params.id,
      $or: [{ buyer: req.user.userId }, { seller: req.user.userId }],
    });

    if (!order || !order.paymentProof) {
      return res.status(404).json({ message: "Payment proof not found." });
    }

    const filePath = path.join(PROOF_DIR, path.basename(order.paymentProof));

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "Payment proof not found." });
    }

    res.set("Cache-Control", "private, no-store");
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Get proof error:", error.message);
    return res.status(500).json({ message: "Failed to load payment proof." });
  }
};

// GET /api/orders/seller/mine  (pesanan masuk untuk seller)
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ seller: req.user.userId })
      .sort({ createdAt: -1 })
      .populate("buyer", "name email");

    return res.status(200).json({ orders: orders.map(toClientOrder) });
  } catch (error) {
    console.error("Get seller orders error:", error.message);
    return res.status(500).json({ message: "Failed to load orders." });
  }
};

// PUT /api/orders/:id/payment  (seller acc / tolak bukti bayar)
// body: { decision: "approve" | "reject", note }
exports.reviewPayment = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Order not found." });
    }

    const decision = String(req.body.decision || "");
    const note = String(req.body.note || "").trim().slice(0, 300);

    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ message: "Invalid decision." });
    }

    if (decision === "reject" && !note) {
      return res.status(400).json({
        message: "Add a reason so the buyer knows what to fix.",
      });
    }

    const update =
      decision === "approve"
        ? { paymentStatus: "paid", status: "processing", paymentNote: "" }
        : {
            paymentStatus: "unpaid",
            paymentNote: note,
            paymentProof: "",
            paymentProofAt: null,
          };

    const previous = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user.userId,
        status: "pending_payment",
        paymentStatus: "waiting_verification",
      },
      { $set: update },
      { new: false }
    );

    if (!previous) {
      return res
        .status(400)
        .json({ message: "This payment can't be reviewed right now." });
    }

    if (decision === "reject") removeProofFile(previous.paymentProof);

    const order = await Order.findById(previous._id);

    return res.status(200).json({
      message:
        decision === "approve" ? "Payment confirmed." : "Payment rejected.",
      order: toClientOrder(order),
    });
  } catch (error) {
    console.error("Review payment error:", error.message);
    return res.status(500).json({ message: "Failed to review payment." });
  }
};

// PUT /api/orders/:id/status  (seller: processing -> shipped -> completed)
exports.updateOrderStatus = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) {
      return res.status(404).json({ message: "Order not found." });
    }

    const next = String(req.body.status || "");
    const requiredCurrent = { shipped: "processing", completed: "shipped" }[next];

    if (!requiredCurrent) {
      return res.status(400).json({ message: "Invalid status." });
    }

    const update = { status: next };

    // COD dianggap lunas saat pesanan selesai
    if (next === "completed") update.paymentStatus = "paid";

    const order = await Order.findOneAndUpdate(
      {
        _id: req.params.id,
        seller: req.user.userId,
        status: requiredCurrent,
      },
      { $set: update },
      { new: true }
    );

    if (!order) {
      return res
        .status(400)
        .json({ message: "This order can't be moved to that status." });
    }

    return res.status(200).json({
      message: "Order updated.",
      order: toClientOrder(order),
    });
  } catch (error) {
    console.error("Update order status error:", error.message);
    return res.status(500).json({ message: "Failed to update order." });
  }
};
