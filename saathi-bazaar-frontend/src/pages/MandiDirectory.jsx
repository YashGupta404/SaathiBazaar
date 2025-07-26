// saathi-bazaar-frontend/src/pages/MandiDirectory.jsx
// Basic functional page for the Mandi Shop Directory.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component
import { useNavigate } from 'react-router-dom'; // Hook for navigation

function MandiDirectory() {
  const [mandis, setMandis] = useState([]); // State to store fetched mandi shops
  const [searchQuery, setSearchQuery] = useState(''); // State for the search bar input
  const [suggestions, setSuggestions] = useState([]); // State for AI search suggestions
  const [loadingMandis, setLoadingMandis] = useState(true); // Loading indicator for fetching mandis

  // useEffect to fetch mandi shops when the page mounts
  useEffect(() => {
    fetchMandis(); // Fetch the initial list of mandis
  }, []); // Empty dependency array means this runs once on component mount

  // Function to fetch mandi shops from the backend (already includes AI sorting)
  const fetchMandis = async () => {
    setLoadingMandis(true); // Start loading
    try {
      const res = await api.get('/mandi'); // API call to your backend (this route implements AI recommendations)
      setMandis(res.data); // Update state with fetched mandis
    } catch (error) {
      console.error('Error fetching mandis:', error.response?.data || error.message);
      alert('Failed to load mandi shops.'); // Show error
    } finally {
      setLoadingMandis(false); // End loading
    }
  };

  // Handles changes in the search bar input and fetches AI suggestions
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query); // Update search query state
    if (query.length > 1) { // Only fetch suggestions if query is at least 2 characters long
      try {
        const res = await api.get(`/mandi/search-suggestions?query=${query}`); // API call to AI search suggestions backend
        setSuggestions(res.data.suggestions); // Update state with AI suggestions
      } catch (error) {
        console.error('Error getting search suggestions:', error.message);
      }
    } else {
      setSuggestions([]); // Clear suggestions if query is too short
    }
    // Log the search query to the backend for AI learning (even for hackathon demo)
    api.post('/mandi/log-search', { query }).catch(err => console.error('Failed to log search:', err));
  };

  // Handles when a user clicks on an AI search suggestion
  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion); // Fill the search bar with the selected suggestion
    setSuggestions([]); // Clear the suggestions list
    // You might want to automatically trigger a search/filter of mandis here based on the suggestion
  };

  const navigate = useNavigate(); // Initialize navigate hook

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}> {/* Basic container styling */}
      <Header /> {/* Includes your Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}> {/* Main content area */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#16a34a' }}>Mandi Shop Directory</h1>

        {/* Search Bar with AI Suggestions */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for items or mandi shops..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
          {suggestions.length > 0 && ( // Conditionally display suggestions if available
            <ul style={{ position: 'absolute', zIndex: 10, width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              {suggestions.map((s, index) => (
                <li key={index}
                    style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'} // Hover effect
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                    onClick={() => handleSuggestionClick(s)}>
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loadingMandis ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading mandi shops...</p>
        ) : mandis.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>No mandi shops found in your area. (Check your dummy data in MongoDB!)</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}> {/* Grid for mandi shop cards */}
            {mandis.filter(mandi => // Basic frontend filter for search query matching shop name or products
                                mandi.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                mandi.products_offered.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                            )
                   .map((mandi) => (
              <div key={mandi.id} className="card" onClick={() => navigate(`/mandis/${mandi.id}`)}
                   style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}> {/* Mandi shop card */}
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>{mandi.shopName}</h2>
                <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '8px' }}>{mandi.description}</p>
                <p style={{ color: '#4b5563' }}>Location: Lat {mandi.location.lat.toFixed(4)}, Long {mandi.location.long.toFixed(4)}</p>
                <div style={{ marginTop: '12px' }}>
                  <span style={{ fontWeight: 'bold' }}>Offers:</span>
                  <ul style={{ listStyle: 'disc', listStylePosition: 'inside', fontSize: '0.875rem', color: '#4b5563' }}>
                    {mandi.products_offered.slice(0, 3).map((p, idx) => ( // Show first 3 products
                      <li key={idx}>{p.name} (₹{p.wholesale_price}/{p.unit})</li>
                    ))}
                    {mandi.products_offered.length > 3 && <li>...and more</li>}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MandiDirectory;