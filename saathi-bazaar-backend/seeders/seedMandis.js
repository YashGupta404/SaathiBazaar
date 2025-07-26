// saathi-bazaar-backend/seeders/seedMandis.js
// This script connects to MongoDB and inserts dummy MandiWholesaler data into the 'mandis_wholesalers' collection.

const mongoose = require('mongoose'); // Mongoose for MongoDB interaction
const path = require('path'); // For resolving .env path safely
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Load environment variables from .env

require('../models/MandiWholesaler'); // Load the MandiWholesaler model
const MandiWholesaler = mongoose.model('MandiWholesaler');

// --- DEBUG: Show raw and cleaned MONGO_URI ---
const rawMongoUri = process.env.MONGO_URI || '';
console.log('Raw MONGO_URI from process.env (seedMandis.js):', JSON.stringify(rawMongoUri));
const MONGO_URI = rawMongoUri.trim().replace(/^['"]+|['"]+$/g, '');
console.log('Cleaned MONGO_URI (seedMandis.js):', MONGO_URI);
// --- END DEBUG ---

// Dummy data for mandi wholesalers. Add more as needed.
const mandisData = [
    {
        shopName: "Sealdah Sabzi Bhandar",
        ownerName: "Mr. Gupta",
        contact: "+919876543210",
        location: { lat: 22.5850, long: 88.4100 }, // Coordinates near Sealdah
        description: "Fresh vegetables and fruits, specializing in potatoes and onions.",
        products_offered: [
            { name: "Tomato", unit: "kg", wholesale_price: 35, bulk_price: 30, min_bulk_qty: 50 },
            { name: "Onion", unit: "kg", wholesale_price: 25, bulk_price: 20, min_bulk_qty: 100 },
            { name: "Potato", unit: "kg", wholesale_price: 20, bulk_price: 18, min_bulk_qty: 200 }
        ]
    },
    {
        shopName: "Koley Market Bulk Supplies",
        ownerName: "Mrs. Singh",
        contact: "+919765432109",
        location: { lat: 22.5780, long: 88.3750 }, // Coordinates near Koley Market
        description: "Spices, dry goods, and pulses in bulk.",
        products_offered: [
            { name: "Dhaniya", unit: "kg", wholesale_price: 120, bulk_price: 110, min_bulk_qty: 10 },
            { name: "Turmeric Powder", unit: "kg", wholesale_price: 200, bulk_price: 180, min_bulk_qty: 5 }
        ]
    }
    // Add more mandi shops if needed
];

// Connect to MongoDB and seed data
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected for seeding mandis.');

        // Clear existing mandis to avoid duplicates on re-run
        await MandiWholesaler.deleteMany({});
        console.log('🧹 Existing mandis cleared.');

        const insertedMandis = await MandiWholesaler.insertMany(mandisData);
        console.log(`🎉 Inserted ${insertedMandis.length} dummy mandis.\n`);

        // --- IMPORTANT: Log MongoDB _id for AI update ---
        insertedMandis.forEach(mandi => {
            console.log(`🏪 Mandi created: ${mandi.shopName}`);
            console.log(`   🆔 MongoDB _id: ${mandi._id}\n`);
        });
        console.log('\n--- IMPORTANT: Copy these MongoDB _id values. You will need them for Task 10.8 (updating ai/recommendations.js). ---');

        // Close DB connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    })
    .catch(err => {
        console.error('❌ Error seeding mandis:', err);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to error.');
        }
    });