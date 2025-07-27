// saathi-bazaar-frontend/src/components/Header.jsx
// Header component with a circular profile icon, My Cart link, and standard navigation.
// Logout button is removed from here, to be placed on the Profile page.

import React from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Link for navigation, useNavigate for redirects
import { auth } from '../firebase'; // Firebase client-side auth (still needed for potential future use or if logout moved back)

function Header() {
  const navigate = useNavigate();

  // The handleLogout function is still here for now, as other pages might conceptually use it,
  // but it's removed from the header's direct button. It will primarily be used on the Profile page.
  const handleLogout = async () => {
    try {
      await auth.signOut(); // Logs out from Firebase Authentication
      localStorage.removeItem('idToken'); // Removes stored login token
      localStorage.removeItem('userId'); // Also remove the userId from localStorage on logout
      alert('Logged out successfully!'); // Show a success message
      navigate('/auth'); // Redirects the user to the login/registration page
    } catch (error) {
      console.error('Logout error:', error.message);
      alert('Failed to logout. Please try again.');
    }
  };

  return (
    <header className="app-header"> {/* Uses basic header styles from index.css */}
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '960px', margin: '0 auto' }}>
        <Link to="/dashboard" className="logo">Saathi Bazaar</Link> {/* App name as a link to dashboard */}
        <nav>
          <ul style={{ display: 'flex', listStyle: 'none', margin: '0', padding: '0', alignItems: 'center' }}>
            <li><Link to="/dashboard" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Dashboard</Link></li>
            <li><Link to="/vendor-to-vendor" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>P2P Surplus</Link></li>
            <li><Link to="/mandis" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Mandis</Link></li>
            <li><Link to="/bulk-purchase" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Bulk Buy</Link></li>
            <li><Link to="/chatbot" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem' }}>Bazaar Guru</Link></li>
            
            {/* --- "My Cart" Link in Header --- */}
            <li>
                <Link to="/cart" style={{ color: 'white', textDecoration: 'none', marginLeft: '1rem', display: 'flex', alignItems: 'center' }}>
                    My Cart {/* Text for "My Cart". Frontend team can replace with a cart icon. */}
                </Link>
            </li>
            
            {/* --- Profile Icon (Circular, with Person Symbol) --- */}
            <li>
                <Link to="/profile" style={{
                    marginLeft: '1rem',
                    width: '36px', // Fixed width for circular icon
                    height: '36px', // Fixed height for circular icon
                    borderRadius: '50%', // Makes it circular
                    backgroundColor: 'rgba(255,255,255,0.2)', // Light transparent background
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.2rem', // Increased font size for symbol
                    fontWeight: 'bold',
                    textDecoration: 'none',
                    flexShrink: 0 // Prevent shrinking
                }}>
                    👤 {/* Unicode person symbol as placeholder icon. Your frontend team can replace with an actual image/SVG icon. */}
                </Link>
            </li>
            
            {/* --- LOGOUT BUTTON REMOVED FROM HERE --- */}
            {/* It will be placed on the Profile page instead. */}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;