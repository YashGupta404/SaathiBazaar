// seeders/seedUsers.js
// This script connects to MongoDB and inserts dummy user data into the 'users' collection.

const mongoose = require('mongoose'); // Imports the Mongoose library for interacting with MongoDB
const path = require('path'); // For resolving .env path safely across OS
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // Loads environment variables from the .env file, specifying its path relative to this script.

require('../models/User'); // Loads the User Mongoose model (blueprint for user data)
const User = mongoose.model('User'); // Gets the User model from Mongoose

// --- DEBUG: Show raw and cleaned MONGO_URI ---
// This line will print the value of MONGO_URI from your .env file to the terminal.
// This is very helpful for debugging to confirm if the variable is loaded correctly.
console.log('Raw MONGO_URI from process.env:', JSON.stringify(process.env.MONGO_URI || '')); // Added || '' for safety
console.log('Cleaned MONGO_URI:', (process.env.MONGO_URI || '').trim().replace(/^['"]+|['"]+$/g, ''));
// --- END DEBUG LINE ---

// Dummy user data — remember to replace UIDs with actual Firebase UIDs later
const usersData = [
    {
        // THIS UID HAS BEEN UPDATED WITH THE ACTUAL UID FROM YOUR BROWSER CONSOLE
        uid: 'O87XVkJsveMe7SWR9Aofx6a1INs1', // This is the actual logged-in Firebase UID from your browser console
        name: 'Rajesh Sharma',
        contact: '+919876543210',
        shop_name: 'Sharma Fast Food',
        location: { lat: 22.5700, long: 88.3697 } // Coordinates near Sealdah, Kolkata
    }, // <<< COMMMA ADDED HERE TO FIX SyntaxError
    {
        // This UID is still a placeholder. You can update it with another actual Firebase UID if you have one.
        uid: 'YOUR_FIREBASE_UID_FOR_PRIYA_SINGH', // <<< IMPORTANT: REPLACE THIS WITH AN ACTUAL Firebase UID later if you need it.
        name: 'Priya Singh',
        contact: '+919123456789',
        shop_name: 'Priya Snacks',
        location: { lat: 22.5750, long: 88.4150 } // Coordinates near New Town, Kolkata
    }
    // You can add more user objects here if you need more dummy users for testing.
    // Example:
    // {
    //     uid: 'YOUR_FIREBASE_UID_FOR_THIRD_USER',
    //     name: 'Amit Kumar',
    //     contact: '+918765432109',
    //     shop_name: 'Amit\'s Rolls',
    //     location: { lat: 22.5600, long: 88.3800 }
    // }
];

// Connects to MongoDB using the connection string stored in the MONGO_URI environment variable from your .env file.
const MONGO_URI = (process.env.MONGO_URI || '').trim().replace(/^['"]+|['"]+$/g, ''); // Re-define MONGO_URI here to use the cleaned value
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected for seeding users.');

        // Optional: Delete existing users before inserting new ones.
        // This is good for development, as it clears old data if you run the script multiple times.
        await User.deleteMany({});
        console.log('🧹 Existing users cleared.');

        // Insert the dummy user data into the 'users' collection in MongoDB.
        const insertedUsers = await User.insertMany(usersData);
        console.log(`🎉 Inserted ${insertedUsers.length} dummy users.\n`);

        insertedUsers.forEach(user => {
            console.log(`👤 User: ${user.name}`);
            console.log(`   🏪 Shop: ${user.shop_name}`);
            console.log(`   🔑 Firebase UID: ${user.uid}`); // Now this will show the actual UID
            console.log(`   🆔 MongoDB _id: ${user._id}\n`);
        });

        console.log('📌 Remember to keep these MongoDB _ids and ensure Firebase UIDs are correct.');
        console.log('    You will need them for Task 10.8 (updating ai/recommendations.js) and other seeding scripts.');

        // Close DB connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    })
    .catch(err => {
        console.error('❌ Error seeding users:', err); // Log any errors that occur during connection or seeding
        // Ensure the connection is closed even if there's an error.
        if (mongoose.connection.readyState === 1) { // Check if connection is open
            mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to error.');
        }
    });