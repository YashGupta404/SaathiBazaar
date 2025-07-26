// saathi-bazaar-backend/models/User.js
const mongoose = require('mongoose'); // Imports the Mongoose library

const userSchema = new mongoose.Schema({ // Defines the structure (schema) for a user document
  uid: { type: String, required: true, unique: true }, // 'uid' from Firebase Auth; must be a string, required, and unique for each user
  name: { type: String, required: true }, // User's name; must be a string and required
  contact: { type: String, required: true }, // User's contact number; must be a string and required
  shop_name: { type: String, required: true }, // Name of their street food shop; must be a string and required
  location: { // Geographic location of their shop (latitude and longitude)
    lat: { type: Number, required: true }, // Latitude; must be a number and required
    long: { type: Number, required: true } // Longitude; must be a number and required
  },
  role: { type: String, default: 'vendor' }, // User's role in the app (e.g., 'vendor'); defaults to 'vendor'
  createdAt: { type: Date, default: Date.now } // Automatically sets the creation date for the user document
});

module.exports = mongoose.model('User', userSchema); // Creates a Mongoose Model named 'User' from the schema. This model will interact with a MongoDB collection typically named 'users'.