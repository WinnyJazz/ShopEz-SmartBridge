const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");

router.get("/", getProducts);
router.post("/", authMiddleware, createProduct);

module.exports = router;