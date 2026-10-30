const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const shopRoutes = require("./routes/shopRoutes");
const orderRoutes = require("./routes/orderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: "1mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/chats", require("./routes/chatRoutes"));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json({ limit: "2mb" }));
app.use("/api/favorites", require("./routes/favoriteRoutes"));
app.use("/api/reviews", reviewRoutes);

// Test route
app.get("/", (req, res) => {
  res.json({
    message: "ShopEZ API is running!",
  });
});

app.get("/api/reviews/test", (req, res) => {
  res.json({
    success: true,
    message: "Review route works!",
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
