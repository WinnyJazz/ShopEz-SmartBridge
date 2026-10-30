const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { promoteIfApproved } = require("../utils/sellerPromotion");

const requestPasswordReset = async (req, res) => {
  try {
    const { email, recoveryEmail } = req.body;

    if (
      typeof email !== "string" ||
      email.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    ) {
      return res.status(400).json({
        message: "Enter a valid email address.",
      });
    }

    if (
      typeof recoveryEmail !== "string" ||
      recoveryEmail.trim().length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail.trim())
    ) {
      return res.status(400).json({
        message: "Enter a valid recovery email address.",
      });
    }

    const { EMAIL_USER, EMAIL_PASS, CLIENT_URL } = process.env;
    if (!EMAIL_USER || !EMAIL_PASS || !CLIENT_URL) {
      throw new Error("EMAIL_USER, EMAIL_PASS, and CLIENT_URL must be configured.");
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      console.warn("Password reset skipped: no matching ShopEZ account.");
      if (process.env.NODE_ENV !== "production") {
        return res.status(404).json({
          message:
            "Email akun ShopEZ tidak ditemukan. Pastikan akun sudah terdaftar di database yang dipakai server ini.",
        });
      }
    } else {
      const resetToken = crypto.randomBytes(32).toString("hex");
      user.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const resetUrl = new URL("/reset-password", CLIENT_URL);
      resetUrl.searchParams.set("token", resetToken);

      try {
        const transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
          },
        });

        const result = await transporter.sendMail({
          from: EMAIL_USER,
          to: recoveryEmail.trim(),
          subject: "Reset your ShopEZ password",
          text: `Use this link to reset the password for the ShopEZ account ${user.email}. The link expires in 15 minutes:\n\n${resetUrl.toString()}`,
          html: `<p>Use the link below to reset your ShopEZ password. The link expires in 15 minutes.</p><p><a href="${resetUrl.toString()}">Reset password</a></p>`,
        });

        const acceptedAddresses = result.accepted.map((address) =>
          typeof address === "string" ? address : address.address
        );
        const recipientAccepted = acceptedAddresses.some(
          (address) =>
            address?.toLowerCase() === recoveryEmail.trim().toLowerCase()
        );
        if (!recipientAccepted) {
          throw new Error("SMTP server did not accept the recovery recipient.");
        }

        console.info("Password reset email accepted by Gmail SMTP.");
      } catch (error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();
        throw error;
      }
    }

    return res.status(200).json({
      message:
        "If an account exists for that email, password reset instructions will be sent to the recovery email.",
    });
  } catch (error) {
    console.error("Request password reset error:", error);
    return res.status(500).json({
      message: "Unable to process the password reset request.",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (
      typeof token !== "string" ||
      !/^[a-f0-9]{64}$/i.test(token) ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        message: "A valid reset token and both password fields are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        message: "Password must be no more than 72 bytes.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Passwords do not match.",
      });
    }

    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "This password reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      message: "Failed to reset password.",
    });
  }
};

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
  requestPasswordReset,
  resetPassword,
  registerUser,
  loginUser,
  getSession,
};