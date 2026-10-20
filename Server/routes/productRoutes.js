const express = require("express");
const router = express.Router();

const {
  getProducts,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");

// Katalog publik
router.get("/", getProducts);

// Fitur khusus seller
router.get("/mine", authMiddleware, sellerMiddleware, getMyProducts);
router.post("/", authMiddleware, sellerMiddleware, createProduct);
router.put("/:id", authMiddleware, sellerMiddleware, updateProduct);
router.delete("/:id", authMiddleware, sellerMiddleware, deleteProduct);

module.exports = router;
