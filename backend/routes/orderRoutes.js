const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE ORDER
router.post("/create", async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      customer_name,
      phone,
      address,
      total_amount,
      items,
      shop_id,
    } = req.body;

    // The customer identity comes from Firebase, not the client.
    const customer_uid = req.user.uid;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "Order must contain at least one item",
      });
    }

    // Verify that the shop exists.
    const shopResult = await client.query(
      "SELECT id FROM shops WHERE id = $1",
      [Number(shop_id)]
    );

    if (shopResult.rows.length === 0) {
      return res.status(404).json({
        error: "Shop not found",
      });
    }

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders
        (customer_name, phone, address, total_amount, shop_id, customer_uid)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        customer_name,
        phone,
        address,
        total_amount,
        shop_id,
        customer_uid,
      ]
    );

    const orderId = orderResult.rows[0].id;

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items
          (order_id, product_name, quantity, price, subtotal)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          orderId,
          item.product_name,
          item.quantity,
          item.price,
          item.subtotal,
        ]
      );
    }

    await client.query("COMMIT");

    res.json(orderResult.rows[0]);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("ORDER CREATE ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  } finally {
    client.release();
  }
});

// GET ORDERS
router.get("/", async (req, res) => {
  try {
    const userUid = req.user.uid;
    const role = req.query.role;

    let ordersResult;

    if (role === "customer") {
  ordersResult = await pool.query(
    `SELECT *
     FROM orders
     WHERE customer_uid = $1
     ORDER BY created_at DESC`,
    [userUid]
  );
}else if (role === "shopkeeper") {
      // Shopkeeper: only orders belonging to their shop(s).
      ordersResult = await pool.query(
        `SELECT o.*
         FROM orders o
         INNER JOIN shops s ON o.shop_id = s.id
         WHERE s.owner_id = $1
         ORDER BY o.created_at DESC`,
        [userUid]
      );
    } else {
      return res.status(400).json({
        error: "Invalid or missing order role",
      });
    }

    const orders = ordersResult.rows;

    for (const order of orders) {
      const itemsResult = await pool.query(
        "SELECT * FROM order_items WHERE order_id = $1",
        [order.id]
      );

      order.items = itemsResult.rows;
    }

    res.json(orders);
  } catch (err) {
    console.error("GET ORDERS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

// UPDATE ORDER STATUS
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userUid = req.user.uid;

    // Only the owner of the shop associated with this order
    // can update its status.
    const result = await pool.query(
      `UPDATE orders
       SET status = $1
       WHERE id = $2
         AND shop_id IN (
           SELECT id
           FROM shops
           WHERE owner_id = $3
         )
       RETURNING *`,
      [status, id, userUid]
    );

    if (result.rows.length === 0) {
      return res.status(403).json({
        error: "You are not allowed to update this order",
      });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error("UPDATE ORDER STATUS ERROR:", err);

    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;