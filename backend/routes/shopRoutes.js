const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "shop-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// CREATE SHOP (supports optional image upload)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, type, address, owner_id } = req.body;

    let imageUrl = null;
    if (req.file) {
      // Build a publicly accessible URL for the uploaded file
      imageUrl = `/uploads/${req.file.filename}`;
    }
    console.log("BODY:", req.body);

    const result = await pool.query(
      "INSERT INTO shops (name, type, address, owner_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, type, address, owner_id, imageUrl]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL SHOPS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM shops");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;