const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },

    // Foto profil (base64, maksimal sekitar 500 KB)
    profileImage: {
      type: String,
      default: "",
    },

    shopName: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    shopDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    shopImage: {
      type: String,
      default: "",
    },

    shopLocation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
  },

      // Info pembayaran toko (diisi seller di My Shop)
    shopQris: {
      type: String, // gambar QRIS, base64
      default: "",
    },

    shopBankName: {
      type: String,
      trim: true,
      maxlength: 50,
      default: "",
    },

    shopBankAccount: {
      type: String,
      trim: true,
      maxlength: 40,
      default: "",
    },

    shopBankHolder: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);