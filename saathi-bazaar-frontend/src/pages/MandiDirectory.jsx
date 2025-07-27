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
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--mint-50), var(--emerald-50))',
      transition: 'all 0.3s ease'
    }}>
      <Header />
      <div style={{ 
        maxWidth: '960px', 
        margin: '0 auto', 
        padding: '16px', 
        paddingTop: '80px' 
      }}>
        {/* Animated Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '32px',
          animation: 'fadeIn 0.6s ease'
        }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '8px',
            color: 'var(--mint-700)',
            background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🏪 Mandi Shop Directory
          </h1>
          <p style={{ 
            color: 'var(--mint-600)', 
            fontSize: '1.1rem', 
            opacity: '0.9',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}>
            Discover wholesale suppliers in your area
          </p>
        </div>

        {/* Enhanced Search Bar */}
        <div style={{ 
          marginBottom: '32px', 
          position: 'relative',
          animation: 'fadeIn 0.6s ease 0.3s both'
        }}>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="🔍 Search for items or mandi shops..."
              value={searchQuery}
              onChange={handleSearchChange}
              style={{ 
                width: '100%', 
                padding: '16px 20px', 
                border: '2px solid var(--mint-200)', 
                borderRadius: '16px', 
                fontSize: '1.1rem',
                background: 'rgba(255, 255, 255, 0.9)',
                boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
                transition: 'all 0.3s ease',
                outline: 'none'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--emerald-400)';
                e.target.style.boxShadow = '0 8px 25px rgba(16, 163, 74, 0.15)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--mint-200)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.08)';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          
          {suggestions.length > 0 && (
            <ul style={{ 
              position: 'absolute', 
              zIndex: 10, 
              width: '100%', 
              background: 'rgba(255, 255, 255, 0.95)', 
              backdropFilter: 'blur(10px)',
              border: '2px solid var(--mint-200)', 
              borderRadius: '16px', 
              marginTop: '8px', 
              boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              overflow: 'hidden',
              animation: 'fadeIn 0.3s ease'
            }}>
              {suggestions.map((s, index) => (
                <li
                  key={s + index}
                  style={{ 
                    padding: '16px 20px', 
                    cursor: 'pointer', 
                    borderBottom: index < suggestions.length - 1 ? '1px solid var(--mint-100)' : 'none',
                    transition: 'all 0.2s ease',
                    fontSize: '1rem',
                    color: 'var(--mint-700)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--mint-50)';
                    e.currentTarget.style.color = 'var(--emerald-700)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--mint-700)';
                  }}
                  onClick={() => handleSuggestionClick(s)}
                >
                  <span style={{ marginRight: '8px' }}>🔍</span>{s}
                </li>
              ))}
            </ul>
          )}
        </div>

        {loadingMandis ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
          }}>
            <div style={{ 
              width: '60px',
              height: '60px',
              border: '4px solid var(--mint-200)',
              borderTop: '4px solid var(--mint-500)',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ 
              color: 'var(--mint-600)', 
              fontSize: '1.2rem',
              fontWeight: '500'
            }}>
              Finding mandi shops near you...
            </p>
          </div>
        ) : mandis.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '2px dashed var(--mint-300)',
            animation: 'fadeIn 0.6s ease 0.4s both'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>🏪</div>
            <h2 style={{ 
              color: 'var(--mint-700)', 
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              No mandi shops found
            </h2>
            <p style={{ 
              color: 'var(--mint-600)', 
              fontSize: '1.1rem'
            }}>
              Check your area or try searching with different keywords
            </p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
            gap: '24px',
            animation: 'fadeIn 0.6s ease 0.4s both'
          }}>
            {mandis
              .filter(
                (mandi) =>
                  mandi.shopName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (mandi.products_offered &&
                    mandi.products_offered.some((p) =>
                      p.name.toLowerCase().includes(searchQuery.toLowerCase())
                    ))
              )
              .map((mandi, index) => (
                <div
                  key={mandi._id}
                  onClick={() => navigate(`/mandis/${mandi._id}`)}
                  style={{ 
                    cursor: 'pointer', 
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: '2px solid var(--mint-200)', 
                    borderRadius: '20px',
                    padding: '24px',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-8px)';
                    e.target.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
                    e.target.style.borderColor = 'var(--emerald-300)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.08)';
                    e.target.style.borderColor = 'var(--mint-200)';
                  }}
                >
                  {/* Gradient accent line */}
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '5px',
                    background: 'linear-gradient(90deg, var(--emerald-400), var(--mint-400))'
                  }}></div>

                  {/* Shop Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, var(--mint-100), var(--emerald-100))',
                    borderRadius: '20px',
                    margin: '0 auto 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '2.5rem',
                    border: '3px solid var(--mint-200)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}>
                    🏪
                  </div>

                  {/* Shop Details */}
                  <h2 style={{ 
                    fontSize: '1.4rem', 
                    fontWeight: '700', 
                    marginBottom: '12px', 
                    color: 'var(--mint-700)',
                    textAlign: 'center',
                    lineHeight: '1.3'
                  }}>
                    {mandi.shopName}
                  </h2>
                  
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '8px', 
                    marginBottom: '16px' 
                  }}>
                    <p style={{ 
                      color: 'var(--mint-600)', 
                      fontSize: '0.95rem', 
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>👤</span> <strong>Owner:</strong> {mandi.ownerName || 'N/A'}
                    </p>
                    <p style={{ 
                      color: 'var(--mint-600)', 
                      fontSize: '0.95rem', 
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>�️</span> <strong>Type:</strong> {mandi.description || 'General Wholesaler'}
                    </p>
                    <p style={{ 
                      color: 'var(--mint-600)', 
                      fontSize: '0.95rem', 
                      margin: 0,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📍</span> <strong>Location:</strong> Lat {mandi.location.lat.toFixed(4)}, Long {mandi.location.long.toFixed(4)}
                    </p>
                  </div>

                  {/* Top Offers Section */}
                  <div style={{ 
                    background: 'var(--mint-50)', 
                    borderRadius: '12px', 
                    padding: '16px',
                    border: '1px solid var(--mint-100)'
                  }}>
                    <h3 style={{ 
                      fontWeight: '600', 
                      color: 'var(--emerald-700)',
                      fontSize: '1rem',
                      margin: '0 0 12px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <span>⭐</span> Top Offers:
                    </h3>
                    <ul style={{ 
                      listStyle: 'none', 
                      padding: 0, 
                      margin: 0,
                      fontSize: '0.9rem', 
                      color: 'var(--mint-600)' 
                    }}>
                      {mandi.products_offered && mandi.products_offered.slice(0, 3).map((p, i) => (
                        <li key={`${p.name}-${p.unit}`} style={{ 
                          padding: '4px 0',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}>
                          <span style={{ 
                            width: '6px', 
                            height: '6px', 
                            borderRadius: '50%', 
                            background: 'var(--emerald-400)',
                            flexShrink: 0
                          }}></span>
                          <span><strong>{p.name}</strong> - ₹{p.wholesale_price}/{p.unit}</span>
                        </li>
                      ))}
                      {(!mandi.products_offered || mandi.products_offered.length === 0) && (
                        <li style={{ 
                          padding: '4px 0',
                          fontStyle: 'italic',
                          color: 'var(--mint-500)'
                        }}>
                          <span>📋</span> Contact for product details
                        </li>
                      )}
                      {mandi.products_offered && mandi.products_offered.length > 3 && (
                        <li style={{ 
                          padding: '4px 0',
                          fontWeight: '500',
                          color: 'var(--emerald-600)'
                        }}>
                          <span>➕</span> ...and {mandi.products_offered.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>

                  {/* Hover indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    background: 'var(--emerald-500)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    opacity: '0.7',
                    transition: 'all 0.3s ease'
                  }}>
                    →
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
