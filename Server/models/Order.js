const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    // Harga satuan setelah diskon, dikunci saat order dibuat
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Satu order = satu toko
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    items: {
      type: [orderItemSchema],
      validate: {
        validator: (items) => items.length > 0,
        message: "An order needs at least one item.",
      },
    },

    shippingAddress: {
      fullName: { type: String, required: true, trim: true },
      phone: { type: String, required: true, trim: true },
      address: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      postalCode: { type: String, required: true, trim: true },
      notes: { type: String, trim: true, default: "" },
    },

    paymentMethod: {
      type: String,
      enum: ["cod", "qris", "bank_transfer"],
      required: true,
    },

    // unpaid -> (buyer upload bukti) -> waiting_verification -> (seller acc) -> paid
    paymentStatus: {
      type: String,
      enum: ["unpaid", "waiting_verification", "paid"],
      default: "unpaid",
    },

    // Nama file bukti bayar di server/private-uploads/payment-proofs
    paymentProof: { type: String, default: "" },
    paymentProofAt: { type: Date, default: null },

    // Alasan penolakan dari seller
    paymentNote: { type: String, trim: true, maxlength: 300, default: "" },

    status: {
      type: String,
      enum: ["pending_payment", "processing", "shipped", "completed", "cancelled"],
      default: "pending_payment",
    },

    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);