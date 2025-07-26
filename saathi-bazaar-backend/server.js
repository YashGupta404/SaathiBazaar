// saathi-bazaar-backend/server.js
// Core Modules & Libraries
const express = require('express'); // Imports the Express library to build web APIs
const cors = require('cors'); // Imports CORS to allow your frontend to talk to your backend
const admin = require('firebase-admin'); // Imports Firebase Admin SDK for backend Firebase operations (e.g., verifying tokens)
const mongoose = require('mongoose'); // Imports Mongoose for easy MongoDB interaction
require('dotenv').config(); // Loads environment variables (like secret keys) from .env file
const path = require('path'); // Node.js built-in module for working with file paths

// --- Firebase Admin SDK Initialization (for verifying user logins on the backend) ---
// This line constructs the path to the Firebase service account key file using the exact filename provided.
// Make sure this JSON file is located directly inside the saathi-bazaar-backend folder.
const serviceAccountPath = path.resolve(__dirname, 'saathi-bazaar-hackathon-2025-firebase-adminsdk-fbsvc-0530993899.json'); // <<<<<<< UPDATED FILENAME

try {
  const serviceAccount = require(serviceAccountPath); // Loads the content of your Firebase key file
  admin.initializeApp({ // Initializes the Firebase Admin SDK with your credentials
    credential: admin.credential.cert(serviceAccount) // Uses your key for secure authentication
  });
  console.log('Firebase Admin SDK (Auth) initialized successfully.'); // Message in your terminal if successful
} catch (error) {
  console.error('Failed to initialize Firebase Admin SDK:', error.message); // Message if it fails
  process.exit(1); // Stops the server if Firebase doesn't connect, as it's critical for authentication
}
const auth = admin.auth(); // Creates an 'auth' object to perform authentication-related tasks (like verifying tokens)

// --- MongoDB Connection ---
// Attempts to connect to your MongoDB Atlas database using the MONGO_URI from your .env file
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!')) // Message if connection is successful
  .catch(err => {
    console.error('MongoDB connection error:', err); // Message if connection fails
    process.exit(1); // Stops the server if MongoDB doesn't connect, as it's critical for data storage
  });

const app = express(); // Creates your Express application
app.use(cors()); // Applies CORS middleware to allow your frontend (from a different address) to send requests to this backend
app.use(express.json()); // Tells Express to automatically understand and parse JSON data sent in request bodies

// --- Load Mongoose Models (Blueprints for your data) ---
// These lines tell Mongoose to load the schema definitions from your 'models' folder.
// You will create these files in Step 3.
require('./models/User');
require('./models/Product');
require('./models/MandiWholesaler');
require('./models/BulkOrder');
require('./models/SearchHistory');

// --- Import and Use Routes (Your API Endpoints) ---
// These lines connect your API endpoint files (e.g., routes/auth.js) to your main server.
// We pass the 'auth' object to routes that need to verify user tokens.
const authRoutes = require('./routes/auth')(auth);
const vendorRoutes = require('./routes/vendor')(auth);
const mandiRoutes = require('./routes/mandi')(auth);
const chatRoutes = require('./routes/chat')(auth); // For the AI Chatbot

// Define the base paths for each set of routes.
// E.g., any route defined in auth.js will start with /api/auth (e.g., /api/auth/register)
app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/chat', chatRoutes);

// Basic test route to check if server is running
app.get('/', (req, res) => {
  res.send('Saathi Bazaar Backend is Running!'); // Send a simple message back
});

// Start the server (tells Node.js to listen for incoming web requests)
const PORT = process.env.PORT || 5000; // Uses port 5000, or a port number defined in your .env file
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`); // Log a message to your terminal
});