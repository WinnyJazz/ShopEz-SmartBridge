const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProductReviews,
  createOrUpdateReview,
  getMyReviews,
} = require("../controllers/reviewController");

// Protected: review milik user yang sedang login
// Letakkan sebelum /:productId agar "mine" tidak dianggap sebagai productId.
router.get("/mine", authMiddleware, getMyReviews);

// Public: semua review untuk satu produk
router.get("/:productId", getProductReviews);

// Protected: membuat atau memperbarui review produk
router.post("/:productId", authMiddleware, createOrUpdateReview);

module.exports = router;