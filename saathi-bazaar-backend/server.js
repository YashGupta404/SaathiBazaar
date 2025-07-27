// saathi-bazaar-backend/server.js

// ------------------------ Core Modules & Libraries ------------------------
const express = require('express'); // For backend server and APIs
const cors = require('cors'); // For allowing frontend to call backend APIs
const admin = require('firebase-admin'); // For verifying Firebase user tokens
const mongoose = require('mongoose'); // For interacting with MongoDB
require('dotenv').config(); // Loads environment variables from .env file
const path = require('path'); // Helps access local files like your Firebase key

// ------------------------ Firebase Admin SDK Initialization ------------------------
const serviceAccountPath = path.resolve(__dirname, 'saathi-bazaar-hackathon-2025-firebase-adminsdk-fbsvc-0530993899.json');

try {
  const serviceAccount = require(serviceAccountPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized.');
} catch (error) {
  console.error('❌ Firebase Admin SDK Initialization Failed:', error.message);
  process.exit(1); // Stop server if Firebase setup fails
}

const auth = admin.auth(); // For verifying user identity in routes

// ------------------------ MongoDB Connection ------------------------
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected!'))
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err);
    process.exit(1); // Stop server if DB fails
  });

// ------------------------ Express App Setup ------------------------
const app = express();
app.use(cors()); // Enable cross-origin requests
app.use(express.json()); // Enable JSON parsing from frontend requests

// ------------------------ Load Mongoose Models ------------------------
require('./models/User');
require('./models/Product');
require('./models/MandiWholesaler');
require('./models/BulkOrder');
require('./models/SearchHistory');
require('./models/Order'); // ✅ Added: Order model

// ------------------------ API Routes ------------------------
const authRoutes = require('./routes/auth')(auth);
const vendorRoutes = require('./routes/vendor')(auth);
const mandiRoutes = require('./routes/mandi')(auth);
const chatRoutes = require('./routes/chat')(auth); // ✅ For AI chatbot
const orderRoutes = require('./routes/order')(auth); // ✅ For placing/viewing orders

app.use('/api/auth', authRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/mandi', mandiRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/order', orderRoutes); // ✅ New route added

// ------------------------ Test Route ------------------------
app.get('/', (req, res) => {
  res.send('🟢 Saathi Bazaar Backend is Running!');
});

// ------------------------ Start Server ------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
