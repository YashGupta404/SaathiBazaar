// saathi-bazaar-frontend/src/components/Header.jsx
// Basic functional Header component for navigation and logout.
// Now uses standard CSS classes or inline styles.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('idToken');
      alert('Logged out successfully!');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error.message);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <header className="app-header"> {/* Uses a custom class defined in index.css */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '960px', margin: '0 auto' }}> {/* Basic layout for header content */}
        <Link to="/dashboard" className="logo">Saathi Bazaar</Link> {/* Uses a custom class defined in index.css */}
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', margin: '0', padding: '0' }}>
            <li><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Dashboard</Link></li>
            <li><Link to="/vendor-to-vendor" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>P2P Surplus</Link></li>
            <li><Link to="/mandis" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Mandis</Link></li>
            <li><Link to="/bulk-purchase" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Bulk Buy</Link></li>
            <li><Link to="/chatbot" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>AI Chat</Link></li>
            <li>
              <button onClick={handleLogout} style={{ background: '#dc2626', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.875rem', marginLeft: '1rem' }}>
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;