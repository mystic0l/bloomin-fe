const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// CREATE PRODUCT
// router.post("/", async (req, res) => {
//   try {
//     const { name, price, quantity, shop_id } = req.body;

//     const result = await pool.query(
//       "INSERT INTO products (name, price, quantity, shop_id) VALUES ($1, $2, $3, $4) RETURNING *",
//       [name, price, quantity, shop_id]
//     );

//     res.json(result.rows[0]);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

router.post("/", async (req, res) => {
    console.log("BODY RECEIVED:", req.body); // 🔥 ADD THIS
  
    try {
      const { name, price, quantity, shop_id } = req.body;
  
      const result = await pool.query(
        "INSERT INTO products (name, price, quantity, shop_id) VALUES ($1, $2, $3, $4) RETURNING *",
        [name, price, quantity, shop_id]
      );
  
      console.log("INSERTED:", result.rows[0]); // 🔥 ADD THIS
  
      res.json(result.rows[0]);
    } catch (err) {
      console.error("DB ERROR:", err); // 🔥 ADD THIS
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
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;