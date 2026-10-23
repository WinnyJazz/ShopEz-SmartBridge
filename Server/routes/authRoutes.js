const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getSession,
} = require("../controllers/authController");
const { updateMyProfileImage } = require("../controllers/profileController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected routes
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated!",
    user: req.user,
  });
});

router.get("/session", authMiddleware, getSession);
router.put("/profile-image", authMiddleware, updateMyProfileImage);

module.exports = router;