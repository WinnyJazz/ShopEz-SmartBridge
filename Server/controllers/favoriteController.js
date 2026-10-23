const mongoose = require("mongoose");
const Favorite = require("../models/Favorite");
const Product = require("../models/Product");

// GET: daftar produk favorit milik user yang login
const getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .populate({
        path: "product",
        select:
          "name price category image images discountPercentage rating numReviews stock isActive createdAt",
      });

    // Buang produk yang sudah dihapus / dinonaktifkan seller
    const products = favorites
      .map((fav) => fav.product)
      .filter((product) => product && product.isActive !== false);

    return res.status(200).json({
      success: true,
      count: products.length,
      favorites: products,
    });
  } catch (error) {
    console.error("Get favorites error:", error.message);
    return res.status(500).json({ message: "Failed to fetch favorites." });
  }
};

// GET: hanya id produk favorit (untuk status ikon hati di katalog/home)
const getFavoriteIds = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.userId }).select(
      "product"
    );

    return res.status(200).json({
      ids: favorites.map((fav) => fav.product.toString()),
    });
  } catch (error) {
    console.error("Get favorite ids error:", error.message);
    return res.status(500).json({ message: "Failed to fetch favorites." });
  }
};

// POST: tambah ke favorit (idempotent, aman kalau diklik dua kali)
const addFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    const product = await Product.findById(productId).select("isActive");

    if (!product || product.isActive === false) {
      return res.status(404).json({ message: "Product not found." });
    }

    await Favorite.findOneAndUpdate(
      { user: req.user.userId, product: productId },
      { $setOnInsert: { user: req.user.userId, product: productId } },
      { upsert: true, new: true }
    );

    return res.status(201).json({ message: "Added to favorites." });
  } catch (error) {
    console.error("Add favorite error:", error.message);
    return res.status(500).json({ message: "Failed to add favorite." });
  }
};

// DELETE: hapus dari favorit
const removeFavorite = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({ message: "Invalid product ID." });
    }

    await Favorite.deleteOne({
      user: req.user.userId,
      product: productId,
    });

    return res.status(200).json({ message: "Removed from favorites." });
  } catch (error) {
    console.error("Remove favorite error:", error.message);
    return res.status(500).json({ message: "Failed to remove favorite." });
  }
};

module.exports = {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
};