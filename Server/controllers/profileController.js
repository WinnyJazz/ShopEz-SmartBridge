const User = require("../models/User");
const bcrypt = require("bcryptjs");

// PUT /api/auth/profile-image
// Memperbarui foto profil user yang sedang login.
exports.updateMyProfileImage = async (req, res) => {
  try {
    const { profileImage } = req.body;

    if (typeof profileImage !== "string") {
      return res.status(400).json({
        success: false,
        message: "Profile image is required.",
      });
    }

    const image = profileImage.trim();

    // Validasi format gambar dan ukuran maksimal sekitar 500 KB.
    const validImage =
      !image ||
      (/^data:image\/(jpeg|png|webp);base64,/.test(image) &&
        image.length <= 700_000);

    if (!validImage) {
      return res.status(400).json({
        success: false,
        message:
          "Profile image must be JPG, PNG, or WebP and no larger than 500 KB.",
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    user.profileImage = image;

    // Untuk seller, foto profil juga menjadi foto toko.
    if (user.role === "seller") {
      user.shopImage = image;
    }

    await user.save();

    return res.json({
      success: true,
      message: "Profile photo updated successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage || "",
        ...(user.role === "seller" && { shopImage: user.shopImage || "" }),
      },
    });
  } catch (error) {
    console.error("Update profile image error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update profile photo.",
    });
  }
};

// PUT /api/auth/email
// Mengubah email akun setelah memverifikasi password saat ini.
exports.updateMyEmail = async (req, res) => {
  try {
    const { email, currentPassword } = req.body;

    if (
      typeof email !== "string" ||
      typeof currentPassword !== "string" ||
      !currentPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Email and current password are required.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (user.email === normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "That is already your current email address.",
      });
    }

    user.email = normalizedEmail;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Email address updated successfully.",
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
        success: false,
        message: "Email is already registered.",
      });
    }

    console.error("Update email error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update email address.",
    });
  }
};

// PUT /api/auth/password
// Mengubah password setelah memverifikasi password saat ini.
exports.updateMyPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string" ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All password fields are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters.",
      });
    }

    if (Buffer.byteLength(newPassword, "utf8") > 72) {
      return res.status(400).json({
        success: false,
        message: "New password must be no more than 72 bytes.",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match.",
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const passwordMatches = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!passwordMatches) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    if (await bcrypt.compare(newPassword, user.password)) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from your current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("Update password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update password.",
    });
  }
};