// saathi-bazaar-backend/models/SearchHistory.js
const mongoose = require('mongoose'); // Imports Mongoose

const searchHistorySchema = new mongoose.Schema({ // Defines the structure for a SearchHistory document
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // MongoDB _id of the vendor who performed the search
  query: { type: String, required: true }, // The actual search query string (e.g., "tomatoes price")
  timestamp: { type: Date, default: Date.now } // Date/time when the search occurred
});

module.exports = mongoose.model('SearchHistory', searchHistorySchema); // Creates a Mongoose Model named 'SearchHistory' (collection: 'search_histories')