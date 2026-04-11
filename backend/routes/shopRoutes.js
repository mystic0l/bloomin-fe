const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE SHOP
router.post("/", async (req, res) => {
  try {
    const { name, type, address, owner_id } = req.body;

    const result = await pool.query(
      "INSERT INTO shops (name, type, address, owner_id) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, type, address, owner_id]
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