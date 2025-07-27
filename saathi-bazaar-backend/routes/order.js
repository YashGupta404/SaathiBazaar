// saathi-bazaar-backend/routes/order.js
// This file defines API routes for managing user orders.

const express = require('express');
const Order = require('../models/Order'); // Import the Order model
const User = require('../models/User'); // Import User model (for user details)
const Product = require('../models/Product'); // To potentially get product details
const MandiWholesaler = require('../models/MandiWholesaler'); // To potentially get mandi details
const mongoose = require('mongoose'); // For ObjectId if needed for manual creation/testing

module.exports = (auth) => { // Receives 'auth' from server.js for token verification
  const router = express.Router();

  // Middleware to verify ID token (same as other routes)
  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).send({ error: 'Unauthorized: No login token provided.' });
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.uid = decodedToken.uid;
      const user = await User.findOne({ uid: req.uid });
      if (!user) return res.status(404).send({ error: 'User data not found in database.' });
      req.userId = user._id; // Store MongoDB _id
      next();
    } catch (error) {
      console.error('DEBUG ERROR: verifyToken - Token verification failed:', error.message);
      res.status(401).send({ error: 'Unauthorized: Invalid login token.' });
    }
  };

  // GET /api/order/my-orders: Get orders placed by the current user
  router.get('/my-orders', verifyToken, async (req, res) => {
    try {
      // Find orders where buyerId matches the current user's MongoDB _id
      const orders = await Order.find({ buyerId: req.userId }).sort({ orderDate: -1 }); // Sort by newest first
      console.log('DEBUG (Backend GET /my-orders): Fetched orders for user:', req.userId, orders);
      res.status(200).send(orders);
    } catch (error) {
      console.error('Error fetching user orders:', error.message);
      res.status(500).send({ error: 'Failed to fetch user orders: ' + error.message });
    }
  });

  // POST /api/order/place-order: Place a new order from cart
  router.post('/place-order', verifyToken, async (req, res) => {
    const { items, totalAmount } = req.body; // Items from cart, total amount

    if (!items || items.length === 0 || !totalAmount) {
      return res.status(400).send({ error: 'Missing order details.' });
    }

    try {
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).send({ error: 'Buyer not found.' });

      const newOrder = new Order({
        buyerId: user._id,
        buyerName: user.name,
        buyerShopName: user.shop_name,
        items: items.map(item => ({
          // Convert frontend item structure to backend orderItemSchema
          productId: item.id, // Frontend's item.id is the product's MongoDB _id
          name: item.name,
          quantity: item.quantity,
          unit: item.unit,
          price: item.price,
          type: item.type, // 'mandi' or 'bulk'
          sourceId: item.sourceId ? new mongoose.Types.ObjectId(item.sourceId) : undefined // Convert to ObjectId if present
        })),
        totalAmount,
        deliveryAddress: user.location, // Use buyer's current registered location
        status: 'placed' // Initial status
      });

      console.log('DEBUG (Backend POST /place-order): Attempting to save new order:', newOrder);
      await newOrder.save();
      console.log('DEBUG (Backend POST /place-order): Order successfully saved with _id:', newOrder._id);

      // --- Conceptual Backend Action for Hackathon ---
      // In a real app, here you would:
      // 1. Send order details to a Mandi Owner's system/dashboard (if type 'mandi')
      // 2. Send order details to the Bulk Buyer/platform for processing (if type 'bulk')
      // 3. Trigger a delivery partner assignment (conceptual for hackathon)
      console.log('DEBUG (Backend POST /place-order): Conceptual: Order placed, awaiting physical fulfillment.');
      // --- END Conceptual Backend Action ---

      res.status(201).send({ message: 'Order placed successfully!', orderId: newOrder._id });
    } catch (error) {
      console.error('Error placing order:', error.message);
      res.status(500).send({ error: 'Failed to place order: ' + error.message });
    }
  });

  // DELETE /api/order/:id: Cancel an order (Conceptual)
  router.delete('/:id', verifyToken, async (req, res) => {
    try {
      // For hackathon, just conceptually acknowledge cancellation.
      // In real app, add more complex logic (status checks, refunds).
      const order = await Order.findById(req.params.id);
      if (!order) return res.status(404).send({ error: 'Order not found.' });
      if (order.buyerId.toString() !== req.userId.toString()) { // Ensure only buyer can cancel
          return res.status(403).send({ error: 'Not authorized to cancel this order.' });
      }
      order.status = 'cancelled';
      await order.save();
      console.log(`DEBUG (Backend DELETE): Order ${req.params.id} cancelled by user ${req.userId}.`);
      res.status(200).send({ message: 'Order cancelled (conceptually).' });
    } catch (error) {
      console.error('Error cancelling order:', error.message);
      res.status(500).send({ error: 'Failed to cancel order: ' + error.message });
    }
  });


  return router;
};