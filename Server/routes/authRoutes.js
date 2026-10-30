const express = require("express");
const router = express.Router();

const {
  requestPasswordReset,
  resetPassword,
  registerUser,
  loginUser,
  getSession,
} = require("../controllers/authController");
const {
  updateMyProfileImage,
  updateMyEmail,
  updateMyPassword,
} = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password", requestPasswordReset);
router.post("/reset-password", resetPassword);

// Protected routes
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated!",
    user: req.user,
  });
});

router.get("/session", authMiddleware, getSession);
router.put("/profile-image", authMiddleware, updateMyProfileImage);
router.put("/email", authMiddleware, updateMyEmail);
router.put("/password", authMiddleware, updateMyPassword);

module.exports = router;