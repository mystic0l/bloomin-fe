const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");
const shopRoutes= require("./routes/shopRoutes");
const app = express();
const productRoutes = require("./routes/productRoutes");
const authenticate = require("./middleware/authMiddleware");

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(require('path').join(__dirname, 'uploads')));

app.use("/api/products", authenticate, productRoutes);
app.use("/api/orders", authenticate, orderRoutes);
app.use("/api/shops", authenticate, shopRoutes);

app.get("/", (_req, res) => {
  res.send("API running");
});

pool.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
