const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);

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
