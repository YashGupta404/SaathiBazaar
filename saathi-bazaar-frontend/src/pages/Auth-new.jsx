// saathi-bazaar-frontend/src/pages/Auth.jsx
// Enhanced Authentication page with modern design system.

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
          email,
          password,
          name,
          contact,
          shop_name: shopName,
          location,
        });
        alert('Registration successful! You can now log in.');
        setIsRegister(false);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const idToken = await user.getIdToken();

        const res = await api.post('/auth/login', { idToken });

        localStorage.setItem('idToken', idToken);
        localStorage.setItem('userId', res.data.userId);

        alert('Login successful!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Authentication error:', error.message);
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Saathi Bazaar</h1>
          <p className="auth-subtitle">
            {isRegister ? 'Create your vendor account' : 'Welcome back, vendor!'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="form-input"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="form-input"
              placeholder="Enter your password"
              required
            />
          </div>

          {isRegister && (
            <>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="form-input"
                  placeholder="+91 XXXXX XXXXX"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Shop Name</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="form-input"
                  placeholder="Your shop name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <button
                  type="button"
                  onClick={getLocation}
                  className={`btn ${loadingLocation ? 'btn-secondary' : 'btn-outline'}`}
                  disabled={loadingLocation}
                  style={{ width: '100%' }}
                >
                  {loadingLocation ? (
                    <>
                      <span className="spinner"></span>
                      Getting location...
                    </>
                  ) : (
                    <>
                      📍 Get Current Location
                    </>
                  )}
                </button>
                {location.lat !== 0 && (
                  <p className="text-sm" style={{ color: 'var(--success-600)', marginTop: 'var(--space-2)' }}>
                    ✅ Location set: {location.lat.toFixed(4)}, {location.long.toFixed(4)}
                  </p>
                )}
              </div>
            </>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="auth-toggle">
          <p className="text-sm" style={{ color: 'var(--gray-600)' }}>
            {isRegister ? 'Already have an account?' : "Don't have an account?"}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: 'var(--primary-600)', 
                fontWeight: '500', 
                marginLeft: 'var(--space-1)',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isRegister ? 'Sign In' : 'Create Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
