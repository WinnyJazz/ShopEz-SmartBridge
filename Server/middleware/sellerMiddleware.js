const User = require("../models/User");

const sellerMiddleware = async (req, res, next) => {
  try {
    // authMiddleware harus dijalankan sebelumnya
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    // Periksa role terbaru dari database
    const user = await User.findById(userId).select("role");

    if (!user) {
      return res.status(401).json({
        message: "User account not found.",
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        message: "Access denied. Sellers only.",
      });
    }

    next();
  } catch (error) {
    console.error("Seller middleware error:", error.message);

    return res.status(500).json({
      message: "Failed to verify seller access.",
    });
  }
};

module.exports = sellerMiddleware;
