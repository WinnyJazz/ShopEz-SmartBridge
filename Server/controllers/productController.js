
const Product = require("../models/Product");

// GET: Mendapatkan daftar produk
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {
      isActive: true,
    };

    // Filter berdasarkan nama atau deskripsi
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Filter berdasarkan kategori
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
      !name ||
      !description ||
      price === undefined ||
      !category ||
      !image ||
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

    // ID seller diambil dari token yang sudah diverifikasi
    // oleh authMiddleware, bukan dari req.body.
    const sellerId = req.user.userId;

    const product = await Product.create({
      seller: sellerId,
      name,
      description,
      price,
      category,
      image,
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

module.exports = {
  getProducts,
  createProduct,
};
