// saathi-bazaar-backend/models/MandiWholesaler.js
const mongoose = require('mongoose'); // Imports Mongoose

const mandiWholesalerSchema = new mongoose.Schema({ // Defines the structure for a MandiWholesaler document
  shopName: { type: String, required: true }, // Name of the wholesale shop
  ownerName: { type: String }, // Owner's name (optional)
  contact: { type: String }, // Contact number of the shop
  location: { // Geographic location of the mandi shop
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  description: { type: String }, // A short description or address of the shop
  products_offered: [{ // An array of products this wholesaler sells
    name: { type: String, required: true }, // Name of the product
    unit: { type: String, required: true }, // Unit (e.g., 'kg', 'quintal')
    wholesale_price: { type: Number, required: true }, // Standard wholesale price
    bulk_price: { type: Number }, // Discounted price for very large bulk orders
    min_bulk_qty: { type: Number } // Minimum quantity required for the bulk price
  }],
  createdAt: { type: Date, default: Date.now } // Automatically sets the creation date
});

module.exports = mongoose.model('MandiWholesaler', mandiWholesalerSchema); // Creates a Mongoose Model named 'MandiWholesaler' (collection: 'mandi_wholesalers')