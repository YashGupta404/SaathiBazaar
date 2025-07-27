// saathi-bazaar-frontend/src/pages/Dashboard.jsx
// Enhanced Dashboard with Indian grocery shop theme and dynamic elements.

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

function Dashboard() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning!';
    if (hour < 17) return 'Good Afternoon!';
    return 'Good Evening!';
  };

  const features = [
    {
      id: 'vendor-exchange',
      title: 'P2P Exchange',
      subtitle: 'Vendor-to-Vendor Surplus',
      description: 'Reduce waste, save money with nearby vendors.',
      icon: '🔄',
      route: '/vendor-to-vendor',
      className: 'vendor-exchange',
      badge: 'Live'
    },
    {
      id: 'mandi-directory',
      title: 'Mandi Guide',
      subtitle: 'Wholesale Market Directory',
      description: 'Connect with trusted wholesale mandis for bulk purchases.',
      icon: '🏪',
      route: '/mandis',
      className: 'mandi-directory',
      badge: 'Verified'
    },
    {
      id: 'bulk-purchase',
      title: 'Bulk Buying',
      subtitle: 'Group Purchase Scheme',
      description: 'Pool orders with other vendors for huge discounts!',
      icon: '📦',
      route: '/bulk-purchase',
      className: 'bulk-purchase',
      badge: 'Save 30%'
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      subtitle: 'Your Smart Business Helper',
      description: 'Get smart advice on pricing, sourcing, and business growth.',
      icon: '🤖',
      route: '/chatbot',
      className: 'ai-assistant',
      badge: 'Smart'
    }
  ];

  return (
    <div className="page-container">
      <Header />
      <div className="page-content">
        <div className="dashboard-hero">
          <h1 className="dashboard-title">
            Welcome to Saathi Bazaar!
          </h1>
          <p className="dashboard-subtitle">
            {getGreeting()} Your trusted partner for street food raw materials
          </p>
        </div>

        <div className="feature-grid">
          {features.map((feature, index) => (
            <div 
              key={feature.id}
              className={`feature-card ${feature.className}`}
              onClick={() => navigate(feature.route)}
            >
              <div className="indian-pattern"></div>
              <div className="feature-icon">
                {feature.icon}
              </div>
              <h2 className="feature-title">
                {feature.title}
                <div className="text-sm font-normal text-gray-500 mt-1">
                  {feature.subtitle}
                </div>
              </h2>
              <p className="feature-description">{feature.description}</p>
              <span className="feature-badge">{feature.badge}</span>
            </div>
          ))}
        </div>

        {/* Quick Actions Section */}
        <div className="card mt-12 p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="btn btn-outline flex items-center gap-2"
              onClick={() => navigate('/vendor-to-vendor')}
            >
              ➕ List Surplus Item
            </button>
            <button 
              className="btn btn-outline flex items-center gap-2"
              onClick={() => navigate('/bulk-purchase')}
            >
              🛒 Check Bulk Orders
            </button>
            <button 
              className="btn btn-outline flex items-center gap-2"
              onClick={() => navigate('/chatbot')}
            >
              💬 Ask Bazaar Guru
            </button>
          </div>
        </div>

        {/* Market Insights */}
        <div className="card mt-8 p-6" style={{ background: 'linear-gradient(135deg, var(--turmeric-50), var(--saffron-50))' }}>
          <h3 className="text-xl font-semibold mb-4 text-gray-800">
            📊 Today's Market Insights
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">🔥 Trending Items</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Tomatoes</span>
                  <span className="badge badge-success">High Demand</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Onions</span>
                  <span className="badge badge-warning">Price Rising</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Coriander</span>
                  <span className="badge badge-primary">Available</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">💡 Smart Tips</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bulk buying saves 20-30% on average</li>
                <li>• Morning surplus items are freshest</li>
                <li>• Check nearby mandis for wholesale rates</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;