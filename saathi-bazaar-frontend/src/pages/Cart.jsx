// saathi-bazaar-frontend/src/pages/Cart.jsx
// Basic functional page for My Cart.
// This cart is in-memory for the hackathon MVP (not persistent across page loads or logins).
// Your frontend team will enhance its design and persistent storage.

import React, { useState, useEffect } from 'react';
import Header from '../components/Header'; // Your Header component
import api from '../api'; // Your configured Axios API instance (for conceptual future checkout API)

// Helper functions to get/save cart items from/to browser's session storage.
// This is a simple way to make cart items persist for the current session/tab.
const getCartItemsFromSession = () => {
    const items = sessionStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
};
const saveCartItemsToSession = (items) => {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
};


function Cart() {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loadingCart, setLoadingCart] = useState(true);

  useEffect(() => {
    const items = getCartItemsFromSession();
    setCartItems(items);
    calculateTotal(items);
    setLoadingCart(false);
  }, []);

  // Calculates total price of items in cart
  const calculateTotal = (items) => {
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    setTotalPrice(total);
  };

  // Handles removing an item from the cart (in-memory)
  const handleRemoveFromCart = (itemId) => {
    const updatedCart = cartItems.filter(item => item.id !== itemId);
    setCartItems(updatedCart);
    saveCartItemsToSession(updatedCart); // Update session storage
    calculateTotal(updatedCart);
    alert(`${itemId} removed from cart.`);
  };

  // Handles the "Checkout" process (conceptual for hackathon)
  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty! Please add items before checking out.'); // Alert if cart is empty
      return;
    }

    // In a real application, you would send these cartItems to a backend API
    // (e.g., POST /api/orders/place) for processing, actual payment, and order creation in the database.
    // For the hackathon, this is a conceptual "checkout" for demonstration purposes only.

    alert(`Proceeding to conceptual checkout for total: ₹${totalPrice}. Your order will be placed! (Future feature: actual payment & order processing.)`);

    // After conceptual checkout, clear the cart
    setCartItems([]);
    saveCartItemsToSession([]);
    setTotalPrice(0);
    // In a real app, you'd navigate to an order confirmation page here
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, var(--mint-50), var(--emerald-50))', 
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
            color: 'var(--mint-700)',
            background: 'linear-gradient(135deg, var(--mint-600), var(--emerald-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            🛒 My Cart
          </h1>
          <p style={{ 
            color: 'var(--mint-600)', 
            fontSize: '1.1rem', 
            opacity: '0.9',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}>
            Review your items and checkout when ready
          </p>
        </div>

        {loadingCart ? (
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
              Loading your cart...
            </p>
          </div>
        ) : cartItems.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            background: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '2px dashed var(--mint-300)',
            animation: 'fadeIn 0.6s ease 0.3s both'
          }}>
            <div style={{ 
              fontSize: '4rem', 
              marginBottom: '20px',
              animation: 'bounce 2s infinite'
            }}>🛒</div>
            <h2 style={{ 
              color: 'var(--mint-700)', 
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '12px'
            }}>
              Your cart is empty
            </h2>
            <p style={{ 
              color: 'var(--mint-600)', 
              fontSize: '1.1rem',
              marginBottom: '24px'
            }}>
              Discover amazing deals from Mandis and Bulk Buy offers!
            </p>
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <a 
                href="/mandis" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>🏪</span> Browse Mandis
              </a>
              <a 
                href="/bulk-purchase" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--mint-500), var(--emerald-500))', 
                  color: 'white', 
                  padding: '12px 24px', 
                  borderRadius: '12px', 
                  textDecoration: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>📦</span> Bulk Deals
              </a>
            </div>
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '24px',
            animation: 'fadeIn 0.6s ease 0.3s both'
          }}>
            {/* Cart Items List */}
            <div style={{ 
              background: 'rgba(255, 255, 255, 0.9)', 
              borderRadius: '16px', 
              padding: '24px',
              border: '1px solid var(--mint-200)',
              boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)'
            }}>
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    borderBottom: index < cartItems.length - 1 ? '1px solid var(--mint-100)' : 'none', 
                    padding: '20px 0',
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    animation: `fadeIn 0.5s ease ${index * 0.1}s both`
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--mint-25)';
                    e.target.style.borderRadius = '12px';
                    e.target.style.margin = '0 -12px';
                    e.target.style.padding = '20px 12px';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'transparent';
                    e.target.style.borderRadius = '0';
                    e.target.style.margin = '0';
                    e.target.style.padding = '20px 0';
                  }}
                >
                  {/* Product Info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    flex: 1 
                  }}>
                    {/* Product Icon */}
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      backgroundColor: 'var(--mint-100)', 
                      borderRadius: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '1.8rem',
                      border: '2px solid var(--mint-200)',
                      flexShrink: 0,
                      background: 'linear-gradient(135deg, var(--mint-100), var(--emerald-100))'
                    }}>
                      🌾
                    </div>

                    {/* Product Details */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ 
                        fontSize: '1.25rem', 
                        fontWeight: '600',
                        margin: '0 0 8px 0',
                        color: 'var(--mint-700)'
                      }}>
                        {item.name}
                      </h3>
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        flexWrap: 'wrap'
                      }}>
                        <p style={{ 
                          fontSize: '0.95rem', 
                          color: 'var(--mint-600)',
                          margin: 0
                        }}>
                          {item.quantity} {item.unit} @ ₹{item.price} each
                        </p>
                        {item.type === 'bulk' && (
                          <span style={{ 
                            background: 'linear-gradient(135deg, #9333ea, #7c3aed)', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(147, 51, 234, 0.2)'
                          }}>
                            📦 Bulk Offer
                          </span>
                        )}
                        {item.type === 'mandi' && (
                          <span style={{ 
                            background: 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))', 
                            color: 'white', 
                            padding: '4px 8px', 
                            borderRadius: '8px', 
                            fontSize: '0.75rem',
                            fontWeight: '500',
                            boxShadow: '0 2px 4px rgba(16, 163, 74, 0.2)'
                          }}>
                            🏪 Mandi
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Price and Remove */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px'
                  }}>
                    <span style={{ 
                      fontSize: '1.25rem', 
                      fontWeight: '700',
                      color: 'var(--emerald-600)',
                      minWidth: '80px',
                      textAlign: 'right'
                    }}>
                      ₹{item.quantity * item.price}
                    </span>
                    <button 
                      onClick={() => handleRemoveFromCart(item.id)}
                      style={{ 
                        background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                        color: 'white', 
                        padding: '8px 12px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        cursor: 'pointer', 
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minWidth: 'auto'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'scale(1.05)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'scale(1)';
                        e.target.style.boxShadow = 'none';
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}

              {/* Total Section */}
              <div style={{ 
                borderTop: '2px solid var(--mint-200)',
                paddingTop: '20px',
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{
                  fontSize: '1.125rem',
                  color: 'var(--mint-600)',
                  fontWeight: '500'
                }}>
                  Total Amount:
                </div>
                <div style={{ 
                  fontSize: '1.5rem', 
                  fontWeight: '700',
                  color: 'var(--emerald-600)',
                  background: 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  ₹{totalPrice}
                </div>
              </div>

              {/* Checkout Button */}
              <button 
                onClick={handleCheckout}
                style={{ 
                  background: 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))', 
                  color: 'white', 
                  padding: '16px 24px', 
                  borderRadius: '12px', 
                  border: 'none', 
                  cursor: 'pointer', 
                  width: '100%', 
                  marginTop: '20px', 
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 12px rgba(16, 163, 74, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 20px rgba(16, 163, 74, 0.3)';
                  e.target.style.background = 'linear-gradient(135deg, var(--emerald-600), var(--forest-600))';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 163, 74, 0.2)';
                  e.target.style.background = 'linear-gradient(135deg, var(--emerald-500), var(--forest-500))';
                }}
              >
                <span>🛒</span> Proceed to Checkout
              </button>
            </div>
          </div>
        )}

        {/* Footer Note */}
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          padding: '20px',
          background: 'rgba(255, 255, 255, 0.6)',
          borderRadius: '12px',
          border: '1px solid var(--mint-200)',
          animation: 'fadeIn 0.6s ease 0.5s both'
        }}>
          <p style={{ 
            color: 'var(--mint-600)', 
            fontSize: '0.95rem', 
            margin: 0,
            lineHeight: '1.5'
          }}>
            <span style={{ fontSize: '1.2rem' }}>💡</span> 
            <strong> Note:</strong> This is a demo cart system using session storage. 
            Complete payment integration and persistent storage will be implemented in the full version.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cart;