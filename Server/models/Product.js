const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // Seller yang memiliki produk
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Informasi dasar produk
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim: true,
      maxlength: 5000,
    },

    price: {
      type: Number,
      required: [true, "Price cannot be negative"],
      min: [0, "Price cannot be negative"],
    },

    category: {
      type: String,
      required: [true, "Product category is required"],
      trim: true,
      index: true,
    },

    // Gambar utama produk
    image: {
      type: String,
      required: [true, "Product image is required"],
      trim: true,
    },

    // Semua gambar produk, maksimal 8
    images: {
      type: [String],
      default: [],
      validate: {
        validator: (images) => images.length <= 8,
        message: "A product can have a maximum of 8 images",
      },
    },

    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Stock must be a whole number",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    numReviews: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Product", productSchema);