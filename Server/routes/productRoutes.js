const express = require("express");
const router = express.Router();

const { uploadProductImages } = require("../middleware/uploadMiddleware");

const {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const authMiddleware = require("../middleware/authMiddleware");
const sellerMiddleware = require("../middleware/sellerMiddleware");

// Katalog publik
router.get("/", getProducts);

// Fitur khusus seller ("/mine" harus di atas "/:id")
router.get("/mine", authMiddleware, sellerMiddleware, getMyProducts);

// Detail produk publik
router.get("/:id", getProductById);

router.post(
  "/",
  authMiddleware,
  sellerMiddleware,
  uploadProductImages,
  createProduct
);
router.put(
  "/:id",
  authMiddleware,
  sellerMiddleware,
  uploadProductImages,
  updateProduct
);
router.delete("/:id", authMiddleware, sellerMiddleware, deleteProduct);

module.exports = router;