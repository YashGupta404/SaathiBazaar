// saathi-bazaar-frontend/src/pages/VendorToVendor.jsx
// Basic functional page for Vendor-to-Vendor Surplus Exchange.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react'; // React hooks
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

function VendorToVendor() {
  const [itemName, setItemName] = useState(''); // State for item name in "Sell Surplus" form
  const [quantity, setQuantity] = useState(''); // State for quantity
  const [unit, setUnit] = useState('kg'); // State for unit (kg, bunch, piece)
  const [price, setPrice] = useState(''); // State for price
  const [suggestedPrice, setSuggestedPrice] = useState(''); // State for AI suggested price
  const [surplusItems, setSurplusItems] = useState([]); // State to store fetched surplus items
  const [userLocation, setUserLocation] = useState(null); // State to store current user's location
  const [loadingSurplus, setLoadingSurplus] = useState(true); // Loading indicator for fetching surpluses

  // useEffect to fetch user's location and then load surplus items when the page mounts
  useEffect(() => {
    // Try to get user's current location from browser
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, long: position.coords.longitude };
          setUserLocation(loc); // Store user's location
          fetchSurplus(loc); // Fetch surplus items based on this location
        },
        (error) => {
          console.error("Error getting location for surplus:", error);
          alert("Could not get your precise location. Displaying all surpluses (no distance filter).");
          fetchSurplus(null); // If location fails, fetch all surpluses without distance filter
        }
      );
    } else {
      alert("Geolocation not supported by your browser. Displaying all surpluses (no distance filter).");
      fetchSurplus(null); // If geolocation not supported, fetch all surpluses
    }
  }, []); // Empty dependency array means this runs once on component mount

  // Function to fetch surplus items from the backend
  const fetchSurplus = async (location) => {
    setLoadingSurplus(true); // Start loading
    try {
      // Construct query parameters if location is available
      const queryParams = location ? `?lat=${location.lat}&long=${location.long}` : '';
      const res = await api.get(`/vendor/surplus${queryParams}`); // API call to your backend
      setSurplusItems(res.data); // Update state with fetched items
    } catch (error) {
      console.error('Error fetching surplus items:', error.response?.data || error.message);
      alert('Failed to load surplus items.'); // Show error
    } finally {
      setLoadingSurplus(false); // End loading
    }
  };

  // Handles click on "Suggest Price (AI)" button
  const handlePriceSuggestion = async () => {
    if (itemName && quantity) { // Only suggest if item name and quantity are provided
      try {
        const res = await api.get(`/vendor/surplus/suggest-price?item=${itemName}&quantity=${quantity}`); // API call to AI pricing backend
        setSuggestedPrice(res.data.suggestedPrice); // Update state with AI suggestion
      } catch (error) {
        console.error('Error getting price suggestion:', error.response?.data || error.message);
        setSuggestedPrice('N/A'); // Show N/A on error
      }
    } else {
        alert('Please select an item and enter a quantity to get a suggestion.');
    }
  };

  // Handles submission of the "Sell Surplus" form
  const handleSubmitSurplus = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    try {
      await api.post('/vendor/surplus', { // API call to post new surplus item to backend
        itemName,
        quantity: parseFloat(quantity), // Convert quantity to number
        unit,
        price: parseFloat(price) // Convert price to number
      });
      alert('Surplus listed successfully!'); // Success message
      // Clear form fields after successful submission
      setItemName('');
      setQuantity('');
      setUnit('kg');
      setPrice('');
      setSuggestedPrice('');
      fetchSurplus(userLocation); // Refresh the list of surplus items to show the newly added one
    } catch (error) {
      console.error('Error posting surplus:', error.response?.data || error.message);
      alert('Failed to list surplus: ' + (error.response?.data?.error || 'Unknown error')); // Show detailed error
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}> {/* Basic container styling */}
      <Header /> {/* Includes your Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}> {/* Main content area */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#2563eb' }}>Vendor-to-Vendor Exchange</h1>

        {/* Sell Surplus Section */}
        <div className="card" style={{ marginBottom: '32px' }}> {/* Uses 'card' class from index.css */}
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Sell Your Surplus</h2>
          <form onSubmit={handleSubmitSurplus}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}> {/* Basic grid for form fields */}
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>Item Name</label>
                <select value={itemName} onChange={(e) => { setItemName(e.target.value); setSuggestedPrice(''); }}
                        required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="">Select Item</option>
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Potato">Potato</option>
                  <option value="Coriander">Coriander</option>
                  <option value="Dhaniya">Dhaniya</option>
                  {/* Add more common items as needed */}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>Quantity</label>
                <input type="number" value={quantity} onChange={(e) => { setQuantity(e.target.value); setSuggestedPrice(''); }}
                       required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>Unit</label>
                <select value={unit} onChange={(e) => setUnit(e.target.value)}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}>
                  <option value="kg">kg</option>
                  <option value="bunch">bunch</option>
                  <option value="piece">piece</option>
                </select>
              </div>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', marginBottom: '4px', fontWeight: 'bold', fontSize: '0.875rem' }}>Your Price (₹)</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                     required style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
              <button type="button" onClick={handlePriceSuggestion}
                      style={{ background: '#e5e7eb', color: '#1f2937', fontSize: '0.875rem', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', display: 'inline-block', width: 'auto', marginTop: '8px' }}>
                Suggest Price (AI)
              </button>
              {suggestedPrice && <p style={{ fontSize: '0.875rem', color: '#16a34a', marginTop: '4px' }}>AI Suggestion: ₹{suggestedPrice}</p>}
            </div>
            <button type="submit" style={{ background: '#3b82f6', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%' }}>
              List Surplus
            </button>
          </form>
        </div>

        {/* Buy Surplus Section */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Buy Surplus from Nearby Vendors</h2>
          {loadingSurplus ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading nearby surpluses...</p>
          ) : surplusItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>No surplus items available nearby yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}> {/* Grid for surplus items */}
              {surplusItems.map((item) => (
                <div key={item.id} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}> {/* Item card */}
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{item.name}</h3>
                  <p style={{ color: '#4b5563' }}>Quantity: {item.quantity} {item.unit}</p>
                  <p style={{ color: '#16a34a', fontSize: '1.25rem', fontWeight: 'bold' }}>₹{item.price}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Listed by: {item.listedByShop || item.listedByName} ({item.distance} km away)</p>
                  {/* Conceptual "View Contact" button */}
                  <button onClick={() => alert(`Please call vendor at (mock) +919999999999 to discuss this surplus of ${item.name}.`)}
                          style={{ background: '#22c55e', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}>
                    View Contact & Discuss
                  </button>
                  {/* Conceptual "Request Delivery Partner" button */}
                  <button onClick={() => alert('Delivery partner requested for this item! (Mock confirmation)')}
                          style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.875rem' }}>
                    Request Delivery Partner (Optional)
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorToVendor;