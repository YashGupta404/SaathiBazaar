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
  const [locationAddress, setLocationAddress] = useState('');
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState('');
  const navigate = useNavigate();

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      // Using Nominatim (OpenStreetMap) - Free and no API key required
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en&addressdetails=1`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.display_name) {
          // Format the address nicely
          const address = data.address;
          let formattedAddress = '';
          
          if (address) {
            const parts = [];
            if (address.house_number && address.road) {
              parts.push(`${address.house_number} ${address.road}`);
            } else if (address.road) {
              parts.push(address.road);
            }
            if (address.neighbourhood || address.suburb) {
              parts.push(address.neighbourhood || address.suburb);
            }
            if (address.city || address.town || address.village) {
              parts.push(address.city || address.town || address.village);
            }
            if (address.state) {
              parts.push(address.state);
            }
            if (address.postcode) {
              parts.push(address.postcode);
            }
            
            formattedAddress = parts.join(', ');
          }
          
          return formattedAddress || data.display_name;
        }
      }
      
      // Fallback to coordinates if geocoding fails
      return `📍 Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Error getting address:', error);
      return `📍 Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  };

  const getLocation = () => {
    setLoadingLocation(true);
    setLoadingAddress(true);
    setLocationAddress(''); // Clear previous address
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          setLocation({
            lat: lat,
            long: lng,
          });
          setLoadingLocation(false);
          
          console.log("Location set:", lat, lng);
          
          // Get the address from coordinates
          const address = await getAddressFromCoordinates(lat, lng);
          setLocationAddress(address);
          setLoadingAddress(false);
          
          console.log("Address:", address);
        },
        async (error) => {
          console.error("Error getting location:", error);
          alert("Please enable location services for better experience. Using default location (Sealdah).");
          setLoadingLocation(false);
          const defaultLat = 22.5700;
          const defaultLng = 88.3697;
          setLocation({ lat: defaultLat, long: defaultLng });
          
          // Get address for default location
          const address = await getAddressFromCoordinates(defaultLat, defaultLng);
          setLocationAddress(address);
          setLoadingAddress(false);
        }
      );
    } else {
      const defaultLat = 22.5700;
      const defaultLng = 88.3697;
      alert("Geolocation is not supported by this browser. Using default location (Sealdah).");
      setLoadingLocation(false);
      setLocation({ lat: defaultLat, long: defaultLng });
      
      // Get address for default location
      getAddressFromCoordinates(defaultLat, defaultLng).then(address => {
        setLocationAddress(address);
        setLoadingAddress(false);
      });
    }
  };

  useEffect(() => {
    getLocation();
    
    // Create floating particles for auth page
    const createParticle = () => {
      const particleTypes = [
        { type: 'leaf', content: ['🍃', '🌿', '☘️'], className: 'leaf' },
        { type: 'sparkle', content: [''], className: 'sparkle' },
        { type: 'bubble', content: [''], className: 'bubble' }
      ];
      
      const randomType = particleTypes[Math.floor(Math.random() * particleTypes.length)];
      const particle = document.createElement('div');
      particle.className = `auth-particle ${randomType.className}`;
      
      if (randomType.type === 'leaf') {
        particle.textContent = randomType.content[Math.floor(Math.random() * randomType.content.length)];
      }
      
      particle.style.left = Math.random() * 100 + '%';
      particle.style.top = Math.random() * 100 + '%';
      particle.style.animationDelay = Math.random() * 2 + 's';
      particle.style.animationDuration = (Math.random() * 4 + 6) + 's';
      
      const authContainer = document.querySelector('.auth-container');
      if (authContainer) {
        authContainer.appendChild(particle);
        
        setTimeout(() => {
          if (particle.parentNode) {
            particle.remove();
          }
        }, 12000);
      }
    };
    
    // Create particles periodically
    const particleInterval = setInterval(createParticle, 2000);
    
    // Create initial particles
    for (let i = 0; i < 5; i++) {
      setTimeout(createParticle, i * 500);
    }
    
    return () => {
      clearInterval(particleInterval);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Animated geometric background elements */}
      <div className="geometric-bg circle-1"></div>
      <div className="geometric-bg circle-2"></div>
      <div className="geometric-bg triangle-1"></div>
      <div className="geometric-bg hexagon-1"></div>
      
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
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField('')}
              className={`form-input ${focusedField === 'email' ? 'form-focused' : ''}`}
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
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField('')}
              className={`form-input ${focusedField === 'password' ? 'form-focused' : ''}`}
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
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField('')}
                  className={`form-input ${focusedField === 'name' ? 'form-focused' : ''}`}
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
                  onFocus={() => setFocusedField('contact')}
                  onBlur={() => setFocusedField('')}
                  className={`form-input ${focusedField === 'contact' ? 'form-focused' : ''}`}
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
                  onFocus={() => setFocusedField('shopName')}
                  onBlur={() => setFocusedField('')}
                  className={`form-input ${focusedField === 'shopName' ? 'form-focused' : ''}`}
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
                {location.lat !== 0 && locationAddress && !loadingAddress && (
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <p className="text-sm" style={{ color: 'var(--success-600)', marginBottom: 'var(--space-1)' }}>
                      ✅ Location detected:
                    </p>
                    <p className="text-sm" style={{ 
                      color: 'var(--gray-700)', 
                      backgroundColor: 'var(--success-50)', 
                      padding: 'var(--space-3)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--success-200)',
                      fontSize: '0.875rem',
                      lineHeight: '1.4'
                    }}>
                      📍 {locationAddress}
                    </p>
                  </div>
                )}
                {location.lat !== 0 && loadingAddress && (
                  <div style={{ marginTop: 'var(--space-3)' }}>
                    <p className="text-sm" style={{ color: 'var(--warning-600)', marginBottom: 'var(--space-1)' }}>
                      � Getting address...
                    </p>
                    <p className="text-sm" style={{ 
                      color: 'var(--gray-600)', 
                      backgroundColor: 'var(--warning-50)', 
                      padding: 'var(--space-2)', 
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--warning-200)',
                      fontSize: '0.75rem'
                    }}>
                      Coordinates: {location.lat.toFixed(4)}, {location.long.toFixed(4)}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <button 
            type="submit" 
            className="btn btn-primary btn-lg" 
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                {isRegister ? 'Creating Account...' : 'Signing In...'}
              </>
            ) : (
              <>
                {isRegister ? '🌱 Create Account' : '🔐 Sign In'}
              </>
            )}
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
