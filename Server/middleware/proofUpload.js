const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

// Folder PRIVAT: jangan pernah di-serve lewat express.static
const PROOF_DIR = path.join(__dirname, "..", "private-uploads", "payment-proofs");

fs.mkdirSync(PROOF_DIR, { recursive: true });

const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, PROOF_DIR),
  filename: (req, file, callback) => {
    const orderId = String(req.params.id || "order").replace(/[^a-f0-9]/gi, "");
    const random = crypto.randomBytes(4).toString("hex");
    callback(
      null,
      `${orderId}-${Date.now()}-${random}${EXTENSIONS[file.mimetype]}`
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
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

const uploadProofImage = (req, res, next) => {
  upload.single("proof")(req, res, (error) => {
    if (!error) return next();

    if (error instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: "Payment proof must be 5 MB or smaller.",
        LIMIT_FILE_COUNT: "Upload only one payment proof.",
        LIMIT_UNEXPECTED_FILE: "Unexpected upload field. Use 'proof'.",
      };

      return res.status(400).json({
        message: messages[error.code] || error.message,
      });
    }

    return res.status(400).json({ message: error.message });
  });
};

module.exports = { PROOF_DIR, uploadProofImage };