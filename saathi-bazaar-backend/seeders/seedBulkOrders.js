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

// Dummy data for bulk orders.
// IMPORTANT: Deadlines are set in the future relative to when you run the script.
// This ensures they are 'open' when your app fetches them.
const bulkOrdersData = [
    {
        itemName: "Tomato",
        unit: "kg",
        clusterLocation: "Sealdah_North",
        current_qty: 25, // Start with some quantity, e.g., 50% fulfilled
        target_qty: 50,
        // Deadline: Set to 2 days from now. Use current time + milliseconds for future date.
        deadline: new Date(new Date().getTime() + (2 * 24 * 60 * 60 * 1000)), // 2 days from now
        status: "open",
        individualPrice: 45,
        bulkPrice: 30,
        contributions: [] // Empty array, will be populated by app contributions
    },
    {
        itemName: "Onion",
        unit: "kg",
        clusterLocation: "NewTown_Central",
        current_qty: 10, // Start with some quantity
        target_qty: 40,
        // Deadline: Set to 1 day from now
        deadline: new Date(new Date().getTime() + (1 * 24 * 60 * 60 * 1000)), // 1 day from now
        status: "open",
        individualPrice: 28,
        bulkPrice: 22,
        contributions: []
    },
    {
        itemName: "Potato",
        unit: "bags",
        clusterLocation: "Howrah_Market",
        current_qty: 0, // No contributions yet
        target_qty: 10,
        // Deadline: Set to 3 days from now
        deadline: new Date(new Date().getTime() + (3 * 24 * 60 * 60 * 1000)), // 3 days from now
        status: "open",
        individualPrice: 200,
        bulkPrice: 150,
        contributions: []
    }
    // You can add more bulk orders here if needed
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