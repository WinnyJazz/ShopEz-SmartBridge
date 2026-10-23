const User = require("../models/User");

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