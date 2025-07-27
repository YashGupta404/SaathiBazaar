// saathi-bazaar-frontend/src/pages/VendorToVendor.jsx
// Basic functional page for Vendor-to-Vendor Surplus Exchange.
// Now hides action buttons for items listed by the current user.

import React, { useState, useEffect } from 'react'; // React hooks
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

function VendorToVendor() {
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [price, setPrice] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState('');
  const [surplusItems, setSurplusItems] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [loadingSurplus, setLoadingSurplus] = useState(true);

  const currentUserMongoId = localStorage.getItem('userId'); // Retrieves the user's MongoDB _id from localStorage

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = { lat: position.coords.latitude, long: position.coords.longitude };
          setUserLocation(loc);
          console.log('DEBUG: User location fetched:', loc);
          fetchSurplus(loc);
        },
        (error) => {
          console.error("Error getting location for surplus:", error);
          alert("Could not get your precise location. Displaying all surpluses (no distance filter).");
          console.log('DEBUG: User location not fetched, calling fetchSurplus with null location.');
          fetchSurplus(null);
        }
      );
    } else {
      alert("Geolocation not supported by your browser. Displaying all surpluses (no distance filter).");
      console.log('DEBUG: Geolocation not supported, calling fetchSurplus with null location.');
      fetchSurplus(null);
    }
  }, []);

  const fetchSurplus = async (location) => {
    setLoadingSurplus(true);
    try {
      const queryParams = location ? `?lat=${location.lat}&long=${location.long}` : '';
      const res = await api.get(`/vendor/surplus${queryParams}`);
      console.log('DEBUG: API Response for surplus items:', res.data);
      setSurplusItems(res.data);
    } catch (error) {
      console.error('Error fetching surplus items:', error.response?.data || error.message);
      alert('Failed to load surplus items.');
    } finally {
      setLoadingSurplus(false);
    }
  };

  const handlePriceSuggestion = async () => {
    if (itemName && quantity) {
      try {
        const res = await api.get(`/vendor/surplus/suggest-price?item=${itemName}&quantity=${quantity}`);
        setSuggestedPrice(res.data.suggestedPrice);
      }
      catch (error) {
        console.error('Error getting price suggestion:', error.response?.data || error.message);
        setSuggestedPrice('N/A');
      }
    } else {
        alert('Please select an item and enter a quantity to get a suggestion.');
    }
  };

  const handleSubmitSurplus = async (e) => {
    e.preventDefault();
    try {
      await api.post('/vendor/surplus', {
        itemName,
        quantity: parseFloat(quantity),
        unit,
        price: parseFloat(price)
      });
      alert('Surplus listed successfully!');
      setItemName('');
      setQuantity('');
      setUnit('kg');
      setPrice('');
      setSuggestedPrice('');
      fetchSurplus(userLocation); // Refresh the list of surplus items
    } catch (error) {
      console.error('Error posting surplus:', error.response?.data || error.message);
      alert('Failed to list surplus: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // Filter surplus items: those listed by the current user, and those by others
  const myListedSurpluses = surplusItems.filter(item => item.listedBy && item.listedBy.toString() === currentUserMongoId);
  const otherSurplusItems = surplusItems.filter(item => item.listedBy && item.listedBy.toString() !== currentUserMongoId);


  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#2563eb' }}>Vendor-to-Vendor Exchange</h1>

        {/* Sell Surplus Section */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Sell Your Surplus</h2>
          <form onSubmit={handleSubmitSurplus}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
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

        {/* My Listed Surpluses Section (New) */}
        <div className="card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>My Listed Surpluses</h2>
            {loadingSurplus ? (
                <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading your listed surpluses...</p>
            ) : myListedSurpluses.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#4b5563' }}>No surpluses listed by you yet.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {myListedSurpluses.map((item) => (
                        <div key={item.id} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#e0ffe0' }}> {/* Light green background for own items */}
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{item.name}</h3>
                            <p style={{ color: '#4b5563' }}>Quantity: {item.quantity} {item.unit}</p>
                            <p style={{ color: '#16a34a', fontSize: '1.25rem', fontWeight: 'bold' }}>₹{item.price}</p>
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
                                Listed by: {item.listedByShop || item.listedByName} (Me)
                            </p>
                            {/* Conceptual orders for own listed surpluses */}
                            <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>
                                Orders: <span style={{ color: '#ef4444', fontWeight: 'bold' }}>No new orders yet</span> (Conceptual)
                            </p>
                            {/* >>>>>>> HIDDEN BUTTONS FOR OWN LISTINGS <<<<<<< */}
                            {/* No buttons rendered if it's the current user's item */}
                        </div>
                    ))}
                </div>
            )}
        </div>


        {/* Buy Surplus Section (Existing) */}
        <div className="card">
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Buy Surplus from Nearby Vendors</h2>
          {loadingSurplus ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading nearby surpluses...</p>
          ) : otherSurplusItems.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>No surpluses available from other vendors nearby yet.</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {otherSurplusItems.map((item) => ( // Loop through items not listed by current user
                <div key={item.id} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{item.name}</h3>
                  <p style={{ color: '#4b5563' }}>Quantity: {item.quantity} {item.unit}</p>
                  <p style={{ color: '#16a34a', fontSize: '1.25rem', fontWeight: 'bold' }}>₹{item.price}</p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280' }}>Listed by: {item.listedByShop || item.listedByName} ({item.distance} km away)</p> {/* Display shop name */}
                  {/* Standard buttons for others' items */}
                  <button onClick={() => alert(`Please call vendor at (mock) +919999999999 to discuss this surplus of ${item.name}.`)}
                          style={{ background: '#22c55e', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}>
                    View Contact & Discuss
                  </button>
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