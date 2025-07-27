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
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--forest-50)', transition: 'all 0.3s ease' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}>
        {/* Animated Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px', opacity: 1, transform: 'translateY(0)', transition: 'all 0.6s ease' }}>
          <h1 style={{ 
            fontSize: '2.5rem', 
            fontWeight: 'bold', 
            marginBottom: '8px', 
            color: 'var(--emerald-700)',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔄 Vendor-to-Vendor Exchange
          </h1>
          <p style={{ color: 'var(--emerald-600)', fontSize: '1.1rem', opacity: '0.9' }}>
            Turn surplus into opportunity • Connect with nearby vendors
          </p>
        </div>

        {/* Sell Surplus Section */}
        <div className="card" style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(34, 197, 94, 0.05))',
          border: '2px solid var(--emerald-200)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--emerald-400), var(--forest-400))',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: 'var(--emerald-700)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            Sell Your Surplus
          </h2>
          <form onSubmit={handleSubmitSurplus}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  color: 'var(--emerald-700)',
                  transition: 'all 0.3s ease'
                }}>
                  🥬 Item Name
                </label>
                <select 
                  value={itemName} 
                  onChange={(e) => { setItemName(e.target.value); setSuggestedPrice(''); }}
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid var(--emerald-200)', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                >
                  <option value="">Select Item</option>
                  <option value="Tomato">🍅 Tomato</option>
                  <option value="Onion">🧅 Onion</option>
                  <option value="Potato">🥔 Potato</option>
                  <option value="Coriander">🌿 Coriander</option>
                  <option value="Dhaniya">🌱 Dhaniya</option>
                </select>
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  color: 'var(--emerald-700)'
                }}>
                  📊 Quantity
                </label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => { setQuantity(e.target.value); setSuggestedPrice(''); }}
                  required 
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid var(--emerald-200)', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                  placeholder="Enter quantity"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  color: 'var(--emerald-700)'
                }}>
                  ⚖️ Unit
                </label>
                <select 
                  value={unit} 
                  onChange={(e) => setUnit(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '12px 16px', 
                    border: '2px solid var(--emerald-200)', 
                    borderRadius: '12px',
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    background: 'white',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)'
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                >
                  <option value="kg">📦 kg</option>
                  <option value="bunch">🌾 bunch</option>
                  <option value="piece">🔢 piece</option>
                </select>
              </div>
              <div style={{ position: 'relative' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600', 
                  fontSize: '0.95rem',
                  color: 'var(--emerald-700)'
                }}>
                  💰 Your Price (₹)
                </label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    required 
                    style={{ 
                      width: '100%', 
                      padding: '12px 16px', 
                      border: '2px solid var(--emerald-200)', 
                      borderRadius: '12px',
                      fontSize: '1rem',
                      transition: 'all 0.3s ease',
                      background: 'white',
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.1)',
                      paddingRight: '50px'
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--emerald-400)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--emerald-200)'}
                    placeholder="Enter price"
                  />
                  <span style={{ 
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--emerald-600)',
                    fontWeight: 'bold'
                  }}>₹</span>
                </div>
                <button 
                  type="button" 
                  onClick={handlePriceSuggestion}
                  style={{ 
                    background: 'linear-gradient(135deg, var(--mint-400), var(--emerald-400))', 
                    color: 'white', 
                    fontSize: '0.875rem', 
                    fontWeight: '600',
                    padding: '8px 16px', 
                    borderRadius: '8px', 
                    border: 'none', 
                    cursor: 'pointer', 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginTop: '12px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(20, 184, 166, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(20, 184, 166, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 12px rgba(20, 184, 166, 0.3)';
                  }}
                >
                  🤖 AI Price Suggestion
                </button>
                {suggestedPrice && (
                  <div style={{ 
                    marginTop: '12px',
                    padding: '12px',
                    background: 'linear-gradient(135deg, var(--emerald-50), var(--forest-50))',
                    border: '2px solid var(--emerald-200)',
                    borderRadius: '8px',
                    animation: 'fadeIn 0.3s ease'
                  }}>
                    <p style={{ 
                      fontSize: '0.95rem', 
                      color: 'var(--emerald-700)', 
                      margin: 0,
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      💡 AI Suggestion: <span style={{ fontSize: '1.1rem', color: 'var(--emerald-600)' }}>₹{suggestedPrice}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
            <button 
              type="submit" 
              style={{ 
                background: 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))', 
                color: 'white', 
                padding: '16px 32px', 
                borderRadius: '12px', 
                border: 'none', 
                cursor: 'pointer', 
                width: '100%',
                fontSize: '1.1rem',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 24px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>📝</span>
              List Surplus
            </button>
          </form>
        </div>

        {/* My Listed Surpluses Section */}
        <div className="card" style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(20, 184, 166, 0.05))',
          border: '2px solid var(--forest-200)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, var(--forest-400), var(--mint-400))',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: 'var(--forest-700)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            My Listed Surpluses
          </h2>
          {loadingSurplus ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '50px',
                height: '50px',
                border: '4px solid var(--forest-200)',
                borderTop: '4px solid var(--forest-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                color: 'var(--forest-600)', 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Loading your listed surpluses...
              </p>
            </div>
          ) : myListedSurpluses.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              border: '2px dashed var(--forest-300)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📦</div>
              <p style={{ 
                color: 'var(--forest-600)', 
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                No surpluses listed yet
              </p>
              <p style={{ 
                color: 'var(--forest-500)', 
                fontSize: '0.95rem'
              }}>
                Start by listing your first surplus above!
              </p>
            </div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px',
                animation: 'fadeIn 0.5s ease'
              }}>
                {myListedSurpluses.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="card" 
                    style={{ 
                      border: '2px solid var(--emerald-200)', 
                      background: 'linear-gradient(135deg, var(--emerald-50), var(--forest-50))',
                      borderRadius: '16px',
                      boxShadow: '0 8px 24px rgba(16, 185, 129, 0.15)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      overflow: 'hidden',
                      animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 12px 32px rgba(16, 185, 129, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(16, 185, 129, 0.15)';
                    }}
                  >
                    <div style={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'linear-gradient(90deg, var(--emerald-400), var(--forest-400))'
                    }}></div>
                    <div style={{ 
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: 'var(--emerald-500)',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '600'
                    }}>
                      MY LISTING
                    </div>
                    <h3 style={{ 
                      fontSize: '1.3rem', 
                      fontWeight: 'bold', 
                      color: 'var(--emerald-700)',
                      marginBottom: '12px',
                      marginTop: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span style={{ fontSize: '1.5rem' }}>
                        {item.name === 'Tomato' ? '🍅' : 
                         item.name === 'Onion' ? '🧅' : 
                         item.name === 'Potato' ? '🥔' : 
                         item.name === 'Coriander' ? '🌿' : 
                         item.name === 'Dhaniya' ? '🌱' : '🥬'}
                      </span>
                      {item.name}
                    </h3>
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <p style={{ 
                        color: 'var(--emerald-600)', 
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        margin: 0
                      }}>
                        📦 {item.quantity} {item.unit}
                      </p>
                      <p style={{ 
                        color: 'var(--forest-600)', 
                        fontSize: '1.4rem', 
                        fontWeight: 'bold',
                        margin: 0
                      }}>
                        ₹{item.price}
                      </p>
                    </div>
                    <div style={{ 
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.7)',
                      borderRadius: '8px',
                      marginBottom: '12px'
                    }}>
                      <p style={{ 
                        fontSize: '0.9rem', 
                        color: 'var(--emerald-600)', 
                        margin: '0 0 8px 0',
                        fontWeight: '500'
                      }}>
                        🏪 Listed by: {item.listedByShop || item.listedByName} (You)
                      </p>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px'
                      }}>
                        <span style={{ 
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: 'var(--emerald-400)',
                          animation: 'pulse 2s infinite'
                        }}></span>
                        <p style={{ 
                          fontSize: '0.9rem', 
                          color: 'var(--emerald-600)', 
                          margin: 0,
                          fontWeight: '500'
                        }}>
                          📋 Orders: <span style={{ color: 'var(--forest-500)' }}>Awaiting buyers</span>
                        </p>
                      </div>
                    </div>
                            {/* >>>>>>> HIDDEN BUTTONS FOR OWN LISTINGS <<<<<<< */}
                            {/* No buttons rendered if it's the current user's item */}
                        </div>
                    ))}
                </div>
            )}
        </div>


        {/* Buy Surplus Section */}
        <div className="card" style={{ 
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(139, 92, 246, 0.05))',
          border: '2px solid #e0e7ff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.15)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#4f46e5',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            Buy Surplus from Nearby Vendors
          </h2>
          {loadingSurplus ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px'
            }}>
              <div style={{ 
                width: '50px',
                height: '50px',
                border: '4px solid #e0e7ff',
                borderTop: '4px solid #6366f1',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                color: '#4f46e5', 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Loading nearby surpluses...
              </p>
            </div>
          ) : otherSurplusItems.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              border: '2px dashed #c7d2fe'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <p style={{ 
                color: '#4f46e5', 
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                No surpluses available nearby
              </p>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.95rem'
              }}>
                Check back later or expand your search area!
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '20px',
              animation: 'fadeIn 0.5s ease'
            }}>
              {otherSurplusItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className="card" 
                  style={{ 
                    border: '2px solid #e0e7ff', 
                    background: 'linear-gradient(135deg, #fafbff, #f3f4f6)',
                    borderRadius: '16px',
                    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.15)',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 32px rgba(99, 102, 241, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.15)';
                  }}
                >
                  <div style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: 'linear-gradient(90deg, #6366f1, #8b5cf6)'
                  }}></div>
                  <div style={{ 
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    background: '#6366f1',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    📍 {item.distance} km
                  </div>
                  <h3 style={{ 
                    fontSize: '1.3rem', 
                    fontWeight: 'bold', 
                    color: '#4f46e5',
                    marginBottom: '12px',
                    marginTop: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>
                      {item.name === 'Tomato' ? '🍅' : 
                       item.name === 'Onion' ? '🧅' : 
                       item.name === 'Potato' ? '🥔' : 
                       item.name === 'Coriander' ? '🌿' : 
                       item.name === 'Dhaniya' ? '🌱' : '🥬'}
                    </span>
                    {item.name}
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                    <p style={{ 
                      color: '#6366f1', 
                      fontSize: '1.1rem',
                      fontWeight: '600',
                      margin: 0
                    }}>
                      📦 {item.quantity} {item.unit}
                    </p>
                    <p style={{ 
                      color: '#059669', 
                      fontSize: '1.4rem', 
                      fontWeight: 'bold',
                      margin: 0
                    }}>
                      ₹{item.price}
                    </p>
                  </div>
                  <div style={{ 
                    padding: '12px',
                    background: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    marginBottom: '16px'
                  }}>
                    <p style={{ 
                      fontSize: '0.9rem', 
                      color: '#4f46e5', 
                      margin: 0,
                      fontWeight: '500'
                    }}>
                      🏪 Listed by: {item.listedByShop || item.listedByName}
                    </p>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                      onClick={() => alert(`Please call vendor at (mock) +919999999999 to discuss this surplus of ${item.name}.`)}
                      style={{ 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: 'white', 
                        padding: '12px 16px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '1rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                      }}
                    >
                      <span>📞</span>
                      Contact & Discuss
                    </button>
                    <button 
                      onClick={() => alert('Delivery partner requested for this item! (Mock confirmation)')}
                      style={{ 
                        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                        color: 'white', 
                        padding: '10px 16px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-2px)';
                        e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                      }}
                    >
                      <span>🚚</span>
                      Request Delivery
                    </button>
                  </div>
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