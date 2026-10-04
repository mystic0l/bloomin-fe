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
    const { name, type, address } = req.body;
    const owner_id = req.user.uid;

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

// UPDATE SHOP
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, address } = req.body;

    // Check that the authenticated user owns this shop
    const shopResult = await pool.query(
      `SELECT id, image_url
       FROM shops
       WHERE id = $1
         AND owner_id = $2`,
      [Number(id), req.user.uid]
    );

    if (shopResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not allowed to update this shop",
      });
    }

    const existingShop = shopResult.rows[0];

    let imageUrl = existingShop.image_url;

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const result = await pool.query(
      `UPDATE shops
       SET name = $1,
           type = $2,
           address = $3,
           image_url = $4
       WHERE id = $5
       RETURNING *`,
      [
        name,
        type,
        address,
        imageUrl,
        Number(id),
      ]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE SHOP ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;