const Product = require("../models/Product");

// GET: Menampilkan semua produk aktif untuk katalog buyer
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = { isActive: true };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter)
      .populate("seller", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// GET: Menampilkan produk milik seller yang login
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch your products",
      error: error.message,
    });
  }
};

const mongoose = require("mongoose");

// PUBLIC: semua produk dari semua seller
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Get all products error:", error.message);
    return res.status(500).json({ message: "Failed to load products." });
  }
};

// PUBLIC: detail satu produk
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Product not found." });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error.message);
    return res.status(500).json({ message: "Failed to load product." });
  }
};


// POST: Menambahkan produk baru
const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      image,
      stock,
      discountPercentage,
    } = req.body;

    if (
      !name?.trim() ||
      !description?.trim() ||
      price === undefined ||
      !category?.trim() ||
      !image?.trim() ||
      stock === undefined
    ) {
      return res.status(400).json({
        message: "Please fill in all required product fields",
      });
    }

    if (
      typeof price !== "number" ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    if (
      typeof stock !== "number" ||
      !Number.isInteger(stock) ||
      stock < 0
    ) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    if (
      discountPercentage !== undefined &&
      (
        typeof discountPercentage !== "number" ||
        !Number.isFinite(discountPercentage) ||
        discountPercentage < 0 ||
        discountPercentage > 100
      )
    ) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100",
      });
    }

    const product = await Product.create({
      seller: req.user.userId,
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      image: image.trim(),
      stock,
      discountPercentage: discountPercentage ?? 0,
    });

    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// PUT: Mengedit produk milik seller
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = [
      "name",
      "description",
      "price",
      "category",
      "image",
      "stock",
      "discountPercentage",
      "isActive",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No product fields provided to update",
      });
    }

    if (
      updates.name !== undefined &&
      (typeof updates.name !== "string" || !updates.name.trim())
    ) {
      return res.status(400).json({
        message: "Product name cannot be empty",
      });
    }

    if (
      updates.description !== undefined &&
      (typeof updates.description !== "string" ||
        !updates.description.trim())
    ) {
      return res.status(400).json({
        message: "Description cannot be empty",
      });
    }

    if (
      updates.category !== undefined &&
      (typeof updates.category !== "string" ||
        !updates.category.trim())
    ) {
      return res.status(400).json({
        message: "Category cannot be empty",
      });
    }

    if (
      updates.image !== undefined &&
      (typeof updates.image !== "string" || !updates.image.trim())
    ) {
      return res.status(400).json({
        message: "Image URL cannot be empty",
      });
    }

    if (
      updates.price !== undefined &&
      (
        typeof updates.price !== "number" ||
        !Number.isFinite(updates.price) ||
        updates.price < 0
      )
    ) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number",
      });
    }

    if (
      updates.stock !== undefined &&
      (
        typeof updates.stock !== "number" ||
        !Number.isInteger(updates.stock) ||
        updates.stock < 0
      )
    ) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number",
      });
    }

    if (
      updates.discountPercentage !== undefined &&
      (
        typeof updates.discountPercentage !== "number" ||
        !Number.isFinite(updates.discountPercentage) ||
        updates.discountPercentage < 0 ||
        updates.discountPercentage > 100
      )
    ) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100",
      });
    }

    if (
      updates.isActive !== undefined &&
      typeof updates.isActive !== "boolean"
    ) {
      return res.status(400).json({
        message: "isActive must be true or false",
      });
    }

    // Rapikan input teks
    for (const field of ["name", "description", "category", "image"]) {
      if (updates[field] !== undefined) {
        updates[field] = updates[field].trim();
      }
    }

    // Hanya pemilik produk yang boleh mengedit
    const product = await Product.findOneAndUpdate(
      {
        _id: id,
        seller: req.user.userId,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you do not own this product",
      });
    }

    res.status(200).json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    const isInvalidId = error.name === "CastError";

    res.status(isInvalidId ? 400 : 500).json({
      message: isInvalidId
        ? "Invalid product ID"
        : "Failed to update product",
      error: error.message,
    });
  }
};

// DELETE: Menghapus produk milik seller
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you do not own this product",
      });
    }

    res.status(200).json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    const isInvalidId = error.name === "CastError";

    res.status(isInvalidId ? 400 : 500).json({
      message: isInvalidId
        ? "Invalid product ID"
        : "Failed to delete product",
      error: error.message,
    });
  }
};

module.exports = {
  getProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
};
