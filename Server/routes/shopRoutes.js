const express = require("express");
const router = express.Router();

const {
  getPublicShop,
  getMyShopProfile,
  updateMyShopProfile,
  getMyPaymentSettings,
  updateMyPaymentSettings,
} = require("../controllers/shopController");

const {
  applyForSeller,
  getMyApplication,
} = require("../controllers/sellerApplicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadIdentityPhoto } = require("../middleware/identityUpload");

// Profil toko
router.get("/me", authMiddleware, getMyShopProfile);
router.put("/me", authMiddleware, updateMyShopProfile);

// Pengaturan pembayaran toko
router.get("/payment", authMiddleware, getMyPaymentSettings);
router.put("/payment", authMiddleware, updateMyPaymentSettings);

// Pengajuan menjadi seller
router.get("/application/me", authMiddleware, getMyApplication);
router.post("/apply", authMiddleware, uploadIdentityPhoto, applyForSeller);

router.get("/test", (req, res) => {
  res.json({ success: true, message: "Shop route works!" });
});

// Public shop page; keep after static shop routes.
router.get("/:sellerId", getPublicShop);

module.exports = router;
