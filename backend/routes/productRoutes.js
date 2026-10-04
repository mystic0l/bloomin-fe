const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE PRODUCT
router.post("/", async (req, res) => {
  console.log("BODY RECEIVED:", req.body);

  try {
    const {
      name,
      price,
      quantity,
      shop_id,
      flavor,
      image_url,
    } = req.body;

    // Check that the authenticated user owns this shop
    const shopResult = await pool.query(
      "SELECT id FROM shops WHERE id = $1 AND owner_id = $2",
      [Number(shop_id), req.user.uid]
    );

    if (shopResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not allowed to add products to this shop",
      });
    }

    const result = await pool.query(
      "INSERT INTO products (name, price, quantity, shop_id, flavor, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [name, price, quantity, shop_id, flavor, image_url]
    );

    console.log("INSERTED:", result.rows[0]);

    res.json(result.rows[0]);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET PRODUCTS BY SHOP
router.get("/:shopId", async (req, res) => {
  try {
    const { shopId } = req.params;

    const result = await pool.query(
      "SELECT * FROM products WHERE shop_id = $1",
      [Number(shopId)]
    );

    res.json(result.rows);
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// UPDATE PRODUCT
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      quantity,
      flavor,
      image_url,
    } = req.body;

    // Check that the authenticated user owns the shop
    // that this product belongs to.
    const productResult = await pool.query(
      `SELECT p.id
       FROM products p
       INNER JOIN shops s ON p.shop_id = s.id
       WHERE p.id = $1
         AND s.owner_id = $2`,
      [Number(id), req.user.uid]
    );

    if (productResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not allowed to update this product",
      });
    }

    const result = await pool.query(
      `UPDATE products
       SET name = $1,
           price = $2,
           quantity = $3,
           flavor = $4,
           image_url = $5
       WHERE id = $6
       RETURNING *`,
      [name, price, quantity, flavor, image_url, Number(id)]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE PRODUCT
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check that the authenticated user owns the shop
    // that this product belongs to.
    const productResult = await pool.query(
      `SELECT p.id
       FROM products p
       INNER JOIN shops s ON p.shop_id = s.id
       WHERE p.id = $1
         AND s.owner_id = $2`,
      [Number(id), req.user.uid]
    );

    if (productResult.rows.length === 0) {
      return res.status(403).json({
        error: "You are not allowed to delete this product",
      });
    }

    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [Number(id)]
    );

    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("DELETE PRODUCT ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;