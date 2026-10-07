const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const multer = require("multer");
const {
  uploadImage,
  getImageUrl,
  deleteImage,
} = require("../config/storage");

const upload = multer({
  storage: multer.memoryStorage(),
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

    let imageKey = null;

    if (req.file) {
      imageKey = `shops/${req.user.uid}/${Date.now()}-${req.file.originalname}`;

      await uploadImage(req.file, imageKey);
    }
    console.log("BODY:", req.body);

    const result = await pool.query(
      "INSERT INTO shops (name, type, address, owner_id, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, type, address, owner_id, imageKey]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET ALL SHOPS
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, type, address, image_url
       FROM shops`
    );

    const shops = await Promise.all(
      result.rows.map(async (shop) => ({
        ...shop,
        image_url: await getImageUrl(shop.image_url),
      }))
    );

    res.json(shops);
  } catch (err) {
    console.error("GET SHOPS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET CURRENT USER'S SHOP
router.get("/my-shop", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, type, address, image_url
       FROM shops
       WHERE owner_id = $1`,
      [req.user.uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Shop not found" });
    }

    const shop = result.rows[0];

    shop.image_url = await getImageUrl(shop.image_url);

    res.json(shop);
  } catch (err) {
    console.error("GET MY SHOP ERROR:", err);
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

    let imageKey = existingShop.image_url;

    if (req.file) {
      imageKey = `shops/${req.user.uid}/${Date.now()}-${req.file.originalname}`;

      await uploadImage(req.file, imageKey);

      if (existingShop.image_url) {
        await deleteImage(existingShop.image_url);
      }
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
        imageKey,
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