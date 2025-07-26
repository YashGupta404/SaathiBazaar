// saathi-bazaar-frontend/src/pages/BulkPurchase.jsx
// Basic functional page for the Bulk Buy Scheme.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react';
import api from '../api'; // Your configured Axios API instance
import Header from '../components/Header'; // Your Header component

function BulkPurchase() {
  const [bulkOrders, setBulkOrders] = useState([]); // State to store fetched bulk orders
  const [contributionQty, setContributionQty] = useState({}); // State to store quantity vendor wants to contribute for each order
  const [loadingBulkOrders, setLoadingBulkOrders] = useState(true); // Loading indicator for fetching bulk orders

  // useEffect to fetch bulk orders when the page mounts
  useEffect(() => {
    fetchBulkOrders();
    // Set up an interval to refresh bulk orders every 10 seconds (for real-time like updates)
    const intervalId = setInterval(fetchBulkOrders, 10000); // Refresh every 10 seconds
    return () => clearInterval(intervalId); // Clean up interval on component unmount
  }, []);

  // Function to fetch active bulk orders from the backend
  const fetchBulkOrders = async () => {
    setLoadingBulkOrders(true); // Start loading
    try {
      const res = await api.get('/vendor/bulk-orders'); // API call to your backend
      setBulkOrders(res.data); // Update state with fetched orders
      // Initialize contribution quantity inputs for each order
      const initialQty = {};
      res.data.forEach(order => {
        initialQty[order.id] = ''; // Initialize with empty string for input field
      });
      setContributionQty(initialQty);
    } catch (error) {
      console.error('Error fetching bulk orders:', error.response?.data || error.message);
      alert('Failed to load bulk orders.'); // Show error
    } finally {
      setLoadingBulkOrders(false); // End loading
    }
  };

  // Handles a vendor contributing to a bulk order
  const handleContribute = async (bulkOrderId) => {
    const qty = parseFloat(contributionQty[bulkOrderId]); // Get and convert contribution quantity to number
    if (!qty || qty <= 0) { // Basic validation
      alert('Please enter a valid quantity to contribute.');
      return;
    }
    try {
      await api.post('/vendor/bulk-orders/contribute', { bulkOrderId, quantity: qty }); // API call to backend
      alert('Your contribution has been added!'); // Success message
      setContributionQty(prev => ({ ...prev, [bulkOrderId]: '' })); // Clear input field
      fetchBulkOrders(); // Refresh the list to show updated progress
    } catch (error) {
      console.error('Error contributing:', error.response?.data || error.message);
      alert('Failed to contribute: ' + (error.response?.data?.error || 'Unknown error')); // Show detailed error
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}> {/* Basic container styling */}
      <Header /> {/* Includes your Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}> {/* Main content area */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#9333ea' }}>Saathi Bazaar Bulk Buy Scheme</h1>
        <p style={{ fontSize: '1.125rem', textAlign: 'center', color: '#4b5563', marginBottom: '32px' }}>Pool your orders to unlock massive wholesale discounts!</p>

        {loadingBulkOrders ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading active bulk orders...</p>
        ) : bulkOrders.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#4b5563' }}>No active bulk orders right now. Check back later!</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}> {/* Grid for bulk order cards */}
            {bulkOrders.map((order) => {
              const progress = (order.current_qty / order.target_qty) * 100; // Calculate progress percentage
              const isFulfilled = order.status === 'fulfilled'; // Check if order is fulfilled
              // Calculate time remaining for deadline
              const timeRemaining = new Date(order.deadline).getTime() - Date.now();
              const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
              const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
              const timeLeftStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

              return (
                <div key={order.id} className="card" style={{ border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column' }}> {/* Card for each bulk order */}
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>{order.itemName} ({order.unit})</h2>
                  <p style={{ color: '#4b5563', marginBottom: '8px' }}>Cluster: {order.clusterLocation}</p>
                  <p style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>Current: {order.current_qty} {order.unit} / Target: {order.target_qty} {order.unit}</p>

                  {/* Progress Bar */}
                  <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '9999px', height: '16px', margin: '12px 0' }}>
                    <div style={{ width: `${Math.min(progress, 100)}%`, backgroundColor: isFulfilled ? '#22c55e' : '#a855f7', height: '100%', borderRadius: 'inherit' }}></div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'right' }}>{progress.toFixed(0)}% Fulfilled</p>

                  {/* Price Display */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '12px 0' }}>
                    <p style={{ color: '#4b5563' }}>Individual: ₹{order.individualPrice || 'N/A'}/{order.unit}</p>
                    <p style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '1.25rem' }}>Bulk Price: ₹{order.bulkPrice || 'N/A'}/{order.unit}</p>
                  </div>

                  {/* Contribution Form / Status Message */}
                  {!isFulfilled && timeRemaining > 0 ? ( // If not fulfilled and time left
                    <>
                      <p style={{ fontSize: '0.875rem', color: '#ef4444', marginBottom: '12px' }}>Time Left: {timeLeftStr}</p>
                      <input
                        type="number"
                        placeholder="Your quantity"
                        value={contributionQty[order.id] || ''}
                        onChange={(e) => setContributionQty(prev => ({ ...prev, [order.id]: e.target.value }))}
                        style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px', marginBottom: '12px' }}
                        required
                      />
                      <button onClick={() => handleContribute(order.id)}
                              style={{ background: '#9333ea', color: 'white', padding: '10px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%' }}>
                        Contribute Order
                      </button>
                    </>
                  ) : ( // If fulfilled or time expired
                    <p style={{ textAlign: 'center', fontSize: '1.125rem', fontWeight: 'bold', color: isFulfilled ? '#22c55e' : '#ef4444' }}>
                      {isFulfilled ? 'Bulk Order Fulfilled! Will be delivered soon.' : 'Bulk Order Time Expired / Failed to Meet Target.'}
                    </p>
                  )}
                  {isFulfilled && ( // Only show track delivery if fulfilled
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
    </div>
  );
}

export default BulkPurchase;