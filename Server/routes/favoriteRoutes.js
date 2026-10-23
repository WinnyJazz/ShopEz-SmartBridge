
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getFavorites,
  getFavoriteIds,
  addFavorite,
  removeFavorite,
} = require("../controllers/favoriteController");

// Semua route favorites membutuhkan autentikasi.
router.use(authMiddleware);

// Ambil daftar produk favorit.
router.get("/", getFavorites);

// Ambil ID produk favorit.
// Letakkan sebelum route /:productId.
router.get("/ids", getFavoriteIds);

// Tambahkan produk ke favorit.
router.post("/:productId", addFavorite);

// Hapus produk dari favorit.
router.delete("/:productId", removeFavorite);

module.exports = router;
