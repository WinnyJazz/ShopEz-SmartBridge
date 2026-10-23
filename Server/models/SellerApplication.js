const mongoose = require("mongoose");

const sellerApplicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // satu aplikasi per user
    },

    shopName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    shopDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
      default: "",
    },

    // Nama lengkap sesuai KTP, buat dicocokkan waktu verifikasi
    fullName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    // Nama file foto KTP di server/private-uploads/ktp (BUKAN URL publik)
    identityPhoto: {
      type: String,
      required: true,
    },

    // Ubah manual lewat MongoDB: "pending" | "approved" | "rejected"
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },

    // Alasan penolakan (opsional), akan tampil ke user
    reviewNote: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("SellerApplication", sellerApplicationSchema);