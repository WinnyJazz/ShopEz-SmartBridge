
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // Informasi akun pengguna
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

    passwordResetToken: {
      type: String,
      select: false,
    },

    passwordResetExpires: {
      type: Date,
      select: false,
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },

    // Foto profil pengguna (URL Cloudinary)
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    // Informasi toko
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

    // Foto toko (URL Cloudinary)
    shopImage: {
      type: String,
      default: "",
      trim: true,
    },

    shopLocation: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },

    // Informasi pembayaran toko
    // QRIS dapat berupa URL Cloudinary
    shopQris: {
      type: String,
      default: "",
      trim: true,
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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
