// saathi-bazaar-backend/models/BulkOrder.js
const mongoose = require('mongoose'); // Imports Mongoose

const bulkOrderSchema = new mongoose.Schema({ // Defines the structure for a BulkOrder document
  itemName: { type: String, required: true }, // Name of the item for bulk purchase (e.g., "Tomato")
  unit: { type: String, required: true }, // Unit (e.g., 'kg', 'quintal')
  clusterLocation: { type: String, required: true }, // Geographic area/cluster for this bulk order (e.g., "Sealdah_North")
  current_qty: { type: Number, default: 0 }, // The quantity of the item accumulated so far from contributions
  target_qty: { type: Number, required: true }, // The minimum quantity needed to achieve the bulk discount
  deadline: { type: Date, required: true }, // The date/time by which the target quantity must be met
  status: { type: String, enum: ['open', 'fulfilled', 'failed'], default: 'open' }, // Current status of the bulk order
  individualPrice: { type: Number }, // Price if bought individually (higher)
  bulkPrice: { type: Number }, // Discounted price if bulk target is met (lower)
  contributions: [{ // An array listing each vendor's contribution to this bulk order
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // MongoDB _id of the contributing vendor
    quantity: { type: Number, required: true }, // Quantity contributed by this vendor
    contributedAt: { type: Date, default: Date.now } // Timestamp of the contribution
  }],
  fulfilledAt: { type: Date } // Date/time when the bulk order target was successfully met
});

module.exports = mongoose.model('BulkOrder', bulkOrderSchema); // Creates a Mongoose Model named 'BulkOrder' (collection: 'bulk_orders')