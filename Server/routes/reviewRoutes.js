
const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getProductReviews,
  createOrUpdateReview,
} = require("../controllers/reviewController");

// Public: melihat review produk
router.get("/:productId", getProductReviews);

// Protected: buyer mengirim atau memperbarui review
router.post("/:productId", authMiddleware, createOrUpdateReview);

module.exports = router;
