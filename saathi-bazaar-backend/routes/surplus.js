const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// Surplus Schema
const surplusSchema = new mongoose.Schema({
  vendorId: String,
  item: String,
  quantity: String,
  price: String,
  phone: String,
  timestamp: { type: Date, default: Date.now }
});

const Surplus = mongoose.model("Surplus", surplusSchema);

// Post surplus
router.post("/", async (req, res) => {
  try {
    const { vendorId, item, quantity, price, phone } = req.body;
    const newSurplus = new Surplus({ vendorId, item, quantity, price, phone });
    await newSurplus.save();
    res.status(201).json({ message: "Surplus item posted!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all surplus
router.get("/", async (req, res) => {
  try {
    const items = await Surplus.find().sort({ timestamp: -1 });
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
