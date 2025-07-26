// saathi-bazaar-frontend/src/pages/Auth.jsx
// Basic functional authentication page for login and registration.
// Now uses standard CSS classes or inline styles.

import React, { useState, useEffect } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import api from '../api';
import { useNavigate } from 'react-router-dom';

function Auth() {
  const [isRegister, setIsRegister] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [shopName, setShopName] = useState('');
  const [location, setLocation] = useState({ lat: 0, long: 0 });
  const [loadingLocation, setLoadingLocation] = useState(false);
  const navigate = useNavigate();

  const getLocation = () => {
    setLoadingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            long: position.coords.longitude,
          });
          console.log("Location set:", position.coords.latitude, position.coords.longitude);
          setLoadingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location services for better experience. Using default location (Sealdah).");
          setLoadingLocation(false);
          setLocation({ lat: 22.5700, long: 88.3697 });
        }
      );
    } else {
      alert("Geolocation is not supported by this browser. Using default location (Sealdah).");
      setLoadingLocation(false);
      setLocation({ lat: 22.5700, long: 88.3697 });
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await api.post('/auth/register', {
          uid: user.uid,
          email, password, name, contact, shop_name: shopName, location,
        });
        alert('Registration successful! You can now log in.');
        setIsRegister(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();
        localStorage.setItem('idToken', idToken);
        alert('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="flex-center" style={{ flexDirection: 'column', height: '100vh', backgroundColor: '#f3f4f6' }}> {/* Simple flex center, full height */}
      <div className="card" style={{ width: '380px', textAlign: 'center' }}> {/* Basic card style, fixed width, centered text */}
        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '20px' }}>
          {isRegister ? 'Register' : 'Login'} to Saathi Bazaar
        </h2>
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <>
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <input type="text" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} required />
              <input type="text" placeholder="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} required />
              <div style={{ marginBottom: '15px', fontSize: '0.875rem', color: '#6b7280' }}>
                <span style={{ display: 'block' }}>Your Location: {loadingLocation ? 'Fetching...' : `${location.lat.toFixed(4)}, ${location.long.toFixed(4)}`}</span>
                <button type="button" onClick={getLocation} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', padding: '0', cursor: 'pointer', display: 'inline-block', width: 'auto', marginBottom: '0' }}>Recalibrate Location</button>
              </div>
            </>
          )}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem' }}>
            {isRegister ? 'Register' : 'Login'}
          </button>
        </form>
        <p style={{ marginTop: '20px', fontSize: '0.875rem' }}>
          {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#3b82f6', textDecoration: 'underline', padding: '0', cursor: 'pointer', width: 'auto', marginBottom: '0' }}>
            {isRegister ? 'Login here' : 'Register here'}
          </button>
        </p>
      </div>
    </div>
  );
}
export default Auth;