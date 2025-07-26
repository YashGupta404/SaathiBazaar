// saathi-bazaar-frontend/src/pages/Dashboard.jsx
// Basic functional Dashboard component for navigation.
// Now uses standard CSS classes or inline styles.

import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}> {/* Basic full height, light gray background */}
      <Header /> {/* Includes your consistent Header component */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '16px', paddingTop: '80px' }}> {/* Centered content area, padding, top padding to clear fixed header */}
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#1f2937' }}>Welcome to Saathi Bazaar!</h1> {/* Main heading */}
        <p style={{ fontSize: '1.125rem', textAlign: 'center', color: '#4b5563', marginBottom: '32px' }}>Your one-stop solution for street food raw materials.</p> {/* Subtitle */}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}> {/* Responsive grid layout for feature cards */}
          {/* Card for Vendor-to-Vendor Exchange */}
          <div className="card" onClick={() => navigate('/vendor-to-vendor')}
               style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}> {/* Uses basic card style from index.css */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '12px', color: '#2563eb' }}>Vendor-to-Vendor Exchange</h2>
            <p style={{ color: '#374151' }}>Sell your surplus or find items from nearby vendors. Reduce waste, save money.</p>
          </div>

          {/* Card for Direct Mandi Shop Purchase */}
          <div className="card" onClick={() => navigate('/mandis')}
               style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '12px', color: '#16a34a' }}>Direct Mandi Shop Purchase</h2>
            <p style={{ color: '#374151' }}>Browse trusted local wholesale mandi shops, get prices, and connect directly.</p>
          </div>

          {/* Card for Bulk Buy Scheme */}
          <div className="card" onClick={() => navigate('/bulk-purchase')}
               style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '12px', color: '#9333ea' }}>Bulk Buy Scheme</h2>
            <p style={{ color: '#374151' }}>Pool your orders with others for huge discounts on essential items. Get it delivered!</p>
          </div>

          {/* Card for AI Chatbot */}
          <div className="card" onClick={() => navigate('/chatbot')}
               style={{ cursor: 'pointer', border: '1px solid #e5e7eb' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'semibold', marginBottom: '12px', color: '#ea580c' }}>AI Saathi Assistant</h2>
            <p style={{ color: '#374151' }}>Ask questions about sourcing, prices, or anything related to your business.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;