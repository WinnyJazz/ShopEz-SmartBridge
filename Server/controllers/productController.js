const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const Product = require("../models/Product");

// Field toko yang ikut dikirim bareng produk.
// Jangan ambil shopImage karena isinya base64 dan bikin response berat.
const SELLER_FIELDS = "name shopName shopLocation";

const MAX_IMAGES = 8;

// File hasil upload multer -> path yang disimpan di DB
const toImagePaths = (files = []) =>
  files.map((file) => `/uploads/${file.filename}`);

// GET: katalog publik (semua produk aktif dari semua seller)
const getProducts = async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = { isActive: { $ne: false } };

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      filter.category = { $regex: `^${category}$`, $options: "i" };
    }

    const products = await Product.find(filter)
      .populate("seller", SELLER_FIELDS)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products error:", error.message);
    return res.status(500).json({ message: "Failed to fetch products." });
  }
};

// Alias, supaya route lama yang pakai getAllProducts tetap jalan
const getAllProducts = getProducts;

// GET: produk milik seller yang login
const getMyProducts = async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.user.userId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get my products error:", error.message);
    return res
      .status(500)
      .json({ message: "Failed to fetch your products." });
  }
};

// GET: detail satu produk (publik)
const getProductById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: "Product not found." });
    }

    const product = await Product.findById(req.params.id).populate(
      "seller",
      SELLER_FIELDS
    );

    if (!product || product.isActive === false) {
      return res.status(404).json({ message: "Product not found." });
    }

    return res.status(200).json({ product });
  } catch (error) {
    console.error("Get product error:", error.message);
    return res.status(500).json({ message: "Failed to load product." });
  }
};

// POST: tambah produk (multipart/form-data, field gambar = "images")
const createProduct = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const description = (req.body.description || "").trim();
    const category = (req.body.category || "").trim();
    const price = Number(req.body.price);
    const stock = Number(req.body.stock);
    const discountPercentage = Number(req.body.discountPercentage || 0);

    if (!name || !description || !category) {
      return res.status(400).json({
        message: "Please fill in all required product fields.",
      });
    }

    if (!Number.isFinite(price) || price < 0) {
      return res.status(400).json({
        message: "Price must be a valid non-negative number.",
      });
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        message: "Stock must be a non-negative whole number.",
      });
    }

    if (
      !Number.isFinite(discountPercentage) ||
      discountPercentage < 0 ||
      discountPercentage > 100
    ) {
      return res.status(400).json({
        message: "Discount must be between 0 and 100.",
      });
    }

    const images = toImagePaths(req.files);

    if (images.length === 0) {
      return res.status(400).json({
        message: "Please upload at least one product image.",
      });
    }

    const product = await Product.create({
      seller: req.user.userId,
      name,
      description,
      price,
      category,
      stock,
      discountPercentage,
      images,
      image: images[0], // gambar utama, buat kompatibilitas data lama
    });

    return res.status(201).json({
      message: "Product created successfully.",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to create product." });
  }
};

// PUT: edit produk milik seller (hapus gambar lama + tambah gambar baru)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    // Hanya pemilik produk yang boleh mengedit
    const product = await Product.findOne({
      _id: id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you do not own this product.",
      });
    }

    const body = req.body;

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return res
          .status(400)
          .json({ message: "Product name cannot be empty." });
      }
      product.name = name;
    }

    if (body.description !== undefined) {
      const description = String(body.description).trim();
      if (!description) {
        return res
          .status(400)
          .json({ message: "Description cannot be empty." });
      }
      product.description = description;
    }

    if (body.category !== undefined) {
      const category = String(body.category).trim();
      if (!category) {
        return res
          .status(400)
          .json({ message: "Category cannot be empty." });
      }
      product.category = category;
    }

    if (body.price !== undefined) {
      const price = Number(body.price);
      if (!Number.isFinite(price) || price < 0) {
        return res.status(400).json({
          message: "Price must be a valid non-negative number.",
        });
      }
      product.price = price;
    }

    if (body.stock !== undefined) {
      const stock = Number(body.stock);
      if (!Number.isInteger(stock) || stock < 0) {
        return res.status(400).json({
          message: "Stock must be a non-negative whole number.",
        });
      }
      product.stock = stock;
    }

    if (body.discountPercentage !== undefined) {
      const discount = Number(body.discountPercentage);
      if (!Number.isFinite(discount) || discount < 0 || discount > 100) {
        return res.status(400).json({
          message: "Discount must be between 0 and 100.",
        });
      }
      product.discountPercentage = discount;
    }

    if (body.isActive !== undefined) {
      product.isActive = body.isActive === true || body.isActive === "true";
    }

    // Gambar: hapus yang dipilih seller, lalu tambah yang baru (maksimal 8)
    const newImages = toImagePaths(req.files);

    let removeList = [];
    if (body.removeImages) {
      try {
        const parsed = JSON.parse(body.removeImages);
        if (Array.isArray(parsed)) removeList = parsed.map(String);
      } catch {
        return res
          .status(400)
          .json({ message: "Invalid removeImages value." });
      }
    }

    let filesToDelete = [];

    if (newImages.length > 0 || removeList.length > 0) {
      const currentImages =
        Array.isArray(product.images) && product.images.length
          ? product.images
          : product.image
          ? [product.image]
          : [];

      // Hanya gambar milik produk ini yang boleh dihapus
      const toRemove = currentImages.filter((img) => removeList.includes(img));
      const remaining = currentImages.filter((img) => !toRemove.includes(img));
      const finalImages = [...remaining, ...newImages];

      if (finalImages.length === 0) {
        return res.status(400).json({
          message: "A product must have at least one image.",
        });
      }

      if (finalImages.length > MAX_IMAGES) {
        return res.status(400).json({
          message: `You can add a maximum of ${MAX_IMAGES} images per product.`,
        });
      }

      product.images = finalImages;
      product.image = finalImages[0];
      filesToDelete = toRemove;
    }

    await product.save();

    // Hapus file fisiknya setelah DB berhasil disimpan (abaikan kalau sudah tidak ada)
    for (const img of filesToDelete) {
      if (img.startsWith("/uploads/")) {
        fs.unlink(
          path.join(__dirname, "..", "uploads", path.basename(img)),
          () => {}
        );
      }
    }

    return res.status(200).json({
      message: "Product updated successfully.",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({ message: "Failed to update product." });
  }
};

// DELETE: hapus produk milik seller
const deleteProduct = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findOneAndDelete({
      _id: req.params.id,
      seller: req.user.userId,
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found or you do not own this product.",
      });
    }

    return res.status(200).json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete product error:", error.message);
    return res.status(500).json({ message: "Failed to delete product." });
  }
};

module.exports = {
  getProducts,
  getAllProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};