const express = require("express");
const cors = require("cors");
const pool = require("./config/db");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/orders", orderRoutes);

app.get("/", (_req, res) => {
  res.send("API running");
});

pool.connect()
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));

  app.use("/api/orders", orderRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
