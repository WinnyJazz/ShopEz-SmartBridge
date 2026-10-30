const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  uploadPaymentProof,
  getPaymentProof,
  getSellerAnalytics,
  getSellerOrders,
  reviewPayment,
  updateOrderStatus,
} = require("../controllers/orderController");

const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");
const { uploadProofImage } = require("../middleware/proofUpload");

// Buyer
router.post("/", authMiddleware, createOrder);

// "/mine" dan "/seller/mine" harus di atas "/:id"
router.get("/mine", authMiddleware, getMyOrders);
router.get("/seller/analytics", authMiddleware, sellerMiddleware, getSellerAnalytics);
router.get("/seller/mine", authMiddleware, sellerMiddleware, getSellerOrders);

router.get("/:id", authMiddleware, getOrderById);
router.put("/:id/cancel", authMiddleware, cancelOrder);

// Bukti pembayaran (authMiddleware harus sebelum upload)
router.post("/:id/proof", authMiddleware, uploadProofImage, uploadPaymentProof);
router.get("/:id/proof", authMiddleware, getPaymentProof);

// Seller
router.put("/:id/payment", authMiddleware, sellerMiddleware, reviewPayment);
router.put("/:id/status", authMiddleware, sellerMiddleware, updateOrderStatus);

module.exports = router;