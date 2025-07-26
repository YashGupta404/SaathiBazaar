// saathi-bazaar-backend/utils/location.js
// This function calculates the approximate distance between two geographical points (latitude and longitude) on Earth, in kilometers.
// It uses the Haversine formula, which is a common and accurate method for this purpose over short distances.
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in kilometers (using an average radius)
    const dLat = (lat2 - lat1) * Math.PI / 180; // Convert latitude difference from degrees to radians
    const dLon = (lon2 - lon1) * Math.PI / 180; // Convert longitude difference from degrees to radians
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) + // First part of the Haversine formula
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * // Ensures correct weighting for latitudes
        Math.sin(dLon / 2) * Math.sin(dLon / 2); // Second part of the Haversine formula
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); // Calculates the angular distance in radians
    const distance = R * c; // Multiply by Earth's radius to get the distance in kilometers
    return distance; // Returns the calculated distance
}
module.exports = { calculateDistance }; // Makes this function available to other parts of your backend (e.g., your API routes)