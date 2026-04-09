const express = require("express");
const router = express.Router();
const pool = require("../config/db");

router.post("/create", async (req, res) => {
  const client = await pool.connect();

  try {
    const { customer_name, phone, address, total_amount, items } = req.body;

    await client.query("BEGIN");

    const orderResult = await client.query(
      "INSERT INTO orders (customer_name, phone, address, total_amount) VALUES ($1, $2, $3, $4) RETURNING *",
      [customer_name, phone, address, total_amount]
    );

    const orderId = orderResult.rows[0].id;

    for (let item of items) {
      await client.query(
        "INSERT INTO order_items (order_id, product_name, quantity, price, subtotal) VALUES ($1, $2, $3, $4, $5)",
        [orderId, item.product_name, item.quantity, item.price, item.subtotal]
      );
    }

    await client.query("COMMIT");

    res.json(orderResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;