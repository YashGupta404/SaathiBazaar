// saathi-bazaar-backend/models/Product.js
const mongoose = require('mongoose'); // Imports Mongoose

const productSchema = new mongoose.Schema({ // Defines the structure for a product document
  name: { type: String, required: true }, // Name of the item (e.g., "Tomato", "Coriander")
  quantity: { type: Number, required: true }, // Amount of the item
  unit: { type: String, required: true }, // Unit of measurement (e.g., 'kg', 'bunch', 'piece')
  price: { type: Number, required: true }, // Price of the item
  listedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Links to the User who listed this product, using their MongoDB _id
  listedByName: { type: String }, // For convenience, store the lister's name
  listedByShop: { type: String }, // For convenience, store the lister's shop name
  location: { // Geographic location where the product is available
    lat: { type: Number, required: true },
    long: { type: Number, required: true }
  },
  type: { type: String, enum: ['surplus', 'wholesale'], required: true }, // Type of product: 'surplus' for vendor-to-vendor, or 'wholesale' (not used in this specific scenario, but good for future expansion)
  status: { type: String, default: 'available' }, // Availability status (e.g., 'available', 'sold')
  createdAt: { type: Date, default: Date.now } // Automatically sets the creation date for the product document
});

module.exports = mongoose.model('Product', productSchema); // Creates a Mongoose Model named 'Product' (collection: 'products')