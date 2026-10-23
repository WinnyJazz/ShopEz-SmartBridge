const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getMyShopProfile,
  updateMyShopProfile
} = require("../controllers/shopController");

router.get("/me", authMiddleware, getMyShopProfile);
router.put("/me", authMiddleware, updateMyShopProfile);

module.exports = router;
