const User = require("../models/User");

exports.getMyShopProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .select("name email role shopName shopDescription shopImage");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage a shop."
      });
    }

    return res.json({
      success: true,
      shop: {
        shopName: user.shopName || "",
        shopDescription: user.shopDescription || "",
        shopImage: user.shopImage || ""
      }
    });
  } catch (error) {
    console.error("Get shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load shop profile."
    });
  }
};

exports.updateMyShopProfile = async (req, res) => {
  try {
    const { shopName, shopDescription, shopImage } = req.body;

    if (
      typeof shopName !== "string" ||
      typeof shopDescription !== "string" ||
      typeof shopImage !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid shop profile data."
      });
    }

    const name = shopName.trim();
    const description = shopDescription.trim();
    const image = shopImage.trim();

    if (!name || name.length > 100) {
      return res.status(400).json({
        success: false,
        message: "Shop name must contain 1–100 characters."
      });
    }

    if (description.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Shop description cannot exceed 1000 characters."
      });
    }

    // Validate Base64 image, maximum approximately 500 KB.
    const validImage =
      !image ||
      (
        /^data:image\/(jpeg|png|webp);base64,/.test(image) &&
        image.length <= 700_000
      );

    if (!validImage) {
      return res.status(400).json({
        success: false,
        message:
          "Shop image must be JPG, PNG, or WebP and no larger than 500 KB."
      });
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    if (user.role !== "seller") {
      return res.status(403).json({
        success: false,
        message: "Only sellers can manage a shop."
      });
    }

    user.shopName = name;
    user.shopDescription = description;
    user.shopImage = image;

    await user.save();

    return res.json({
      success: true,
      message: "Shop profile updated successfully.",
      shop: {
        shopName: user.shopName,
        shopDescription: user.shopDescription,
        shopImage: user.shopImage
      }
    });
  } catch (error) {
    console.error("Update shop profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shop profile."
    });
  }
};
