
const mongoose = require("mongoose");
const Review = require("../models/Review");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET: Ambil semua review untuk satu produk
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    const reviews = await Review.find({ product: productId })
      .populate("buyer", "name profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Get product reviews error:", error.message);

    return res.status(500).json({
      message: "Failed to load product reviews.",
    });
  }
};

// POST: Pembeli dengan order selesai memberikan atau memperbarui review.
const createOrUpdateReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { rating, comment = "" } = req.body;

    // Validasi ID produk
    if (!mongoose.isValidObjectId(productId)) {
      return res.status(400).json({
        message: "Invalid product ID.",
      });
    }

    if (!mongoose.isValidObjectId(req.user.userId)) {
      return res.status(403).json({
        message: "A valid user session is required to review products.",
      });
    }

    // Validasi rating
    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be a whole number from 1 to 5.",
      });
    }

    if (
      typeof comment !== "string" ||
      comment.trim().length > 1000
    ) {
      return res.status(400).json({
        message: "Comment must not exceed 1000 characters.",
      });
    }

    // Pastikan produk tersedia
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    // Akun apa pun hanya bisa review jika memiliki order completed
    // yang mencakup produk ini.
    const completedOrder = await Order.findOne({
      buyer: req.user.userId,
      status: "completed",
      "items.product": productId,
    });

    if (!completedOrder) {
      return res.status(403).json({
        message:
          "You can only review products from completed orders.",
      });
    }

    // Satu buyer hanya memiliki satu review per produk.
    // Jika sudah ada, rating dan komentar diperbarui.
    const review = await Review.findOneAndUpdate(
      {
        product: productId,
        buyer: req.user.userId,
      },
      {
        $set: {
          rating,
          comment: comment.trim(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    // Hitung ulang rata-rata dan jumlah review.
    const summary = await Review.aggregate([
      {
        $match: {
          product: new mongoose.Types.ObjectId(productId),
        },
      },
      {
        $group: {
          _id: "$product",
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const averageRating =
      summary.length > 0 ? summary[0].averageRating : 0;

    const totalReviews =
      summary.length > 0 ? summary[0].totalReviews : 0;

    await Product.findByIdAndUpdate(productId, {
      $set: {
        rating: Math.round(averageRating * 10) / 10,
        numReviews: totalReviews,
      },
    });

    return res.status(200).json({
      message: "Review saved successfully.",
      review,
      rating: Math.round(averageRating * 10) / 10,
      numReviews: totalReviews,
    });
  } catch (error) {
    console.error("Create/update review error:", error.message);

    return res.status(500).json({
      message: "Failed to save review.",
    });
  }
};

// GET: Ambil semua review milik user yang sedang login
const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({
        message: "A valid user session is required.",
      });
    }

    const reviews = await Review.find({ buyer: userId })
      .populate({
        path: "product",
        select: "name title price images image category seller",
        populate: {
          path: "seller",
          select: "name shopName shopImage profileImage shopLocation",
        },
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      reviews,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Get my reviews error:", error.message);

    return res.status(500).json({
      message: "Failed to load your reviews.",
    });
  }
};

module.exports = {
  getProductReviews,
  createOrUpdateReview,
  getMyReviews,
};