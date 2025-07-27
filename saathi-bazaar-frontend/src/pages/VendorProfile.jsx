// saathi-bazaar-frontend/src/pages/VendorProfile.jsx
// Basic functional page for Vendor Profile and Order History.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component
import { auth } from '../firebase'; // Firebase client-side auth for logout
import { Link, useNavigate } from 'react-router-dom'; // For logout navigation and Cart Link

function VendorProfile() {
  const [userDetails, setUserDetails] = useState(null); // State to store fetched user details
  const [loadingUser, setLoadingUser] = useState(true); // Loading indicator for user data
  const [userOrders, setUserOrders] = useState([]); // State to store fetched orders
  const [loadingOrders, setLoadingOrders] = useState(true); // Loading indicator for orders
  const [locationAddress, setLocationAddress] = useState(''); // State to store converted address
  const [loadingAddress, setLoadingAddress] = useState(false); // Loading indicator for address conversion
  const navigate = useNavigate();

  // Function to convert coordinates to address
  const getAddressFromCoordinates = async (lat, lng) => {
    if (!lat || !lng) return 'Location not available';
    
    setLoadingAddress(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          const address = data.address;
          let formattedAddress = '';
          
          if (address) {
            const parts = [];
            if (address.house_number && address.road) {
              parts.push(`${address.house_number} ${address.road}`);
            } else if (address.road) {
              parts.push(address.road);
            }
            if (address.neighbourhood || address.suburb) {
              parts.push(address.neighbourhood || address.suburb);
            }
            if (address.city || address.town || address.village) {
              parts.push(address.city || address.town || address.village);
            }
            if (address.state) {
              parts.push(address.state);
            }
            if (address.postcode) {
              parts.push(address.postcode);
            }
            
            formattedAddress = parts.join(', ') || data.display_name;
          } else {
            formattedAddress = data.display_name;
          }
          
          return formattedAddress;
        }
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } finally {
      setLoadingAddress(false);
    }
  };

  // useEffect to fetch current user's full details and orders when the page mounts
  useEffect(() => {
    const fetchDetailsAndOrders = async () => {
      const firebaseUser = auth.currentUser; // Get currently logged-in Firebase user
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken(); // Get ID token for backend authentication

          // Fetch full user details from backend (your /api/auth/login route already provides this now)
          // This call also serves to verify the session and get the latest user data from MongoDB
          const userRes = await api.post('/auth/login', { idToken });
          setUserDetails(userRes.data.user); // Store the entire user object from MongoDB
          console.log('DEBUG: VendorProfile - Fetched User Details:', userRes.data.user); // Debug log

          // Convert coordinates to address if location is available
          if (userRes.data.user.location?.lat && userRes.data.user.location?.long) {
            const address = await getAddressFromCoordinates(
              userRes.data.user.location.lat, 
              userRes.data.user.location.long
            );
            setLocationAddress(address);
          }

          // --- IMPORTANT TEMPORARY CHANGE: Commenting out order fetch for now ---
          // The /api/order/my-orders route has NOT been built yet.
          // Calling it now would cause an error. We will build this route later.
          // For now, userOrders will remain empty until the backend API is ready.
          /*
          const ordersRes = await api.get('/api/order/my-orders'); // <<< You will need to build this /api/order/my-orders GET route later!
          setUserOrders(ordersRes.data);
          console.log('DEBUG: VendorProfile - Fetched Orders:', ordersRes.data); // Debug log
          */
          console.log('DEBUG: VendorProfile - Order fetching temporarily skipped (API not yet implemented).'); // Debug log

        } catch (error) {
          console.error('Error fetching user profile or orders:', error.response?.data || error.message);
          alert('Failed to load profile or orders. Please check console for details.');
          // Optionally, redirect to login if session is invalid (e.g., token expired)
          if (error.response?.status === 401) navigate('/auth');
        } finally {
          setLoadingUser(false);
          setLoadingOrders(false); // Set to false even if orders are not fetched (as it's commented out)
        }
      } else {
        // If no firebaseUser (not logged in), set loading to false and redirect
        setLoadingUser(false);
        setLoadingOrders(false);
        navigate('/auth');
      }
    };
    fetchDetailsAndOrders();
  }, [navigate]); // navigate is a dependency of useEffect

  // Function to handle user logout (copied from Header, now on profile page)
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Logs out from Firebase Authentication
      localStorage.removeItem('idToken'); // Removes stored login token
      localStorage.removeItem('userId'); // Removes stored MongoDB userId
      alert('Logged out successfully!');
      navigate('/auth'); // Redirect to login/registration page
    } catch (error) {
      console.error('Logout error:', error.message);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--forest-50), var(--emerald-50))', 
      display: 'flex', 
      flexDirection: 'column',
      transition: 'all 0.3s ease'
    }}>
      <Header />
      <div style={{ 
        maxWidth: '960px', 
        margin: '0 auto', 
        padding: '16px', 
        paddingTop: '80px', 
        flexGrow: 1, 
        width: '100%' 
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
            color: 'var(--emerald-700)',
            background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            👤 My Profile & Orders
          </h1>
          <p style={{ 
            color: 'var(--emerald-600)', 
            fontSize: '1.1rem', 
            opacity: '0.9',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}>
            Manage your account and track your activities
          </p>
        </div>

        {/* Account Details Section */}
        <div className="card" style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(34, 197, 94, 0.05))',
          border: '2px solid var(--emerald-200)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(16, 185, 129, 0.15)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeIn 0.6s ease 0.3s both'
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
            <span style={{ fontSize: '1.5rem' }}>📋</span>
            Account Details
          </h2>
          {loadingUser ? (
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
                border: '4px solid var(--emerald-200)',
                borderTop: '4px solid var(--emerald-500)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                color: 'var(--emerald-600)', 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Loading your profile...
              </p>
            </div>
          ) : userDetails ? (
            <div style={{ 
              display: 'grid', 
              gap: '20px',
              animation: 'fadeIn 0.5s ease'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
                gap: '20px' 
              }}>
                <div style={{ 
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  border: '1px solid var(--emerald-200)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{ 
                    color: 'var(--emerald-700)', 
                    marginBottom: '16px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>👤</span> Personal Information
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>📝</span>
                      <div>
                        <span style={{ 
                          fontWeight: '600', 
                          color: 'var(--emerald-700)' 
                        }}>Name: </span>
                        <span style={{ 
                          color: 'var(--gray-700)' 
                        }}>{userDetails.name || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>📞</span>
                      <div>
                        <span style={{ 
                          fontWeight: '600', 
                          color: 'var(--emerald-700)' 
                        }}>Contact: </span>
                        <span style={{ 
                          color: 'var(--gray-700)' 
                        }}>{userDetails.contact || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ 
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '12px',
                  border: '1px solid var(--forest-200)',
                  transition: 'all 0.3s ease'
                }}>
                  <h3 style={{ 
                    color: 'var(--forest-700)', 
                    marginBottom: '16px',
                    fontSize: '1.2rem',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <span>🏪</span> Business Information
                  </h3>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '12px' 
                  }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>🏬</span>
                      <div>
                        <span style={{ 
                          fontWeight: '600', 
                          color: 'var(--forest-700)' 
                        }}>Shop Name: </span>
                        <span style={{ 
                          color: 'var(--gray-700)' 
                        }}>{userDetails.shop_name || 'N/A'}</span>
                      </div>
                    </div>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px',
                      padding: '8px 0'
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>📅</span>
                      <div>
                        <span style={{ 
                          fontWeight: '600', 
                          color: 'var(--forest-700)' 
                        }}>Member Since: </span>
                        <span style={{ 
                          color: 'var(--gray-700)' 
                        }}>{userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ 
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.8)',
                borderRadius: '12px',
                border: '1px solid var(--mint-200)',
                transition: 'all 0.3s ease'
              }}>
                <h3 style={{ 
                  color: 'var(--mint-700)', 
                  marginBottom: '16px',
                  fontSize: '1.2rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📍</span> Location Information
                </h3>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'flex-start', 
                  gap: '12px',
                  padding: '8px 0'
                }}>
                  <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🗺️</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ 
                      fontWeight: '600', 
                      color: 'var(--mint-700)' 
                    }}>Address: </span>
                    {loadingAddress ? (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '8px' 
                      }}>
                        <div style={{ 
                          width: '16px',
                          height: '16px',
                          border: '2px solid var(--mint-200)',
                          borderTop: '2px solid var(--mint-500)',
                          borderRadius: '50%',
                          animation: 'spin 1s linear infinite'
                        }}></div>
                        <span style={{ 
                          color: 'var(--mint-600)', 
                          fontStyle: 'italic' 
                        }}>Converting location...</span>
                      </div>
                    ) : (
                      <span style={{ 
                        color: 'var(--gray-700)',
                        lineHeight: '1.5'
                      }}>
                        {locationAddress || 'Location not available'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              border: '2px dashed var(--red-300)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>⚠️</div>
              <p style={{ 
                color: '#ef4444', 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Could not load user details
              </p>
            </div>
          )}
          <button 
            onClick={handleLogout} 
            style={{ 
              background: 'linear-gradient(135deg, #dc2626, #b91c1c)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 24px', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontSize: '1rem',
              fontWeight: '600',
              marginTop: '24px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              margin: '24px auto 0',
              transition: 'all 0.3s ease',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(220, 38, 38, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(220, 38, 38, 0.3)';
            }}
          >
            <span>🚪</span>
            Logout
          </button>
        </div>

        {/* Orders Section */}
        <div className="card" style={{ 
          marginBottom: '32px',
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(99, 102, 241, 0.05))',
          border: '2px solid #e0e7ff',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15)',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden',
          animation: 'fadeIn 0.6s ease 0.4s both'
        }}>
          <div style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #8b5cf6, #6366f1)',
            borderRadius: '16px 16px 0 0'
          }}></div>
          <h2 style={{ 
            fontSize: '1.8rem', 
            fontWeight: 'bold', 
            marginBottom: '20px',
            color: '#6d28d9',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '1.5rem' }}>📦</span>
            My Orders
          </h2>
          {loadingOrders ? (
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
                borderTop: '4px solid #8b5cf6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ 
                color: '#6d28d9', 
                fontSize: '1.1rem',
                fontWeight: '500'
              }}>
                Loading your orders...
              </p>
            </div>
          ) : userOrders.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '12px',
              border: '2px dashed #c7d2fe'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
              <p style={{ 
                color: '#6d28d9', 
                fontSize: '1.1rem',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                No orders yet
              </p>
              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.95rem'
              }}>
                Your orders and surplus requests will appear here
              </p>
            </div>
            ) : (
              // This section will display actual order data if available (after backend API is built)
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '20px',
                animation: 'fadeIn 0.5s ease'
              }}>
                {userOrders.map((order, index) => (
                  <div 
                    key={order.id} 
                    className="card" 
                    style={{ 
                      border: '2px solid #e0e7ff', 
                      background: 'linear-gradient(135deg, #fafbff, #f3f4f6)',
                      borderRadius: '12px',
                      boxShadow: '0 4px 16px rgba(139, 92, 246, 0.15)',
                      transition: 'all 0.3s ease',
                      animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.15)';
                    }}
                  >
                    <h3 style={{ 
                      fontSize: '1.2rem', 
                      fontWeight: 'bold', 
                      color: '#6d28d9',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <span>📦</span>
                      Order for {order.itemName}
                    </h3>
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{ margin: '8px 0', color: '#374151' }}>
                        <span style={{ fontWeight: '600' }}>Quantity:</span> {order.quantity} {order.unit}
                      </p>
                      <p style={{ margin: '8px 0', color: '#374151' }}>
                        <span style={{ fontWeight: '600' }}>Price:</span> ₹{order.price}
                      </p>
                      <p style={{ margin: '8px 0', color: '#374151' }}>
                        <span style={{ fontWeight: '600' }}>Status:</span> 
                        <span style={{ 
                          marginLeft: '8px',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          background: order.status === 'pending' ? '#fef3c7' : '#d1fae5',
                          color: order.status === 'pending' ? '#d97706' : '#065f46',
                          fontSize: '0.875rem',
                          fontWeight: '500'
                        }}>
                          {order.status}
                        </span>
                      </p>
                    </div>
                    <button 
                      onClick={() => alert('Order cancellation is a future feature!')}
                      style={{ 
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                        color: 'white', 
                        padding: '10px 16px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        width: '100%',
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      <span>❌</span>
                      Cancel Order (Future Feature)
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ 
              marginTop: '24px',
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '8px',
              border: '1px dashed #c7d2fe'
            }}>
              <p style={{ 
                fontSize: '0.9rem', 
                color: '#6b7280', 
                textAlign: 'center', 
                margin: 0,
                fontStyle: 'italic'
              }}>
                💡 Note: Orders placed by other vendors for your surplus, and advanced order tracking, are future features.
              </p>
            </div>
        </div>

        {/* My Cart Button - Enhanced */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          animation: 'fadeIn 0.6s ease 0.5s both'
        }}>
          <Link 
            to="/cart" 
            style={{ 
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)', 
              color: 'white', 
              padding: '16px 32px', 
              borderRadius: '16px', 
              textDecoration: 'none', 
              fontSize: '1.2rem', 
              fontWeight: '700',
              boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.3s ease',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-3px)';
              e.target.style.boxShadow = '0 12px 32px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            Go to My Cart
            <span style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%)',
              transform: 'translateX(-100%)',
              transition: 'transform 0.6s ease'
            }}></span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;