// saathi-bazaar-frontend/src/pages/BulkPurchase.jsx
// This version ensures fulfilled bulk orders remain visible but inactive,
// separates user's unfulfilled contributions into a dedicated section,
// and includes visual styling for fulfilled orders.

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component
import { Link } from 'react-router-dom'; // For "Go to My Cart" button

// Helper functions to get/save cart items from/to browser's session storage.
const getCartItemsFromSession = () => {
    const items = sessionStorage.getItem('cartItems');
    return items ? JSON.parse(items) : [];
};
const saveCartItemsToSession = (items) => {
    sessionStorage.setItem('cartItems', JSON.stringify(items));
};

function BulkPurchase() {
  const [bulkOrders, setBulkOrders] = useState([]); // State to store all fetched bulk orders
  const [contributionQty, setContributionQty] = useState({}); // State to store quantity vendor wants to contribute for each order
  const [loadingBulkOrders, setLoadingBulkOrders] = useState(true); // Loading indicator for fetching bulk orders
  const currentUserMongoId = localStorage.getItem('userId'); // Get current user's MongoDB _id from localStorage

  // useEffect to fetch bulk orders when the page mounts
  useEffect(() => {
    const refreshInterval = 30000; // Increased refresh interval to 30 seconds
    console.log('DEBUG: BulkPurchase useEffect - Initializing fetch and interval (New Effect Run).');
    
    fetchBulkOrders(); // Initial fetch when component mounts
    
    const intervalId = setInterval(fetchBulkOrders, refreshInterval); // Set up auto-refresh interval
    console.log(`DEBUG: BulkPurchase useEffect - Started interval with ID: ${intervalId} refreshing every ${refreshInterval / 1000} seconds.`);
    
    // Cleanup function: This runs when the component unmounts OR
    // when the useEffect re-runs due to a dependency change (or React StrictMode in development).
    return () => {
      clearInterval(intervalId); // Clear the interval to prevent multiple intervals from running simultaneously.
      console.log(`DEBUG: BulkPurchase useEffect - Cleaning up interval with ID: ${intervalId}.`);
    };
  }, []); // Empty dependency array means this effect runs once on mount and cleans up on unmount.

  // Function to fetch active bulk orders from the backend
  const fetchBulkOrders = async () => {
    setLoadingBulkOrders(true); // Set loading state to true
    console.log('DEBUG: fetchBulkOrders - API call initiated to get bulk orders.');
    try {
      const res = await api.get('/vendor/bulk-orders'); // API call to your backend
      console.log('DEBUG (BulkPurchase fetch): API Response for bulk orders (raw):', res.data); // Debug log: shows the raw data received

      const initialQty = {};
      // Filter out any null/undefined order objects or orders missing an 'id' from the response
      const validOrders = res.data.filter(order => order && order.id); 
      validOrders.forEach(order => {
          initialQty[order.id.toString()] = ''; // Initialize input field for each valid order using its string ID
      });
      setContributionQty(initialQty); // Update state for contribution input quantities
      setBulkOrders(validOrders); // Set state with only the valid orders
      
    } catch (error) {
      console.error('Error fetching bulk orders:', error.response?.data || error.message);
      alert('Failed to load bulk orders.'); // Alert user about the failure
    } finally {
      setLoadingBulkOrders(false); // Set loading state to false
      console.log('DEBUG: fetchBulkOrders - API call completed.');
    }
  };

  // Handles a vendor contributing to a bulk order
  const handleContribute = async (bulkOrderId) => {
    console.log('DEBUG (handleContribute): Called for bulkOrderId:', bulkOrderId);
    
    const orderIdString = bulkOrderId ? bulkOrderId.toString() : null; 
    console.log('DEBUG (handleContribute): orderIdString (after toString check):', orderIdString);

    if (!orderIdString) { // If ID is still null or undefined after conversion
      console.error('ERROR (handleContribute): bulkOrderId is invalid after conversion.');
      alert('Error: Could not identify the bulk order. Please refresh the page and try again.');
      return;
    }

    const rawQty = contributionQty[orderIdString]; // Get the quantity from the input field
    console.log('DEBUG (handleContribute): Raw quantity input for ID:', orderIdString, 'is:', rawQty);

    const qty = parseFloat(rawQty); // Convert string input to a floating-point number
    console.log('DEBUG (handleContribute): Parsed quantity:', qty);

    if (isNaN(qty) || qty <= 0) { // Validate if conversion resulted in NaN or if quantity is not positive
      alert('Please enter a valid positive quantity to contribute.');
      return;
    }

    try {
      // Find the order in the current state to determine its status before sending
      const currentOrderBeforeContribution = bulkOrders.find(order => order.id && order.id.toString() === orderIdString);
      if (!currentOrderBeforeContribution) {
          alert('Error: Bulk order not found locally. Please refresh.');
          return;
      }

      const res = await api.post('/vendor/bulk-orders/contribute', { bulkOrderId: orderIdString, quantity: qty });
      alert('Your contribution has been added!');
      setContributionQty(prev => ({ ...prev, [orderIdString]: '' }));
      
      // Re-fetch orders immediately to get the very latest status from backend, including other contributions
      const updatedOrdersData = (await api.get('/vendor/bulk-orders')).data; // Fetch fresh data
      setBulkOrders(updatedOrdersData); // Update state immediately

      // Find the specific order that was just updated in the *newly fetched* data
      const updatedOrderAfterBackend = updatedOrdersData.find(order => order.id && order.id.toString() === orderIdString);
      console.log('DEBUG (handleContribute): Status of order after backend update:', updatedOrderAfterBackend ? updatedOrderAfterBackend.status : 'N/A');

      // --- NEW CART INTEGRATION FOR FULFILLED ORDERS ---
      if (updatedOrderAfterBackend && updatedOrderAfterBackend.status === 'fulfilled') {
          const existingCartItems = getCartItemsFromSession();
          // Create a unique cart item ID for this specific fulfilled bulk order
          const cartItemId = `bulk-${updatedOrderAfterBackend.itemName}-${orderIdString}`; 

          const existingItemIndex = existingCartItems.findIndex(item => item.id === cartItemId);
          
          const itemToAdd = {
              id: cartItemId, // Unique ID for this specific cart entry
              productId: updatedOrderAfterBackend.id, // The bulk order ID from DB
              name: updatedOrderAfterBackend.itemName,
              quantity: updatedOrderAfterBackend.target_qty, // Add the *target* quantity, as that's what's fulfilled
              unit: updatedOrderAfterBackend.unit,
              price: updatedOrderAfterBackend.bulkPrice, // Use the discounted bulk price
              type: 'bulk', // Mark as a bulk item
              sourceId: updatedOrderAfterBackend.id, // The bulk order ID itself
              totalItemPrice: updatedOrderAfterBackend.target_qty * updatedOrderAfterBackend.bulkPrice
          };

          if (existingItemIndex > -1) {
              // If already in cart (unlikely for fulfilled bulk orders as they are typically added once), update it.
              existingCartItems[existingItemIndex] = itemToAdd;
          } else {
              // Add as new item if not already present in the cart.
              existingCartItems.push(itemToAdd);
          }
          saveCartItemsToSession(existingCartItems); // Save updated cart to session storage
          alert(`Bulk order for ${updatedOrderAfterBackend.itemName} (₹${updatedOrderAfterBackend.bulkPrice}/${updatedOrderAfterBackend.unit}) has been fulfilled and added to your cart!`);
          
          // --- WARNING FOR CANCELLATION AFTER FULFILLMENT ---
          alert(`IMPORTANT: Once this bulk order is added to your cart (threshold met), it cannot be cancelled without potential compensation. Your contribution is now a confirmed purchase.`);
          // --- END WARNING ---
      }

    } catch (error) {
      console.error('Error contributing:', error.response?.data || error.message);
      alert('Failed to contribute: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // Handles conceptual cancellation of an unfulfilled contribution
  const handleCancelContribution = async (bulkOrderId, itemName, contributedQty) => {
    console.log('DEBUG (handleCancelContribution): Called for bulkOrderId:', bulkOrderId);
    try {
      // Call backend API to remove contribution
      // The 'data' field is used for DELETE requests with a body (Axios requirement)
      const res = await api.delete('/vendor/bulk-orders/cancel-contribution', { data: { bulkOrderId } }); // API CALL TO BACKEND
      alert(res.data.message || `Conceptual: Your contribution of ${contributedQty} ${itemName} to bulk order ${bulkOrderId} has been cancelled.`);
      
      fetchBulkOrders(); // Refresh the list to show the updated current_qty and removal of user's contribution
    } catch (error) {
      console.error('Error cancelling contribution:', error.response?.data || error.message);
      alert('Failed to cancel contribution: ' + (error.response?.data?.error || 'Unknown error'));
    }
  };

  // Filter bulk orders for display: main ongoing/fulfilled and user's pending contributions
  // This ensures 'mainBulkOrdersDisplay' is always defined before JSX.
  const mainBulkOrdersDisplay = bulkOrders.filter(order => order && (order.status === 'open' || order.status === 'fulfilled')); // Ensure order object exists too
  
  // Filter for user's pending (unfulfilled) contributions.
  // This array will contain orders that the current user has contributed to, but which are not yet fulfilled.
  const myPendingContributionsDisplay = bulkOrders.filter(order => 
      order && order.id && order.status === 'open' && // Must be an open order with a valid ID
      Array.isArray(order.contributions) && // Ensure contributions is an array
      order.contributions.some(c => c.vendorId && c.vendorId.toString() === currentUserMongoId) // Check if current user contributed
  );

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
            background: 'linear-gradient(135deg, var(--mint-600), var(--emerald-600))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            📦 Bulk Buy Scheme
          </h1>
          <p style={{ 
            fontSize: '1.2rem', 
            color: 'var(--mint-600)', 
            marginBottom: '8px',
            fontWeight: '500',
            animation: 'fadeIn 0.6s ease 0.2s both'
          }}>
            Pool your orders to unlock massive wholesale discounts!
          </p>
        </div>

        {/* Enhanced Introductory Note */}
        <div style={{ 
          marginBottom: '32px', 
          background: 'linear-gradient(135deg, rgba(255, 251, 224, 0.9), rgba(255, 224, 130, 0.1))',
          border: '2px solid var(--emerald-200)',
          borderLeft: '6px solid var(--emerald-400)',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.05)',
          animation: 'fadeIn 0.6s ease 0.3s both'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '12px', 
            marginBottom: '16px' 
          }}>
            <span style={{ fontSize: '2rem' }}>💡</span>
            <h3 style={{ 
              fontSize: '1.3rem', 
              fontWeight: '600', 
              color: 'var(--emerald-700)',
              margin: 0
            }}>
              How Bulk Buy Works
            </h3>
          </div>
          
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px' 
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px' 
            }}>
              <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🤝</span>
              <p style={{ 
                fontSize: '0.95rem', 
                margin: 0, 
                color: 'var(--mint-700)',
                lineHeight: '1.5'
              }}>
                <strong>Contribute:</strong> Join ongoing bulk orders by adding your required quantity
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px' 
            }}>
              <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>📊</span>
              <p style={{ 
                fontSize: '0.95rem', 
                margin: 0, 
                color: 'var(--mint-700)',
                lineHeight: '1.5'
              }}>
                <strong>Track Progress:</strong> Watch the progress bar fill up as more vendors join
              </p>
            </div>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: '8px' 
            }}>
              <span style={{ fontSize: '1.2rem', marginTop: '2px' }}>🎯</span>
              <p style={{ 
                fontSize: '0.95rem', 
                margin: 0, 
                color: 'var(--mint-700)',
                lineHeight: '1.5'
              }}>
                <strong>Get Discounts:</strong> Once threshold is met, everyone gets the bulk price
              </p>
            </div>
            
            <div style={{ 
              background: 'rgba(239, 68, 68, 0.1)', 
              borderRadius: '12px', 
              padding: '12px 16px', 
              border: '1px solid rgba(239, 68, 68, 0.2)',
              marginTop: '8px'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: '#dc2626', 
                  fontWeight: '600',
                  margin: 0
                }}>
                  Warning: Fulfilled orders automatically add to your cart and cannot be cancelled
                </p>
              </div>
            </div>
          </div>
        </div>


        {/* Enhanced Main Bulk Orders List */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.9)', 
          borderRadius: '20px', 
          padding: '32px',
          border: '2px solid var(--mint-200)',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.08)',
          marginBottom: '32px',
          animation: 'fadeIn 0.6s ease 0.4s both'
        }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              marginBottom: '24px' 
            }}>
              <span style={{ fontSize: '2rem' }}>📦</span>
              <h2 style={{ 
                fontSize: '1.8rem', 
                fontWeight: '700', 
                color: 'var(--mint-700)',
                margin: 0
              }}>
                Available Bulk Orders
              </h2>
            </div>
            
            {loadingBulkOrders ? (
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
                  Loading bulk orders...
                </p>
              </div>
            ) : mainBulkOrdersDisplay.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'var(--mint-25)',
                borderRadius: '16px',
                border: '2px dashed var(--mint-300)'
              }}>
                <div style={{ 
                  fontSize: '4rem', 
                  marginBottom: '20px',
                  animation: 'bounce 2s infinite'
                }}>📦</div>
                <h3 style={{ 
                  color: 'var(--mint-700)', 
                  fontSize: '1.5rem',
                  fontWeight: '600',
                  marginBottom: '12px'
                }}>
                  No active bulk orders
                </h3>
                <p style={{ 
                  color: 'var(--mint-600)', 
                  fontSize: '1.1rem'
                }}>
                  Check back later for new bulk buying opportunities!
                </p>
              </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {mainBulkOrdersDisplay.map((order) => { // Uses the now-defined variable
                        const orderIdKey = order && order.id ? order.id.toString() : `missing-id-${Math.random()}`;
                        
                        // Robust check: Ensure order and its essential properties are valid before processing
                        if (!order || !order.id || !order.itemName || !order.unit || typeof order.current_qty === 'undefined' || typeof order.target_qty === 'undefined' || typeof order.deadline === 'undefined') {
                            console.warn('WARNING: Skipping bulk order rendering due to missing or invalid essential properties:', order);
                            return null; // Skip rendering this problematic order
                        }

                        const progress = (order.current_qty / order.target_qty) * 100;
                        const isFulfilled = order.status === 'fulfilled';
                        const timeRemaining = new Date(order.deadline).getTime() - Date.now();
                        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
                        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
                        const timeLeftStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

                        // Find current user's contribution (if any) to display
                        const currentUserContribution = Array.isArray(order.contributions) ? order.contributions.find(c => c.vendorId && c.vendorId.toString() === currentUserMongoId) : null;
                        const currentUserHasContributedToThisOrder = !!currentUserContribution;
                        const contributedQty = currentUserHasContributedToThisOrder ? currentUserContribution.quantity : 0;
                        
                        const cardStyle = {
                            border: '1px solid #e5e7eb',
                            display: 'flex',
                            flexDirection: 'column',
                            opacity: isFulfilled ? 0.6 : 1, // Darken fulfilled more visibly
                            boxShadow: isFulfilled ? '0 8px 16px rgba(0,0,0,0.3)' : '0 4px 6px rgba(0,0,0,0.1)', // More shadow
                            background: isFulfilled ? '#f0fff0' : 'white', // Light green for fulfilled
                            pointerEvents: isFulfilled ? 'none' : 'auto' // Disable pointer events if fulfilled (makes it unclickable)
                        };

                        return (
                            <div key={orderIdKey} className="card" style={cardStyle}>
                                <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>{order.itemName} ({order.unit})</h2>
                                <p style={{ color: '#4b5563', marginBottom: '8px' }}>Cluster: {order.clusterLocation}</p>
                                <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>Current: {order.current_qty} {order.unit} / Target: {order.target_qty} {order.unit}</p>
                                
                                <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '16px', margin: '12px 0' }}>
                                    <div style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: isFulfilled ? '#22c55e' : '#a855f7', height: '100%', borderRadius: 'inherit' }}></div>
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>{progress.toFixed(0)}% Fulfilled</p>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
                                    <p style={{ color: '#4b5563' }}>Individual: ₹{order.individualPrice || 'N/A'}/{order.unit}</p>
                                    <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>Bulk Price: ₹{order.bulkPrice || 'N/A'}/{order.unit}</p>
                                </div>

                                {/* Conditional display based on fulfillment status and user contribution */}
                                {!isFulfilled && timeRemaining > 0 ? ( // If not fulfilled and time left
                                    <>
                                        <p style={{ fontSize: '0.875rem', color: '#ef4444', marginBottom: '12px' }}>Time Left: {timeLeftStr}</p>
                                        {!currentUserHasContributedToThisOrder && ( // Show input/contribute if user hasn't contributed yet
                                            <input
                                                type="number"
                                                placeholder="Your quantity"
                                                value={contributionQty[orderIdKey] || ''}
                                                onChange={(e) => setContributionQty(prev => ({ ...prev, [orderIdKey]: e.target.value }))}
                                                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }}
                                                required
                                            />
                                        )}
                                        {!currentUserHasContributedToThisOrder && ( // Show contribute button if user hasn't contributed yet
                                            <button onClick={() => handleContribute(order.id)}
                                                    style={{ background: '#9333ea', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%' }}>
                                                Contribute Order
                                            </button>
                                        )}
                                        {currentUserHasContributedToThisOrder && ( // Display user's current contribution for this order
                                            <p style={{ fontSize: '0.9rem', color: '#059669', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
                                                Your Contribution: {contributedQty} {order.unit} (Remaining for threshold: {Math.max(0, order.target_qty - order.current_qty)} {order.unit})
                                            </p>
                                        )}
                                        {currentUserHasContributedToThisOrder && ( // Show cancel button if user has contributed and order not fulfilled
                                            <button onClick={() => handleCancelContribution(orderIdKey, order.itemName, contributedQty)}
                                                    style={{ background: '#ef4444', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}>
                                                Cancel My Contribution (Conceptual)
                                            </button>
                                        )}
                                    </>
                                ) : ( // If order is fulfilled or time expired
                                    <p style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 'bold', color: isFulfilled ? '#22c55e' : '#ef4444' }}>
                                    {isFulfilled ? 'Bulk Order Fulfilled! Will be delivered soon.' : 'Bulk Order Time Expired / Failed to Meet Target.'}
                                    </p>
                                )}
                                {isFulfilled && ( // Show track delivery if fulfilled
                                    <button
                                    onClick={() => alert('Bulk order delivery being processed! (Mock tracking)')}
                                    style={{ background: '#6366f1', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px', fontSize: '0.875rem' }}>
                                    Track Delivery (Mock)
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* --- NEW: "My Pending Bulk Contributions" Section --- */}
        <div className="card" style={{ marginTop: '32px', backgroundColor: '#e6eeff', borderLeft: '5px solid #639aff', padding: '16px', color: '#333' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px', color: '#1f2937' }}>My Pending Bulk Contributions (Unfulfilled)</h2>
            {myPendingContributionsDisplay.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#4b5563', fontSize: '1.125rem' }}>You have no pending contributions to bulk orders.</p>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {myPendingContributionsDisplay.map(order => {
                        // Ensure contribution exists for the current user in this specific order
                        const contribution = Array.isArray(order.contributions) ? order.contributions.find(c => c.vendorId && c.vendorId.toString() === currentUserMongoId) : null;
                        const contributedQty = contribution ? contribution.quantity : 0;
                        const remainingToThreshold = Math.max(0, order.target_qty - order.current_qty);
                        const expectedPrice = order.bulkPrice; // Assuming bulk price if fulfilled

                        return (
                            <div key={order.id.toString()} className="card" style={{ border: '1px solid #a855f7', backgroundColor: '#f5e6ff' }}> {/* Purpleish background for pending */}
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>{order.itemName} ({order.unit})</h3>
                                <p style={{ color: '#4b5563' }}>Your Contribution: <span style={{ fontWeight: 'bold' }}>{contributedQty} {order.unit}</span></p>
                                <p style={{ color: '#4b5563' }}>Current Total: {order.current_qty} {order.unit}</p>
                                <p style={{ color: '#4b5563' }}>Target: {order.target_qty} {order.unit}</p>
                                <p style={{ color: '#ef4444' }}>Remaining for Threshold: <span style={{ fontWeight: 'bold' }}>{remainingToThreshold} {order.unit}</span></p>
                                <p style={{ color: '#16a34a', fontSize: '1.125rem', fontWeight: 'bold' }}>Expected Price: ₹{expectedPrice}/{order.unit}</p>
                                <button onClick={() => handleCancelContribution(order.id.toString(), order.itemName, contributedQty)}
                                        style={{ background: '#ef4444', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}>
                                    Cancel My Contribution (Conceptual)
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
        {/* --- END: "My Pending Bulk Contributions" Section --- */}

      </div>
    </div>
  );
}

export default BulkPurchase;