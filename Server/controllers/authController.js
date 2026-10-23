const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { promoteIfApproved } = require("../utils/sellerPromotion");

// SIGN UP
const registerUser = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email, and password are required.",
      });
    }

    // Validate password length
    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    // Validate password confirmation if provided
    if (
      confirmPassword !== undefined &&
      password !== confirmPassword
    ) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check whether email is already registered
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // New registrations are buyers by default
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: "buyer",
    });

    return res.status(201).json({
      message: "Account created successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "Email is already registered.",
      });
    }

    console.error("Register error:", error.message);

    return res.status(500).json({
      message: "Failed to create account.",
    });
  }
};

// LOG IN
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured.");
    }

    // Kalau aplikasi seller sudah di-approve lewat MongoDB, role ikut naik
    await promoteIfApproved(user);

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role || "buyer",
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "buyer",
        profileImage: user.profileImage || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    return res.status(500).json({
      message: "Failed to log in.",
    });
  }
};

// SESSION
// Sinkronkan role & foto profil dengan database. Token baru HANYA diberikan
// kalau role berubah (misalnya baru di-approve jadi seller).
const getSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(401).json({
        message: "Account not found. Please log in again.",
      });
    }

    await promoteIfApproved(user);

    const currentRole = user.role || "buyer";
    const roleChanged = (req.user.role || "buyer") !== currentRole;

    let token;

    if (roleChanged) {
      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured.");
      }

      token = jwt.sign(
        {
          userId: user._id.toString(),
          role: currentRole,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );
    }

    return res.status(200).json({
      token, // undefined kalau role nggak berubah
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: currentRole,
        profileImage:
          user.profileImage ||
          (currentRole === "seller" ? user.shopImage || "" : ""),
      },
    });
  } catch (error) {
    console.error("Session error:", error.message);

    return res.status(500).json({
      message: "Failed to load session.",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getSession,
};