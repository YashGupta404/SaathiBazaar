// saathi-bazaar-backend/routes/mandi.js
const express = require('express'); // Imports Express to create routes
const MandiWholesaler = require('../models/MandiWholesaler'); // Imports MandiWholesaler model
const User = require('../models/User'); // Imports User model (needed to link search history to user's MongoDB ID)
const SearchHistory = require('../models/SearchHistory'); // Imports SearchHistory model for logging searches
const { getRecommendedMandis, getSearchSuggestions } = require('../ai/recommendations'); // Imports AI functions
const admin = require('firebase-admin'); // Imports Firebase Admin for serverTimestamp

module.exports = (auth) => { // 'auth' object from Firebase Admin SDK (passed from server.js)
  const router = express.Router(); // Creates an Express Router

  // Middleware: Checks if user is logged in (same as in vendor.js)
  const verifyToken = async (req, res, next) => {
    const idToken = req.headers.authorization?.split('Bearer ')[1];
    if (!idToken) return res.status(401).send({ error: 'Unauthorized' });
    try {
      const decodedToken = await auth.verifyIdToken(idToken);
      req.uid = decodedToken.uid; // Firebase UID
      const user = await User.findOne({ uid: req.uid }); // Find user in MongoDB
      if (!user) return res.status(404).send({ error: 'User data not found.' });
      req.userId = user._id; // MongoDB _id
      next();
    } catch (error) {
      res.status(401).send({ error: 'Invalid token' });
    }
  };

  // GET /api/mandi: Get list of all Mandi Shops/Wholesalers (sorted by AI recommendations)
  router.get('/', verifyToken, async (req, res) => {
    try {
      // Get AI recommendations (this function returns MongoDB _id strings of recommended mandis)
      const recommendedMandiIds = getRecommendedMandis(req.uid); // Pass Firebase UID to AI for recommendation
      let mandis = await MandiWholesaler.find(); // Get all mandi wholesalers from MongoDB

      // AI reordering: Sort the list to put recommended ones first
      mandis.sort((a, b) => {
        const aIsRecommended = recommendedMandiIds.includes(a._id.toString()); // Check if 'a's ID is in recommendations
        const bIsRecommended = recommendedMandiIds.includes(b._id.toString()); // Check if 'b's ID is in recommendations
        if (aIsRecommended && !bIsRecommended) return -1; // If 'a' is recommended and 'b' is not, 'a' comes first
        if (!aIsRecommended && bIsRecommended) return 1; // If 'b' is recommended and 'a' is not, 'b' comes first
        return 0; // Otherwise, maintain original order
      });

      res.status(200).send(mandis); // Send the sorted list of mandis to the frontend
    } catch (error) {
      console.error('Error getting mandis:', error.message);
      res.status(500).send({ error: 'Failed to get mandis: ' + error.message });
    }
  });

  // GET /api/mandi/:id: Get details of a specific Mandi Shop
  router.get('/:id', verifyToken, async (req, res) => {
    try {
      const mandi = await MandiWholesaler.findById(req.params.id); // Find mandi by its MongoDB _id from the URL parameter
      if (!mandi) {
        return res.status(404).send({ error: 'Mandi shop not found.' }); // If no mandi found with that ID
      }
      res.status(200).send(mandi); // Send the mandi details
    } catch (error) {
      console.error('Error getting mandi details:', error.message);
      res.status(500).send({ error: 'Failed to get mandi details: ' + error.message });
    }
  });

  // POST /api/mandi/log-search: Log a search query (for AI search suggestions learning)
  router.post('/log-search', verifyToken, async (req, res) => {
    const { query } = req.body; // Get the search query string from frontend
    try {
      const newSearch = new SearchHistory({
        vendorId: req.userId, // Use MongoDB _id of the vendor who searched
        query,
        timestamp: admin.firestore.FieldValue.serverTimestamp() // Sets the current server timestamp
      });
      await newSearch.save(); // Save search query to MongoDB
      res.status(200).send({ message: 'Search query logged successfully.' });
    } catch (error) {
      console.error('Error logging search:', error.message);
      res.status(500).send({ error: 'Failed to log search: ' + error.message });
    }
  });

  // GET /api/mandi/search-suggestions: AI endpoint for search suggestions
  router.get('/search-suggestions', verifyToken, async (req, res) => {
    const { query } = req.query; // Get the current search input from frontend
    try {
      // Call the AI function to get suggestions, passing the vendor's MongoDB _id and current query
      const suggestions = await getSearchSuggestions(req.userId, query);
      res.status(200).send({ suggestions }); // Send the suggestions back
    } catch (error) {
      console.error('Error getting search suggestions:', error.message);
      res.status(500).send({ error: 'Failed to get search suggestions: ' + error.message });
    }
  });

  return router; // Return the configured router
};