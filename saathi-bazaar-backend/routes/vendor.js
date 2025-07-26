// saathi-bazaar-backend/routes/vendor.js
const express = require('express'); // Imports the Express library to create routes
const Product = require('../models/Product'); // Imports the Product model (blueprint for products)
const User = require('../models/User'); // Imports the User model (blueprint for users)
const BulkOrder = require('../models/BulkOrder'); // Imports the BulkOrder model (blueprint for bulk orders)
const { calculateDistance } = require('../utils/location'); // Imports the distance calculation utility
const { getSuggestedPrice } = require('../ai/pricing'); // Imports the AI pricing suggestion function
const admin = require('firebase-admin'); // Imports Firebase Admin SDK for serverTimestamp (for setting dates)

module.exports = (auth) => { // This function receives the 'auth' object (from server.js) for Firebase token verification
  const router = express.Router(); // Creates a new Express Router to define routes

  // Middleware: This function verifies if a user is logged in by checking their Firebase ID token.
  // It runs before specific routes to ensure only authenticated users can access them.
  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1]; // Tries to get the login token from the 'Authorization' header
    if (!idToken) return res.status(401).send({ error: 'Unauthorized: No login token provided.' }); // If no token, send Unauthorized error
    try {
      const decodedToken = await auth.verifyIdToken(idToken); // Verifies the token's authenticity with Firebase
      req.uid = decodedToken.uid; // Stores the Firebase User ID (UID) from the token
      const user = await User.findOne({ uid: req.uid }); // Finds the user's full data in your MongoDB database using their Firebase UID
      if (!user) return res.status(404).send({ error: 'User data not found in database.' }); // If user not in MongoDB, means incomplete registration
      req.userId = user._id; // Stores the user's MongoDB _id (important for linking data in MongoDB)
      next(); // If token is valid and user found, proceeds to the next function (the actual route logic)
    } catch (error) {
      res.status(401).send({ error: 'Unauthorized: Invalid login token.' }); // If token is invalid or expired
    }
  };

  // --- Surplus Exchange Endpoints ---
  // POST /api/vendor/surplus: Allows a vendor to list a new surplus item
  router.post('/surplus', verifyToken, async (req, res) => {
    const { itemName, quantity, unit, price } = req.body; // Gets item details from the frontend request
    try {
      const user = await User.findById(req.userId); // Finds the user who is listing the surplus by their MongoDB _id
      if (!user) return res.status(404).send({ error: 'Vendor not found in database.' }); // Should not happen if verifyToken works

      const newProduct = new Product({ // Creates a new Product document for MongoDB based on the Product model
        name: itemName, quantity, unit, price,
        listedBy: user._id, // Stores the MongoDB _id of the listing vendor
        listedByName: user.name, listedByShop: user.shop_name, // Stores vendor's name/shop for convenience
        location: user.location, // Uses the vendor's registered location for the surplus item
        type: 'surplus', // Marks this product as a 'surplus' item
        status: 'available', // Sets initial status as 'available'
        createdAt: admin.firestore.FieldValue.serverTimestamp() // Sets the creation timestamp
      });
      await newProduct.save(); // Saves the new surplus item document to MongoDB
      res.status(201).send({ message: 'Surplus item posted successfully!' }); // Sends success response
    } catch (error) {
      console.error('Error posting surplus:', error.message);
      res.status(500).send({ error: 'Failed to post surplus: ' + error.message }); // Sends error response
    }
  });

  // GET /api/vendor/surplus: Gets a list of available surplus items, optionally filtered by proximity
  router.get('/surplus', verifyToken, async (req, res) => {
    const { lat, long } = req.query; // Gets the requesting user's current latitude and longitude from frontend query parameters
    const userLocation = { latitude: parseFloat(lat), longitude: parseFloat(long) }; // Parse to numbers

    try {
      const products = await Product.find({ type: 'surplus', status: 'available' }); // Finds all available surplus products in MongoDB
      // Filters products based on distance from the requesting user (within 5 km radius)
      const surpluses = products.filter(data => {
        if (data.location && userLocation.latitude && userLocation.longitude) { // Check if valid location data exists for both
            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, data.location.lat, data.location.long);
            return distance <= 5; // Returns true if distance is 5 km or less
        }
        return false; // Exclude items if location data is missing or invalid
      }).map(data => ({
        id: data._id, // MongoDB's unique ID for the product document
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        listedByName: data.listedByName,
        listedByShop: data.listedByShop,
        location: data.location,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, data.location.lat, data.location.long).toFixed(2), // Calculate and format distance
        // Note: For hackathon, actual contact details are usually shown on click on frontend or implied.
      }));
      res.status(200).send(surpluses); // Sends the filtered list of surpluses back to the frontend
    } catch (error) {
      console.error('Error getting surpluses:', error.message);
      res.status(500).send({ error: 'Failed to get surpluses: ' + error.message });
    }
  });

  // GET /api/vendor/surplus/suggest-price: AI endpoint to get a suggested price for a surplus item
  router.get('/surplus/suggest-price', verifyToken, (req, res) => {
    const { item, quantity } = req.query; // Get item name and quantity from frontend
    const suggestedPrice = getSuggestedPrice(item, parseFloat(quantity)); // Call the AI function to get suggestion
    res.status(200).send({ suggestedPrice }); // Send the suggested price back
  });

  // --- Bulk Purchase Endpoints ---
  // GET /api/vendor/bulk-orders: Get a list of all active (open) bulk orders
  router.get('/bulk-orders', verifyToken, async (req, res) => {
    try {
      const bulkOrders = await BulkOrder.find({ status: 'open' }); // Find all bulk orders with 'open' status in MongoDB
      res.status(200).send(bulkOrders); // Send the list of bulk orders
    } catch (error) {
      console.error('Error getting bulk orders:', error.message);
      res.status(500).send({ error: 'Failed to get bulk orders: ' + error.message });
    }
  });

  // POST /api/vendor/bulk-orders/contribute: Allows a vendor to contribute to an existing bulk order
  router.post('/bulk-orders/contribute', verifyToken, async (req, res) => {
    const { bulkOrderId, quantity } = req.body; // Get the ID of the bulk order and the quantity to contribute
    try {
      const bulkOrder = await BulkOrder.findById(bulkOrderId); // Find the specific bulk order by its MongoDB _id

      if (!bulkOrder || bulkOrder.status !== 'open') {
        return res.status(400).send({ error: 'Bulk order not found or not open for contribution.' }); // Error if order doesn't exist or is closed
      }

      bulkOrder.current_qty += quantity; // Add the contributed quantity to the current total
      bulkOrder.contributions.push({ // Add a record of this vendor's contribution
        vendorId: req.userId, // MongoDB _id of the contributing vendor
        quantity, contributedAt: new Date() // Quantity contributed and timestamp
      });
      await bulkOrder.save(); // Save the updated bulk order document to MongoDB

      // Check if the bulk order is now fulfilled after this contribution
      if (bulkOrder.current_qty >= bulkOrder.target_qty && bulkOrder.status === 'open') {
          bulkOrder.status = 'fulfilled'; // Change status to 'fulfilled'
          bulkOrder.fulfilledAt = new Date(); // Record fulfillment time
          await bulkOrder.save(); // Save the updated status
          // In a real application, this would trigger notifications to all contributors and the actual purchase from the wholesaler.
      }

      res.status(200).send({ message: 'Your contribution has been added successfully!' }); // Send success response
    } catch (error) {
      console.error('Error contributing to bulk order:', error.message);
      res.status(500).send({ error: 'Failed to contribute to bulk order: ' + error.message });
    }
  });

  return router; // Return the configured router to be used in server.js
};