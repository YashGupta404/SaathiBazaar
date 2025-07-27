// saathi-bazaar-backend/routes/vendor.js
// This file defines the API routes related to vendors' actions,
// specifically for surplus item exchange and participating in bulk purchase schemes.

const express = require('express'); // Imports the Express library to create web API routes
const Product = require('../models/Product'); // Imports the Product Mongoose model (blueprint for products)
const User = require('../models/User'); // Imports the User Mongoose model (blueprint for users)
const BulkOrder = require('../models/BulkOrder'); // Imports the BulkOrder Mongoose model (blueprint for bulk orders)
const { calculateDistance } = require('../utils/location'); // Imports the distance calculation utility function
const { getSuggestedPrice } = require('../ai/pricing'); // Imports the AI pricing suggestion function
const admin = require('firebase-admin'); // Imports Firebase Admin SDK for serverTimestamp (for setting dates, although removed from Product save now)

module.exports = (auth) => { // This function receives the 'auth' object (Firebase Admin SDK) from server.js for token verification
  const router = express.Router(); // Creates a new Express Router instance to define API routes

  // Middleware: This function verifies if a user is logged in by checking their Firebase ID token.
  // It runs before specific routes to ensure only authenticated users can access them.
  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1]; // Tries to get the login token from the 'Authorization' header in the request
    if (!idToken) return res.status(401).send({ error: 'Unauthorized: No login token provided.' }); // If no token, send Unauthorized error

    try {
      const decodedToken = await auth.verifyIdToken(idToken); // Verifies the token's authenticity and validity of the Firebase ID token
      req.uid = decodedToken.uid; // Stores the Firebase User ID (UID) from the verified token in the request object

      // --- DEBUG LOGS ADDED FOR TROUBLESHOOTING "User data not found" ERROR ---
      console.log('DEBUG: verifyToken - Decoded Firebase UID from token:', req.uid); // Log the UID extracted from the Firebase token
      // --- END DEBUG LOGS ---

      const user = await User.findOne({ uid: req.uid }); // Finds the user's full data in your MongoDB database using their Firebase UID
      
      // --- DEBUG LOGS ADDED FOR TROUBLESHOOTING "User data not found" ERROR ---
      console.log('DEBUG: verifyToken - MongoDB User findOne result:', user ? 'User found: ' + user.name + ', _id: ' + user._id : 'User NOT found in MongoDB.'); // Log if user was found in MongoDB and their name/_id, or 'NOT found'
      // --- END DEBUG LOGS ---

      if (!user) return res.status(404).send({ error: 'User data not found in database.' }); // If no user is found in MongoDB matching the UID, send a 404 Not Found error (this means the user registered with Firebase but doesn't have a record in your MongoDB 'users' collection)
      
      req.userId = user._id; // Stores the user's MongoDB _id (important for linking data in MongoDB)
      next(); // If the token is valid and the user is found in MongoDB, proceeds to the next function (the actual route logic)
    } catch (error) {
      console.error('DEBUG ERROR: verifyToken - Token verification or user lookup failed:', error.message); // Logs the actual error if token verification fails or the MongoDB lookup encounters an issue
      res.status(401).send({ error: 'Unauthorized: Invalid login token.' }); // If the token is invalid or expired, send a 401 Unauthorized error
    }
  };

  // --- Surplus Exchange Endpoints ---

  // POST /api/vendor/surplus: Allows a vendor to list a new surplus item
  router.post('/surplus', verifyToken, async (req, res) => {
    const { itemName, quantity, unit, price } = req.body; // Gets the item details (name, quantity, unit, price) from the frontend request body
    try {
      // Find the user (vendor) who is listing the surplus by their MongoDB _id.
      // This is generally redundant if verifyToken successfully sets req.userId, but provides an extra layer of check.
      const user = await User.findById(req.userId);
      if (!user) return res.status(404).send({ error: 'Vendor not found in database.' }); // Should ideally not be reached if verifyToken works correctly

      const newProduct = new Product({ // Creates a new Product document for MongoDB based on the Product model schema
        name: itemName, quantity, unit, price,
        listedBy: user._id, // Stores the MongoDB _id of the listing vendor
        listedByName: user.name, listedByShop: user.shop_name, // Stores vendor's name and shop name directly for convenience (denormalization)
        location: user.location, // Uses the vendor's registered location for the surplus item's location
        type: 'surplus', // Marks this product as a 'surplus' item
        status: 'available' // Set initial status as 'available'
        // >>>>>>> `createdAt: admin.firestore.FieldValue.serverTimestamp()` WAS REMOVED HERE TO FIX THE VALIDATION ERROR <<<<<<<
        // The Mongoose Product model (models/Product.js) has `default: Date.now` for `createdAt`, so it automatically handles timestamp creation.
      });
      console.log('DEBUG (Backend POST): Attempting to save new product:', newProduct); // <<< ADDED DEBUG LOG: Shows the product data before saving
      await newProduct.save(); // Saves the new surplus item document to MongoDB
      console.log('DEBUG (Backend POST): Product successfully saved with _id:', newProduct._id); // <<< ADDED DEBUG LOG: Confirms save and shows the new product's MongoDB _id

      res.status(201).send({ message: 'Surplus item posted successfully!' }); // Sends a 201 Created status and success message back to the frontend
    } catch (error) {
      console.error('Error posting surplus:', error.message); // Logs the detailed error message to the backend terminal
      res.status(500).send({ error: 'Failed to post surplus: ' + error.message }); // Sends a 500 Internal Server Error status and error message to the frontend
    }
  });

  // GET /api/vendor/surplus: Gets a list of available surplus items, optionally filtered by proximity
  router.get('/surplus', verifyToken, async (req, res) => {
    const { lat, long } = req.query; // Gets the requesting user's current latitude and longitude from frontend query parameters
    const userLocation = { latitude: parseFloat(lat), longitude: parseFloat(long) }; // Parses them to numbers

    try {
      // Finds all available surplus products in MongoDB.
      const products = await Product.find({ type: 'surplus', status: 'available' });
      console.log('DEBUG (Backend GET): Raw products fetched from DB:', products); // <<< ADDED DEBUG LOG: Shows all products fetched from DB before filtering

      // Filters products based on distance from the requesting user (widened for testing)
      const surpluses = products.filter(data => {
        if (data.location && userLocation.latitude && userLocation.longitude) { // Check if valid location data exists for both product and user
            const distance = calculateDistance(userLocation.latitude, userLocation.longitude, data.location.lat, data.location.long);
            return distance <= 500; // <<< WIDENED FILTER: Returns true if distance is 500 km or less (effectively includes all for testing)
        }
        return false; // Exclude items if their location data is missing or invalid
      }).map(data => ({
        id: data._id, // Maps MongoDB's unique _id to a more generic 'id' for frontend use
        name: data.name,
        quantity: data.quantity,
        unit: data.unit,
        price: data.price,
        listedByName: data.listedByName,
        listedByShop: data.listedByShop,
        location: data.location,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, data.location.lat, data.location.long).toFixed(2), // Calculates and formats the distance to 2 decimal places
        // Note: For hackathon, actual contact details are generally mocked or implied to be handled via phone call after viewing.
        listedBy: data.listedBy.toString(), // <<< ADDED THIS LINE to ensure listedBy is sent as a string
      }));
      console.log('DEBUG (Backend GET): Filtered surpluses sent to frontend:', surpluses); // <<< ADDED DEBUG LOG: Shows the final list of products sent to the frontend

      res.status(200).send(surpluses); // Sends the filtered list of surpluses back to the frontend
    } catch (error) {
      console.error('Error getting surpluses:', error.message); // Logs any errors during fetching/filtering
      res.status(500).send({ error: 'Failed to get surpluses: ' + error.message }); // Sends a 500 Internal Server Error
    }
  });

  // GET /api/vendor/surplus/suggest-price: AI endpoint to get a suggested price for a surplus item
  router.get('/surplus/suggest-price', verifyToken, (req, res) => {
    const { item, quantity } = req.query; // Gets item name and quantity from frontend query parameters
    const suggestedPrice = getSuggestedPrice(item, parseFloat(quantity)); // Calls the AI function to get a suggestion
    res.status(200).send({ suggestedPrice }); // Sends the suggested price back
  });

  // --- Bulk Purchase Endpoints ---

  // GET /api/vendor/bulk-orders: Get a list of all active (open) bulk orders
  router.get('/bulk-orders', verifyToken, async (req, res) => {
    try {
      const bulkOrders = await BulkOrder.find({ status: 'open' }); // Finds all bulk orders with 'open' status in MongoDB
      res.status(200).send(bulkOrders); // Sends the list of bulk orders
    } catch (error) {
      console.error('Error getting bulk orders:', error.message);
      res.status(500).send({ error: 'Failed to get bulk orders: ' + error.message });
    }
  });

  // POST /api/vendor/bulk-orders/contribute: Allows a vendor to contribute to an existing bulk order
  router.post('/bulk-orders/contribute', verifyToken, async (req, res) => {
    const { bulkOrderId, quantity } = req.body; // Gets the ID of the bulk order and the quantity to contribute
    try {
      const bulkOrder = await BulkOrder.findById(bulkOrderId); // Finds the specific bulk order by its MongoDB _id

      if (!bulkOrder || bulkOrder.status !== 'open') {
        return res.status(400).send({ error: 'Bulk order not found or not open for contribution.' }); // Error if order doesn't exist or is closed
      }

      bulkOrder.current_qty += quantity; // Adds the contributed quantity to the current total
      bulkOrder.contributions.push({ // Adds a record of this vendor's contribution to the 'contributions' array
        vendorId: req.userId, // MongoDB _id of the contributing vendor
        quantity, contributedAt: new Date() // Quantity contributed and timestamp
      });
      await bulkOrder.save(); // Saves the updated bulk order document to MongoDB

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

  return router; // Returns the configured router to be used by server.js
};