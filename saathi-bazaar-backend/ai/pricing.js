// saathi-bazaar-backend/ai/pricing.js
// This AI function suggests a price for a surplus item based on predefined rules.
function getSuggestedPrice(item, quantity) {
    // These are dummy average retail prices for the hackathon.
    // In a real project, these prices would be dynamic, perhaps fetched from
    // market data APIs, or even learned from historical transaction data within your own app.
    const basePrices = {
        'Tomato': 40, // Example base price per kg
        'Onion': 30, // Example base price per kg
        'Potato': 25, // Example base price per kg
        'Coriander': 15, // Example base price per bunch
        'Dhaniya': 15 // Example base price per bunch (same as Coriander for simplicity)
    };
    const discountFactor = 0.7; // Suggest 30% off for peer-to-peer surplus sales (makes it attractive for buyers).

    const basePrice = basePrices[item] || 0; // Get the base price for the specific item from our list, default to 0 if the item isn't found
    // Calculate the suggested price: (base price * quantity * discount factor).
    // .toFixed(0) rounds the result to the nearest whole number (no decimals for price for simplicity).
    return (basePrice * quantity * discountFactor).toFixed(0);
}
module.exports = { getSuggestedPrice }; // Makes this function available to other parts of your backend (e.g., your API routes)