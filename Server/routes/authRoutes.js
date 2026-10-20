const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
} = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected route
router.get("/me", authMiddleware, (req, res) => {
  res.status(200).json({
    message: "You are authenticated!",
    user: req.user,
  });
});

module.exports = router;
