// saathi-bazaar-backend/ai/recommendations.js
// This file contains AI logic for recommending mandi shops and providing search suggestions.

const SearchHistory = require('../models/SearchHistory'); // Imports SearchHistory model for AI search suggestions

// --- Mandi Recommendation (Simple AI) ---
// This function provides a simplified recommendation of mandi shops based on vendor's Firebase UID.
// In a real application, this would query your MongoDB database for a vendor's past interactions, preferred items, etc.,
// and then match that data against mandi specialties for a more advanced recommendation.
function getRecommendedMandis(vendorFirebaseUid) {
    // IMPORTANT: These are the ACTUAL MongoDB _id strings of your dummy MandiWholesaler documents
    // (from the output of your `seedMandis.js` script, Task 10.4).
    // And the Firebase UIDs are placeholders. You MUST replace them with the ACTUAL Firebase UIDs
    // you get when you register your demo users (e.g., Rajesh Sharma, Priya Singh) through the frontend app.

    const SEALDah_SABZI_BHANDAR_ID = '6884ed70afbf20cb42524d8d'; // From your seedMandis.js output
    const KOLEY_MARKET_ID = '6884ed70afbf20cb42524d91';       // From your seedMandis.js output

    // REMEMBER TO REPLACE THESE FIREBASE UID PLACEHOLDERS WITH YOUR ACTUAL UIDS AFTER REGISTRATION
    const RAJESH_SHARMA_FIREBASE_UID = 'YOUR_FIREBASE_UID_FOR_RAJESH_SHARMA'; // Get this after you register Rajesh via frontend
    const PRIYA_SINGH_FIREBASE_UID = 'YOUR_FIREBASE_UID_FOR_PRIYA_SINGH';     // Get this after you register Priya via frontend

    if (vendorFirebaseUid === RAJESH_SHARMA_FIREBASE_UID) {
        // Example: Recommend Sealdah Sabzi Bhandar primarily for Rajesh
        return [SEALDah_SABZI_BHANDAR_ID];
    } else if (vendorFirebaseUid === PRIYA_SINGH_FIREBASE_UID) {
        // Example: Recommend Koley Market primarily for Priya
        return [KOLEY_MARKET_ID];
    }
    // Default recommendations if no specific match (e.g., for new users or other demo users)
    return [SEALDah_SABZI_BHANDAR_ID, KOLEY_MARKET_ID];
}

// --- Search Suggestions (Simple AI) ---
// This function suggests search terms based on vendor's past searches and globally popular terms.
async function getSearchSuggestions(vendorMongoId, currentQuery) { // vendorMongoId is the vendor's MongoDB _id (from the database)
    const suggestions = new Set(); // Using a Set to store unique suggestions (avoids duplicates)
    const queryLower = currentQuery.toLowerCase(); // Convert current query to lowercase for matching

    // 1. Personalized History (Top recent searches by this specific vendor)
    // This part queries your MongoDB's 'search_histories' collection for the vendor's past searches.
    try {
        const personalHistory = await SearchHistory.find({ vendorId: vendorMongoId }) // Find searches by this specific vendor
                                                    .sort({ timestamp: -1 }) // Sort by newest searches first
                                                    .limit(5) // Get up to 5 most recent unique searches
                                                    .distinct('query'); // Get only the unique search terms (e.g., 'tomato', 'onion')
        personalHistory.forEach(s => {
            if (s.toLowerCase().startsWith(queryLower)) { // Check if the search term starts with what the user has typed
                suggestions.add(s); // Add it to suggestions if it matches
            }
        });
    } catch (error) {
        console.error("Error fetching personal search history:", error); // Log the error if there's an issue fetching from DB
        // If there's an error (e.g., database connection issues, or no data yet), continue without personalized suggestions from DB.
    }

    // 2. Global Popular Searches (Hardcoded for hackathon, but typically derived from aggregated search data of all users in a real system)
    const globalPopularSearches = ['Tomato', 'Onion', 'Potato', 'Dhaniya', 'Paneer', 'Green Chili', 'Ginger'];
    globalPopularSearches.forEach(s => {
        if (s.toLowerCase().startsWith(queryLower)) {
            suggestions.add(s);
        }
    });

    // 3. Common Available Product Names (Hardcoded for hackathon, in a real app, you'd query Product/MandiWholesaler models for actual available items)
    const availableProductNames = ['Tomato', 'Onion', 'Potato', 'Coriander', 'Dhaniya', 'Paneer', 'Milk', 'Bread', 'Green Chili', 'Ginger', 'Chilli Powder'];
    availableProductNames.forEach(s => {
        if (s.toLowerCase().startsWith(queryLower)) {
            suggestions.add(s);
        }
    });

    return Array.from(suggestions).slice(0, 5); // Convert the Set to an Array and return up to the top 5 unique suggestions
}

module.exports = { getRecommendedMandis, getSearchSuggestions }; // Exports these functions for use in API routes