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
  const navigate = useNavigate();

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
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6', display: 'flex', flexDirection: 'column' }}>
      <Header />
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px', flexGrow: 1, width: '100%' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#1f2937' }}>My Profile & Orders</h1>

        {/* Account Details Section */}
        <div className="card" style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>Account Details</h2>
          {loadingUser ? (
            <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading profile...</p>
          ) : userDetails ? (
            <div style={{ lineHeight: '1.8' }}>
              <p><strong>Name:</strong> {userDetails.name || 'N/A'}</p> {/* Use || 'N/A' for safety */}
              <p><strong>Shop Name:</strong> {userDetails.shop_name || 'N/A'}</p>
              <p><strong>Contact:</strong> {userDetails.contact || 'N/A'}</p>
              {/* REMOVED: Email field, as it's not stored directly in your User model
                  <p><strong>Email:</strong> {userDetails.email || 'N/A'}</p> */}

              {/* Robust Location Display */}
              <p><strong>Location:</strong> Lat {userDetails.location?.lat.toFixed(4) || 'N/A'}, Long {userDetails.location?.long.toFixed(4) || 'N/A'}</p>

              {/* Robust Member Since Display */}
              <p><strong>Member Since:</strong> {userDetails.createdAt ? new Date(userDetails.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Your MongoDB ID:</strong> {userDetails._id || 'N/A'}</p>
              <p><strong>Your Firebase UID:</strong> {userDetails.uid || 'N/A'}</p>
            </div>
          ) : (
            <p style={{ textAlign: 'center', color: '#ef4444' }}>Could not load user details.</p>
          )}
           <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', marginTop: '20px', display: 'block', margin: '20px auto 0' }}>
            Logout {/* Logout button on profile page */}
           </button>
        </div>

        {/* Orders Section */}
        <div className="card" style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px' }}>My Orders</h2>
            {loadingOrders ? (
                <p style={{ textAlign: 'center', color: '#4b5563' }}>Loading your orders...</p>
            ) : userOrders.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#4b5563' }}>No orders placed by you yet. (Or orders received for surplus).</p>
            ) : (
                // This section will display actual order data if available (after backend API is built)
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {userOrders.map(order => (
                        <div key={order.id} className="card" style={{ border: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#1f2937' }}>Order for {order.itemName}</h3>
                            <p>Quantity: {order.quantity} {order.unit}</p>
                            <p>Price: ₹{order.price}</p>
                            <p>Status: {order.status}</p>
                            {/* Conceptual cancellation button */}
                            <button onClick={() => alert('Order cancellation is a future feature!')}
                                    style={{ background: '#ef4444', color: 'white', padding: '8px', borderRadius: '4px', border: 'none', cursor: 'pointer', width: '100%', marginTop: '12px' }}>
                                Cancel Order (Conceptual)
                            </button>
                        </div>
                    ))}
                </div>
            )}
            <p style={{ fontSize: '0.875rem', color: '#6b7280', textAlign: 'center', marginTop: '20px' }}>
                Note: Orders placed by other vendors for your surplus, and advanced order tracking, are future features.
            </p>
        </div>

      {/* My Cart Button - Leads to Cart Page */}
        <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <Link to="/cart" style={{ background: '#3b82f6', color: 'white', padding: '15px 30px', borderRadius: '8px', textDecoration: 'none', fontSize: '1.2rem', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                Go to My Cart
            </Link>
        </div>
      </div>
    </div>
  );
}

export default VendorProfile;