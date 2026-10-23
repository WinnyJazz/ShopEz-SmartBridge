
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

    // Foto profil pribadi untuk semua pengguna ShopEZ
    profileImage: {
      type: String,
      default: "",
      trim: true,
    },

    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },

    // Informasi toko untuk pengguna dengan role seller
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
      trim: true,
    },

    shopLocation: {
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
