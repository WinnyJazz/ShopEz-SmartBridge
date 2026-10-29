
const User = require("../models/User");
const Product = require("../models/Product");
const mongoose = require("mongoose");

// GET: profil publik toko dan produk aktifnya.
exports.getPublicShop = async (req, res) => {
  try {
    const { sellerId } = req.params;

    if (!mongoose.isValidObjectId(sellerId)) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const seller = await User.findOne({
      _id: sellerId,
      role: "seller",
    }).select("name shopName shopDescription shopImage profileImage shopLocation");

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: "Shop not found.",
      });
    }

    const products = await Product.find({
      seller: seller._id,
      isActive: { $ne: false },
    })
      .populate("seller", "shopName shopLocation shopImage profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      shop: {
        id: seller._id,
        name: seller.name || "",
        shopName: seller.shopName || "",
        shopDescription: seller.shopDescription || "",
        shopImage: seller.shopImage || "",
        profileImage: seller.profileImage || "",
        shopLocation: seller.shopLocation || "",
      },
      products,
    });
  } catch (error) {
    console.error("Get public shop error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to load shop.",
    });
  }
};

// GET: Ambil profil toko milik seller
exports.getMyShopProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email role profileImage shopName shopDescription shopImage shopLocation"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage a shop.",
      });
    }

    return res.json({
      success: true,
      shop: {
        shopName: user.shopName || "",
        shopDescription: user.shopDescription || "",
        shopImage: user.shopImage || "",
        shopLocation: user.shopLocation || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Get shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load shop profile.",
    });
  }
};

// PUT: Update profil toko milik seller
exports.updateMyShopProfile = async (req, res) => {
  try {
    const {
      shopName,
      shopDescription,
      shopImage,
      shopLocation,
    } = req.body;

    if (
      typeof shopName !== "string" ||
      typeof shopDescription !== "string" ||
      typeof shopImage !== "string" ||
      (shopLocation !== undefined &&
        typeof shopLocation !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop profile data.",
      });
    }

    const name = shopName.trim();
    const description = shopDescription.trim();
    const image = shopImage.trim();
    const location =
      shopLocation === undefined ? undefined : shopLocation.trim();

    if (!name || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Shop name must contain 1–100 characters.",
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Shop description cannot exceed 1000 characters.",
      });
    }

    if (location !== undefined && location.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Shop location cannot exceed 100 characters.",
      });
    }

    // Validasi gambar Base64: JPG, PNG, atau WebP,
    // dengan ukuran maksimal sekitar 500 KB.
    const validImage =
      !image ||
      (
        /^data:image\/(jpeg|png|webp);base64,/.test(image) &&
        image.length <= 700_000
      );

    if (!validImage) {
      return res.status(400).json({
        success: false,
        message:
          "Shop image must be JPG, PNG, or WebP and no larger than 500 KB.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage a shop.",
      });
    }

    user.shopName = name;
    user.shopDescription = description;
    user.shopImage = image;

    // Sinkronkan foto profil dengan foto toko seller.
    user.profileImage = image;

    // Pertahankan lokasi jika tidak dikirim oleh client.
    if (location !== undefined) {
      user.shopLocation = location;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Shop profile updated successfully.",
      shop: {
        shopName: user.shopName,
        shopDescription: user.shopDescription,
        shopImage: user.shopImage || "",
        shopLocation: user.shopLocation || "",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Update shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop profile.",
    });
  }
};

// GET /api/shop/payment  (info pembayaran toko, khusus seller)
exports.getMyPaymentSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "role shopQris shopBankName shopBankAccount shopBankHolder"
    );

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage payment settings.",
      });
    }

    return res.json({
      success: true,
      payment: {
        qris: user.shopQris || "",
        bankName: user.shopBankName || "",
        bankAccount: user.shopBankAccount || "",
        bankHolder: user.shopBankHolder || "",
      },
    });
  } catch (error) {
    console.error("Get payment settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load payment settings.",
    });
  }
};

// PUT /api/shop/payment
exports.updateMyPaymentSettings = async (req, res) => {
  try {
    const { qris, bankName, bankAccount, bankHolder } = req.body;

    if (
      [qris, bankName, bankAccount, bankHolder].some(
        (value) => typeof value !== "string"
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment settings.",
      });
    }

    const qrisImage = qris.trim();
    const name = bankName.trim();
    const account = bankAccount.trim();
    const holder = bankHolder.trim();

    // Gambar QRIS: JPG/PNG/WebP, maksimal sekitar 1 MB
    const validQris =
      !qrisImage ||
      (/^data:image\/(jpeg|png|webp);base64,/.test(qrisImage) &&
        qrisImage.length <= 1_500_000);

    if (!validQris) {
      return res.status(400).json({
        success: false,
        message: "QRIS image must be JPG, PNG, or WebP and no larger than 1 MB.",
      });
    }

    if (name.length > 50 || holder.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Bank name or account holder is too long.",
      });
    }

    if (!/^[0-9\s-]{0,40}$/.test(account)) {
      return res.status(400).json({
        success: false,
        message: "Account number can only contain digits, spaces, and dashes.",
      });
    }

    // Rekening harus diisi lengkap atau dikosongkan semua
    const bankFilled = [name, account, holder].filter(Boolean).length;
    if (bankFilled !== 0 && bankFilled !== 3) {
      return res.status(400).json({
        success: false,
        message: "Fill in bank name, account number, and account holder together.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage payment settings.",
      });
    }

    user.shopQris = qrisImage;
    user.shopBankName = name;
    user.shopBankAccount = account;
    user.shopBankHolder = holder;

    await user.save();

    return res.json({
      success: true,
      message: "Payment settings saved.",
      payment: {
        qris: user.shopQris,
        bankName: user.shopBankName,
        bankAccount: user.shopBankAccount,
        bankHolder: user.shopBankHolder,
      },
    });
  } catch (error) {
    console.error("Update payment settings error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to save payment settings.",
    });
  }
};
