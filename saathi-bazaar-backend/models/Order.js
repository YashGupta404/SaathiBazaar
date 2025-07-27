// saathi-bazaar-backend/models/Order.js
// This model defines the blueprint for customer orders placed through the app.

const mongoose = require('mongoose'); // Imports Mongoose

const orderItemSchema = new mongoose.Schema({ // Schema for individual items within an order
    productId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID of the product (can be Mandi item or Bulk item)
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true },
    price: { type: Number, required: true }, // Price per unit at time of order
    type: { type: String, enum: ['mandi', 'bulk'], required: true }, // Type of order item
    sourceId: { type: mongoose.Schema.Types.ObjectId } // Optional: Mandi ID if from mandi, BulkOrder ID if from bulk
}, { _id: false }); // Do not create _id for subdocuments (order items)

const orderSchema = new mongoose.Schema({ // Main Order schema
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // The vendor who placed the order
    buyerName: { type: String }, // For convenience
    buyerShopName: { type: String }, // For convenience
    items: [orderItemSchema], // Array of items in this order
    totalAmount: { type: Number, required: true },
    status: { type: String, enum: ['pending', 'placed', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    orderDate: { type: Date, default: Date.now },
    deliveryAddress: { // Copy of buyer's location at time of order
        lat: { type: Number },
        long: { type: Number }
    },
    // For conceptual future:
    // assignedDeliveryPartner: { type: String },
    // paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    // assignedMandiWholesaler: { type: mongoose.Schema.Types.ObjectId, ref: 'MandiWholesaler' } // If all items from one mandi
});

module.exports = mongoose.model('Order', orderSchema); // Creates an 'Order' model (collection: 'orders')