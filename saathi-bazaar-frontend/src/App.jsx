// saathi-bazaar-frontend/src/App.jsx
// Main application component, sets up client-side routing.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Imports your page components.
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import VendorToVendor from './pages/VendorToVendor';
import MandiDirectory from './pages/MandiDirectory';
import MandiDetail from './pages/MandiDetail';
import BulkPurchase from './pages/BulkPurchase';
import Chatbot from './pages/Chatbot';
import VendorProfile from './pages/VendorProfile'; // <<< NEW IMPORT
import Cart from './pages/Cart'; // <<< NEW IMPORT

// Simple PrivateRoute component to protect routes.
const PrivateRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('idToken');
  return isAuthenticated ? children : <Navigate to="/auth" />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Route: Authentication Page */}
        <Route path="/auth" element={<Auth />} />

        {/* Default Route: Redirects the root URL ('/') to the '/dashboard' */}
        <Route path="/" element={<Navigate to="/dashboard" />} />

        {/* Protected Routes (require user to be logged in) */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/vendor-to-vendor" element={<PrivateRoute><VendorToVendor /></PrivateRoute>} />
        <Route path="/mandis" element={<PrivateRoute><MandiDirectory /></PrivateRoute>} />
        <Route path="/mandis/:id" element={<PrivateRoute><MandiDetail /></PrivateRoute>} />
        <Route path="/bulk-purchase" element={<PrivateRoute><BulkPurchase /></PrivateRoute>} />
        <Route path="/chatbot" element={<PrivateRoute><Chatbot /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><VendorProfile /></PrivateRoute>} /> {/* <<< NEW ROUTE */}
        <Route path="/cart" element={<PrivateRoute><Cart /></PrivateRoute>} /> {/* <<< NEW ROUTE */}
        {/* Add more protected routes here as you create new pages */}
      </Routes>
    </Router>
  );
}

export default App;