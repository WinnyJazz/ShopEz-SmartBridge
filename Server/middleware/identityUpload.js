const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Folder PRIVAT: jangan pernah di-serve lewat express.static
const IDENTITY_DIR = path.join(__dirname, "..", "private-uploads", "ktp");

fs.mkdirSync(IDENTITY_DIR, { recursive: true });

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, IDENTITY_DIR),
  filename: (req, file, callback) => {
    const userId = req.user?.userId || "unknown";
    const random = crypto.randomBytes(4).toString("hex");
    callback(
      null,
      `${userId}-${Date.now()}-${random}${EXTENSIONS[file.mimetype]}`
    );
  },
});

const fileFilter = (req, file, callback) => {
  if (!EXTENSIONS[file.mimetype]) {
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
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },
});

// Bungkus supaya error upload jadi 400 dengan pesan jelas, bukan 500
const uploadIdentityPhoto = (req, res, next) => {
  upload.single("identityPhoto")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: "KTP photo must be 5 MB or smaller.",
        LIMIT_FILE_COUNT: "Upload only one KTP photo.",
        LIMIT_UNEXPECTED_FILE: "Unexpected upload field. Use 'identityPhoto'.",
      };

      return res.status(400).json({
        success: false,
        message: messages[error.code] || error.message,
      });
    }

    return res.status(400).json({ success: false, message: error.message });
  });
};

module.exports = { IDENTITY_DIR, uploadIdentityPhoto };