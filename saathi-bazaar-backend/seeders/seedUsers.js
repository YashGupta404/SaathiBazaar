// seeders/seedUsers.js
// This script connects to MongoDB and inserts dummy user data into the 'users' collection.

const mongoose = require('mongoose'); // MongoDB ORM
const path = require('path'); // For resolving .env path safely across OS
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); // ✅ Absolute path to .env file

require('../models/User'); // Import User Mongoose model
const User = mongoose.model('User');

// --- DEBUG: Show raw and cleaned MONGO_URI ---
const rawMongoUri = process.env.MONGO_URI || '';
console.log('Raw MONGO_URI from process.env:', JSON.stringify(rawMongoUri));

// Clean MONGO_URI: trim, remove wrapping ' or "
const MONGO_URI = rawMongoUri.trim().replace(/^['"]+|['"]+$/g, '');
console.log('Cleaned MONGO_URI:', MONGO_URI);

// Dummy user data — remember to replace UIDs with actual Firebase UIDs later
const usersData = [
    {
        uid: 'YOUR_FIREBASE_UID_FOR_RAJESH_SHARMA',
        name: 'Rajesh Sharma',
        contact: '+919876543210',
        shop_name: 'Sharma Fast Food',
        location: { lat: 22.5700, long: 88.3697 }
    },
    {
        uid: 'YOUR_FIREBASE_UID_FOR_PRIYA_SINGH',
        name: 'Priya Singh',
        contact: '+919123456789',
        shop_name: 'Priya Snacks',
        location: { lat: 22.5750, long: 88.4150 }
    }
];

// Connect to MongoDB and seed data
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB connected for seeding users.');

        // Optional: clean existing data
        await User.deleteMany({});
        console.log('🧹 Existing users cleared.');

        // Insert dummy users
        const insertedUsers = await User.insertMany(usersData);
        console.log(`🎉 Inserted ${insertedUsers.length} dummy users.\n`);

        insertedUsers.forEach(user => {
            console.log(`👤 User: ${user.name}`);
            console.log(`   🏪 Shop: ${user.shop_name}`);
            console.log(`   🔑 Firebase UID (placeholder): ${user.uid}`);
            console.log(`   🆔 MongoDB _id: ${user._id}\n`);
        });

        console.log('📌 Remember to update Firebase UIDs and save MongoDB _ids.\n');

        // Close DB connection
        await mongoose.connection.close();
        console.log('🔌 MongoDB connection closed.');
    })
    .catch(err => {
        console.error('❌ Error seeding users:', err);
        if (mongoose.connection.readyState === 1) {
            mongoose.connection.close();
            console.log('🔌 MongoDB connection closed due to error.');
        }
    });
