
const mongoose = require("mongoose");

const PRODUCT_CATEGORIES = [
  "Electronics",
  "Fashion",
  "Beauty & Personal Care",
  "Home & Living",
  "Lifestyle & Hobbies",
];

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
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },

    // Produk dapat memiliki lebih dari satu kategori
    category: {
      type: [
        {
          type: String,
          enum: {
            values: PRODUCT_CATEGORIES,
            message: "{VALUE} is not a valid product category",
          },
          trim: true,
        },
      ],
      required: [true, "At least one product category is required"],
      validate: [
        {
          validator: (categories) =>
            Array.isArray(categories) && categories.length > 0,
          message: "Select at least one product category",
        },
        {
          validator: (categories) =>
            Array.isArray(categories) &&
            new Set(categories).size === categories.length,
          message: "Duplicate product categories are not allowed",
        },
      ],
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

// Mendukung data lama yang masih memiliki category berbentuk string.
productSchema.pre("validate", function () {
  if (typeof this.category === "string") {
    this.category = [this.category];
  }
});

module.exports = mongoose.model("Product", productSchema);

module.exports.PRODUCT_CATEGORIES = PRODUCT_CATEGORIES;
