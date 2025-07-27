// saathi-bazaar-frontend/src/pages/MandiDirectory.jsx
import React, { useState, useEffect } from 'react';
import api from '../api';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';

function MandiDirectory() {
  const [mandis, setMandis] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loadingMandis, setLoadingMandis] = useState(true);

  useEffect(() => {
    fetchMandis();
  }, []);

  const fetchMandis = async () => {
    setLoadingMandis(true);
    try {
      const res = await api.get('/mandi');
      setMandis(res.data);
    } catch (error) {
      console.error('Error fetching mandis:', error.response?.data || error.message);
      alert('Failed to load mandi shops.');
    } finally {
      setLoadingMandis(false);
    }
  };

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 1) {
      try {
        const res = await api.get(`/mandi/search-suggestions?query=${query}`);
        setSuggestions(res.data.suggestions);
      } catch (error) {
        console.error('Error getting search suggestions:', error.message);
      }
    } else {
      setSuggestions([]);
    }

    api.post('/mandi/log-search', { query }).catch(err => console.error('Failed to log search:', err));
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#16a34a' }}>
          Mandi Shop Directory
        </h1>

        {/* Search Bar with AI Suggestions */}
        <div style={{ marginBottom: '24px', position: 'relative' }}>
          <input
            type="text"
            placeholder="Search for items or mandi shops..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: '100%', padding: '12px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
          />
          {suggestions.length > 0 && (
            <ul style={{ position: 'absolute', zIndex: 10, width: '100%', backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px', marginTop: '4px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              {suggestions.map((s, index) => (
                <li
                  key={s + index}
                  style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
                  onClick={() => handleSuggestionClick(s)}
                >
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {mandis
              .filter(
                (mandi) =>
                  mandi.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (mandi.products_offered &&
                    mandi.products_offered.some((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
              )
              .map((mandi) => (
                <div
                  key={mandi._id}
                  className="card"
                  onClick={() => navigate(`/mandis/${mandi._id}`)}
                  style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}
                >
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px', color: '#1f2937' }}>
                    {mandi.shopName}
                  </h2>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '4px' }}>
                    Owner: {mandi.ownerName || 'N/A'}
                  </p>
                  <p style={{ color: '#4b5563', fontSize: '0.875rem', marginBottom: '8px' }}>
                    Store Type: {mandi.description || 'General Wholesaler'}
                  </p>
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: '#e0e0e0',
                      borderRadius: '50%',
                      margin: '0 auto 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      color: '#666',
                    }}
                  >
                    🏪
                  </div>
                  <p style={{ color: '#4b5563' }}>
                    Location: Lat {mandi.location.lat.toFixed(4)}, Long {mandi.location.long.toFixed(4)}
                  </p>
                  <div style={{ marginTop: '12px' }}>
                    <span style={{ fontWeight: 'bold' }}>Top Offers:</span>
                    <ul style={{ listStyle: 'disc', listStylePosition: 'inside', fontSize: '0.875rem', color: '#4b5563' }}>
                      {mandi.products_offered && mandi.products_offered.slice(0, 3).map((p) => (
                        <li key={`${p.name}-${p.unit}`}>{p.name} (₹{p.wholesale_price}/{p.unit})</li>
                      ))}
                      {(!mandi.products_offered || mandi.products_offered.length === 0) && (
                        <li>No specific offers listed.</li>
                      )}
                      {mandi.products_offered && mandi.products_offered.length > 3 && <li>...and more</li>}
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
