const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");

// Buyer maupun seller boleh melihat katalog
router.get("/", getProducts);

// Hanya seller yang boleh menambahkan produk
router.post(
  "/",
  authMiddleware,
  sellerMiddleware,
  createProduct
);

module.exports = router;
