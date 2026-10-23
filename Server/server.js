const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const shopRoutes = require("./routes/shopRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shop", shopRoutes);
app.get("/api/shop/test", (req, res) => {
  res.json({ success: true, message: "Shop route works!" });
});
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ShopEZ API is running!",
  });
});

// Connect to MongoDB, then start the server
const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`ShopEZ server running on http://localhost:${PORT}`);
  });
};

startServer();
