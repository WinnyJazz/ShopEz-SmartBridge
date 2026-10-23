const fs = require("fs");
const path = require("path");
const User = require("../models/User");
const SellerApplication = require("../models/SellerApplication");
const { IDENTITY_DIR } = require("../middleware/identityUpload");

function removeIdentityFile(filename) {
  if (!filename) return;
  fs.unlink(path.join(IDENTITY_DIR, path.basename(filename)), () => {});
}

// Jangan kirim nama file KTP ke client
function toPublicApplication(application) {
  if (!application) return null;

  return {
    status: application.status,
    shopName: application.shopName,
    shopDescription: application.shopDescription,
    fullName: application.fullName,
    reviewNote: application.reviewNote || "",
    submittedAt: application.submittedAt,
  };
}

// POST /api/shop/apply  (multipart/form-data, field foto = "identityPhoto")
exports.applyForSeller = async (req, res) => {
  const fail = (status, message) => {
    if (req.file) removeIdentityFile(req.file.filename);
    return res.status(status).json({ success: false, message });
  };

  try {
    const shopName = String(req.body.shopName || "").trim();
    const shopDescription = String(req.body.shopDescription || "").trim();
    const fullName = String(req.body.fullName || "").trim();

    if (!shopName || shopName.length > 100) {
      return fail(400, "Shop name must contain 1–100 characters.");
    }

    if (shopDescription.length > 1000) {
      return fail(400, "Shop description cannot exceed 1000 characters.");
    }

    if (!fullName || fullName.length > 150) {
      return fail(400, "Enter your full name as shown on your KTP.");
    }

    if (!req.file) {
      return fail(400, "Please upload a photo of your KTP.");
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
      return fail(404, "User not found.");
    }

    if (user.role === "seller") {
      return fail(409, "Your account is already a seller account.");
    }

    const existing = await SellerApplication.findOne({ user: user._id });

    if (existing && existing.status === "pending") {
      return fail(409, "You already have an application waiting for review.");
    }

    if (existing && existing.status === "approved") {
      return fail(
        409,
        "Your application is already approved. Open your profile again to activate seller access."
      );
    }

    let application;

    if (existing) {
      // Sebelumnya ditolak: kirim ulang, ganti data dan foto lama
      const oldPhoto = existing.identityPhoto;

      existing.set({
        shopName,
        shopDescription,
        fullName,
        identityPhoto: req.file.filename,
        status: "pending",
        reviewNote: "",
        reviewedAt: null,
        submittedAt: new Date(),
      });

      application = await existing.save();
      removeIdentityFile(oldPhoto);
    } else {
      application = await SellerApplication.create({
        user: user._id,
        shopName,
        shopDescription,
        fullName,
        identityPhoto: req.file.filename,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Your seller application has been submitted for review.",
      application: toPublicApplication(application),
    });
  } catch (error) {
    console.error("Seller application error:", error);

    if (req.file) removeIdentityFile(req.file.filename);

    return res.status(500).json({
      success: false,
      message: "Failed to submit seller application.",
    });
  }
};

// GET /api/shop/application/me  (application = null kalau belum pernah apply)
exports.getMyApplication = async (req, res) => {
  try {
    const application = await SellerApplication.findOne({
      user: req.user.userId,
    });

    return res.json({
      success: true,
      application: toPublicApplication(application),
    });
  } catch (error) {
    console.error("Get application error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to load seller application.",
    });
  }
};