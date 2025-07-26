// saathi-bazaar-backend/seeders/seedBulkOrders.js
// This script connects to MongoDB and inserts dummy BulkOrder data into the 'bulk_orders' collection.

const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const path = require('path'); // For resolving .env path safely
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load environment variables from .env

require('../models/BulkOrder'); // Load the BulkOrder model
const BulkOrder = mongoose.model('BulkOrder');

// --- DEBUG: Show raw and cleaned MONGO_URI ---
const rawMongoUri = process.env.MONGO_URI || '';
console.log('Raw MONGO_URI from process.env (seedBulkOrders.js):', JSON.stringify(rawMongoUri));
const MONGO_URI = rawMongoUri.trim().replace(/^['"]+|['"]+$/g, '');
console.log('Cleaned MONGO_URI (seedBulkOrders.js):', MONGO_URI);
// --- END DEBUG ---

// Dummy data for bulk orders. You can add more as needed.
const bulkOrdersData = [
    {
        itemName: "Tomato",
        unit: "kg",
        clusterLocation: "Sealdah_North",
        current_qty: 15, // Current quantity contributed
        target_qty: 50, // Target quantity for bulk discount
        // Set deadline to a future date/time for the order to be 'open' for demo
        // new Date().getTime() + (X * 24 * 60 * 60 * 1000) calculates X days from now in milliseconds
        deadline: new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 days from now
        status: "open", // Initial status
        individualPrice: 45, // Price if bought individually
        bulkPrice: 30, // Discounted price
        contributions: [] // Empty array, will be filled by app
    },
    {
        itemName: "Onion",
        unit: "kg",
        clusterLocation: "NewTown_Central",
        current_qty: 5,
        target_qty: 20,
        deadline: new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)), // 1 day from now
        status: "open",
        individualPrice: 28,
        bulkPrice: 22,
        contributions: []
    }
    // Add more bulk orders if needed
];

// Connect to MongoDB and seed data
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected for seeding bulk orders.');

        // Clear existing bulk orders before inserting new ones
        await BulkOrder.deleteMany({});
        console.log('🧹 Existing bulk orders cleared.');

        const insertedBulkOrders = await BulkOrder.insertMany(bulkOrdersData);
        console.log(`🎉 Inserted ${insertedBulkOrders.length} dummy bulk orders.\n`);

        // Close DB connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    })
    .catch(err => {
        console.error('❌ Error seeding bulk orders:', err);
        if (mongoose.connection.readyState === 1) { // Check if connection is open
            mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to error.');
        }
    });