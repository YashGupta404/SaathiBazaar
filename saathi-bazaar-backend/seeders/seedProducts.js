// saathi-bazaar-backend/seeders/seedProducts.js
// This script connects to MongoDB and inserts dummy surplus Product data into the 'products' collection.

const mongoose = require('mongoose'); // Imports Mongoose for MongoDB interaction
const path = require('path'); // For resolving .env path safely
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Loads environment variables from .env

require('../models/Product'); // Loads the Product model
const Product = mongoose.model('Product');

// --- DEBUG: Show raw and cleaned MONGO_URI ---
const rawMongoUri = process.env.MONGO_URI || '';
console.log('Raw MONGO_URI from process.env (seedProducts.js):', JSON.stringify(rawMongoUri));
const MONGO_URI = rawMongoUri.trim().replace(/^['"]+|['"]+$/g, '');
console.log('Cleaned MONGO_URI (seedProducts.js):', MONGO_URI);
// --- END DEBUG ---

// IMPORTANT: These are the ACTUAL MongoDB _ids of your dummy users from your successful seedUsers.js run (Task 10.3).
// These IDs were in the terminal output after running seedUsers.js.
const DUMMY_VENDOR_1_ID = '6884ebf7fb1139978020af62'; // This is Rajesh Sharma's _id from your previous output
const DUMMY_VENDOR_2_ID = '6884ebf7fb1139978020af63'; // This is Priya Singh's _id from your previous output

const productsData = [
    {
        name: "Coriander",
        quantity: 2,
        unit: "bunch",
        price: 10,
        listedBy: DUMMY_VENDOR_1_ID, // Using the actual MongoDB _id for Rajesh Sharma
        listedByName: "Rajesh Sharma", // Name of the vendor
        listedByShop: "Sharma Fast Food", // Shop name of the vendor
        location: { lat: 22.5705, long: 88.3705 }, // Example location near Sealdah
        type: "surplus",
        status: "available"
    },
    {
        name: "Green Chili",
        quantity: 0.5,
        unit: "kg",
        price: 25,
        listedBy: DUMMY_VENDOR_2_ID, // Using the actual MongoDB _id for Priya Singh
        listedByName: "Priya Singh", // Name of the vendor
        listedByShop: "Priya Snacks", // Shop name of the vendor
        location: { lat: 22.5755, long: 88.4155 }, // Example location near New Town
        type: "surplus",
        status: "available"
    }
    // You can add more surplus products here if needed for testing.
    // Ensure 'listedBy' refers to a valid dummy user _id.
    // Example:
    // {
    //     name: "Lemon",
    //     quantity: 1,
    //     unit: "kg",
    //     price: 30,
    //     listedBy: DUMMY_VENDOR_1_ID, // Or DUMMY_VENDOR_2_ID
    //     listedByName: "Rajesh Sharma",
    //     listedByShop: "Sharma Fast Food",
    //     location: { lat: 22.5690, long: 88.3710 },
    //     type: "surplus",
    //     status: "available"
    // }
];

// Connect to MongoDB using the connection string.
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected for seeding products.');
        
        // Clear existing products before inserting new ones.
        // This is useful for development so you don't get duplicate data if you run the script multiple times.
        await Product.deleteMany({});
        console.log('🧹 Existing products cleared.');

        // Insert the dummy product data into the 'products' collection.
        const insertedProducts = await Product.insertMany(productsData);
        console.log(`🎉 Inserted ${insertedProducts.length} dummy products.\n`);

        // Close the MongoDB connection after seeding is complete.
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    })
    .catch(err => {
        console.error('❌ Error seeding products:', err); // Log any errors that occur during connection or seeding.
        // Ensure the connection is closed even if there's an error.
        if (mongoose.connection.readyState === 1) { // Check if connection is open
            mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to error.');
        }
    });