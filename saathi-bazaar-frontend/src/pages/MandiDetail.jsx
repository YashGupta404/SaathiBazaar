// saathi-bazaar-frontend/src/pages/MandiDetail.jsx
// Basic functional page for Mandi Shop Details.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom'; // Hook to get parameters from the URL (e.g., mandi ID)
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

function MandiDetail() {
  const { id } = useParams(); // Gets the 'id' parameter from the URL (e.g., '/mandis/123' -> id = '123')
  const [mandi, setMandi] = useState(null); // State to store fetched mandi details
  const [loading, setLoading] = useState(true); // Loading indicator
  const [error, setError] = useState(null); // Error message state

  // useEffect to fetch specific mandi details when the page loads or ID changes
  useEffect(() => {
    const fetchMandi = async () => {
      setLoading(true); // Start loading
      try {
        const res = await api.get(`/mandi/${id}`); // API call to your backend to get details by ID
        setMandi(res.data); // Update state with fetched mandi
      } catch (err) {
        setError('Failed to load mandi details. Please try again or check if the ID is valid.'); // Set error message
        console.error('Error fetching mandi details:', err.response?.data || err.message);
      } finally {
        setLoading(false); // End loading
      }
    };
    fetchMandi(); // Call the fetch function
  }, [id]); // Dependency array: re-run if 'id' from URL changes

  if (loading) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#4b5563' }}>Loading mandi details...</div>;
  if (error) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#ef4444' }}>{error}</div>;
  if (!mandi) return <div style={{ textAlign: 'center', paddingTop: '80px', color: '#4b5563' }}>Mandi not found.</div>;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}> {/* Basic container styling */}
      <Header /> {/* Includes your Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}> {/* Main content area */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#16a34a' }}>{mandi.shopName}</h1> {/* Mandi shop name as heading */}
        <div className="card" style={{ marginBottom: '32px' }}> {/* Card for mandi details */}
          <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Owner:</strong> {mandi.ownerName || 'N/A'}</p>
          <p style={{ color: '#374151', marginBottom: '8px' }}><strong>Address/Description:</strong> {mandi.description || `Lat: ${mandi.location.lat.toFixed(4)}, Long: ${mandi.location.long.toFixed(4)}`}</p>
          <p style={{ color: '#374151', marginBottom: '16px' }}><strong>Contact:</strong> {mandi.contact || 'N/A'}</p>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>Available Products</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}> {/* Grid for products offered */}
            {mandi.products_offered.map((product, index) => (
              <div key={index} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}> {/* Product card */}
                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{product.name}</h3>
                <p style={{ color: '#4b5563' }}>Price: ₹{product.wholesale_price} / {product.unit}</p>
                {product.min_bulk_qty && product.bulk_price && ( // Display bulk offer if available
                  <p style={{ color: '#16a34a' }}>Bulk Offer: ₹{product.bulk_price} / {product.unit} for {product.min_bulk_qty}+ {product.unit}</p>
                )}
                {/* Conceptual "Call & Order" button */}
                <button
                  onClick={() => alert(`Please call ${mandi.contact || 'the shop'} to place an order for ${product.name}.`)}
                  style={{ background: '#3b82f6', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '16px' }}>
                  Call & Order
                </button>
                {/* Conceptual "Request Delivery Partner" button */}
                <button
                  onClick={() => alert('Delivery partner requested for this item from Mandi! (Mock confirmation)')}
                  style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '8px', fontSize: '0.875rem' }}>
                  Request Delivery Partner (Optional)
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MandiDetail;