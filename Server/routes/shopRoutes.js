const express = require("express");
const router = express.Router();

const {
  getMyShopProfile,
  updateMyShopProfile,
} = require("../controllers/shopController");
const {
  applyForSeller,
  getMyApplication,
} = require("../controllers/sellerApplicationController");

const authMiddleware = require("../middleware/authMiddleware");
const { uploadIdentityPhoto } = require("../middleware/identityUpload");

// Profil toko (khusus seller)
router.get("/me", authMiddleware, getMyShopProfile);
router.put("/me", authMiddleware, updateMyShopProfile);

// Pengajuan jadi seller (authMiddleware harus sebelum upload)
router.get("/application/me", authMiddleware, getMyApplication);
router.post("/apply", authMiddleware, uploadIdentityPhoto, applyForSeller);

module.exports = router;