// saathi-bazaar-frontend/src/components/Header.jsx
// Enhanced Header component with modern design and improved UX.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';

function Header() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('idToken');
      localStorage.removeItem('userId');
      alert('Logged out successfully!');
      navigate('/auth');
    } catch (error) {
      console.error('Logout error:', error.message);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <header className="app-header">
      <div className="container">
        <Link to="/dashboard" className="logo">Saathi Bazaar</Link>
        <nav>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/vendor-to-vendor">P2P Surplus</Link></li>
            <li><Link to="/mandis">Mandis</Link></li>
            <li><Link to="/bulk-purchase">Bulk Buy</Link></li>
            <li><Link to="/chatbot">Bazaar Guru</Link></li>
            <li>
              <Link to="/cart" className="flex items-center gap-2">
                🛒 <span>My Cart</span>
              </Link>
            </li>
            <li>
              <Link to="/profile" className="profile-icon">
                👤
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;