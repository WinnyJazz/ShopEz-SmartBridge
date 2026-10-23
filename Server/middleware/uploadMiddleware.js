const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const uploadDir = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    callback(
      null,
      `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`
    );
  },
});

const fileFilter = (req, file, callback) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    return callback(
      new Error("Only JPG, PNG, and WebP images are allowed.")
    );
  }

  callback(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // Maksimal 5 MB per file
    files: 8, // Maksimal 8 gambar per request
  },
});

// Bungkus supaya error upload jadi 400 dengan pesan jelas, bukan 500
const uploadProductImages = (req, res, next) => {
  upload.array("images", 8)(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: "Each image must be 5 MB or smaller.",
        LIMIT_FILE_COUNT: "You can upload a maximum of 8 images.",
        LIMIT_UNEXPECTED_FILE: "Unexpected upload field. Use 'images'.",
      };

      return res.status(400).json({
        message: messages[error.code] || error.message,
      });
    }

    return res.status(400).json({ message: error.message });
  });
};

module.exports = upload;
module.exports.uploadProductImages = uploadProductImages;