// saathi-bazaar-frontend/src/pages/Auth.jsx
// Basic functional authentication page for login and registration.
// This UI is simplified for backend testing. Your frontend team will enhance its design.

import React, { useState, useEffect } from 'react'; // React hooks for managing component state and side effects
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'; // Firebase functions for user account creation and sign-in
import { auth } from '../firebase'; // Your Firebase client-side authentication instance (from src/firebase.js)
import api from '../api'; // Your configured Axios API instance (from src/api.js) for communicating with your backend
import { useNavigate } from 'react-router-dom'; // Hook from React Router to programmatically navigate between pages

function Auth() {
  const [isRegister, setIsRegister] = useState(true); // State to toggle between the registration form (true) and the login form (false)
  const [email, setEmail] = useState(''); // State to hold the email input value
  const [password, setPassword] = useState(''); // State to hold the password input value
  const [name, setName] = useState(''); // State to hold the user's name input (only relevant for registration)
  const [contact, setContact] = useState(''); // State to hold the user's contact number input (only relevant for registration)
  const [shopName, setShopName] = useState(''); // State to hold the user's shop name input (only relevant for registration)
  const [location, setLocation] = useState({ lat: 0, long: 0 }); // State to store the user's geographic location (latitude and longitude)
  const [loadingLocation, setLoadingLocation] = useState(false); // State to indicate if the location is currently being fetched
  const navigate = useNavigate(); // Initialize the useNavigate hook to get the navigation function

  // Function to get the user's current geographic location using the browser's built-in Geolocation API
  const getLocation = () => {
    setLoadingLocation(true); // Set loading state to true while attempting to fetch location
    if (navigator.geolocation) { // Check if the browser supports the Geolocation API
      navigator.geolocation.getCurrentPosition(
        (position) => { // Success callback: This runs if the location is found
          setLocation({
            lat: position.coords.latitude, // Get latitude from the position object
            long: position.coords.longitude, // Get longitude from the position object
          });
          console.log("Location set:", position.coords.latitude, position.coords.longitude); // Log the location to the console for debugging
          setLoadingLocation(false); // Set loading state to false
        },
        (error) => { // Error callback: This runs if location fetching fails or the user denies permission
          console.error("Error getting location:", error); // Log the error to the console
          alert("Please enable location services for better experience. Using default location (Sealdah)."); // Inform the user
          setLoadingLocation(false); // Set loading state to false
          // Fallback to a default location (e.g., Sealdah, Kolkata coordinates) if the browser fails to get location
          setLocation({ lat: 22.5700, long: 88.3697 }); // Default Sealdah coordinates
        }
      );
    } else { // If the user's browser does not support geolocation
      alert("Geolocation is not supported by this browser. Using default location (Sealdah)."); // Inform the user
      setLoadingLocation(false);
      setLocation({ lat: 22.5700, long: 88.3697 }); // Default Sealdah coordinates
    }
  };

  // useEffect hook: This hook runs code after the component renders.
  // With an empty dependency array ([]), it runs only once after the initial render (similar to componentDidMount in class components).
  useEffect(() => {
    getLocation(); // Call getLocation when the component first loads to try and get user's location
  }, []);

  // Handles the form submission for both user registration and login
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default browser page refresh on form submission
    try {
      if (isRegister) { // Logic for user registration
        // 1. Register user with Firebase Authentication (client-side)
        // This creates an account for the user in Firebase's authentication system.
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; // Get the user object from Firebase (contains UID, email, etc.)
        // The 'api.post' call below will handle getting the ID token automatically via the Axios interceptor you set up.

        // 2. Send additional user data to your Node.js backend to save in MongoDB
        // This uses your 'api' instance to send a POST request to the '/auth/register' endpoint.
        // The backend will then store this user's details (name, contact, shop name, location) in MongoDB.
        await api.post('/auth/register', {
          uid: user.uid, // Pass Firebase User ID (UID) to link accounts in MongoDB
          email, // Optional: Pass email if your backend schema includes it
          password, // Optional: Pass password if your backend needs it, though it's less common for registration
          name, contact, shop_name: shopName, location,
        });
        alert('Registration successful! You can now log in.'); // Show a success message to the user
        setIsRegister(false); // After successful registration, automatically switch the form to login mode
      } else { // Logic for user login
        // 1. Log in user with Firebase Authentication (client-side)
        // This authenticates the user against Firebase's system.
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user; // Get the user object from Firebase
        const idToken = await user.getIdToken(); // Get the ID token (important for authenticating subsequent requests)

        // --- IMPORTANT CHANGES BELOW ---
        // 2. Call your backend's login route to get the MongoDB _id
        // The backend will verify idToken (sent via Axios interceptor) and return userId in response
        const res = await api.post('/auth/login', { idToken }); // Pass idToken in body for this specific login endpoint's needs
                                                                // Axios interceptor also adds it to headers.

        // 3. Store both the idToken and the MongoDB userId in local storage
        localStorage.setItem('idToken', idToken); // Store Firebase ID token
        localStorage.setItem('userId', res.data.userId); // <<<<< NEW: Store MongoDB userId returned from backend
        // --- END IMPORTANT CHANGES ---

        alert('Login successful!'); // Show a success message
        navigate('/dashboard'); // Navigate the user to the main dashboard page after successful login
      }
    } catch (error) { // Catch any errors that occur during Firebase authentication or API calls
      console.error('Authentication error:', error.message); // Log the error to the console for debugging
      alert(`Error: ${error.message}`); // Display a user-friendly error message to the user
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100"> {/* Outer container: sets minimum height to fill screen, uses flexbox to center content, light gray background */}
      <div className="bg-white p-8 rounded shadow-md w-96"> {/* Inner container (the card): white background, padding, rounded corners, shadow, fixed width */}
        <h2 className="text-2xl font-bold mb-4 text-center">
          {isRegister ? 'Register' : 'Login'} to Saathi Bazaar {/* Dynamic heading based on whether it's register or login mode */}
        </h2>
        <form onSubmit={handleSubmit}> {/* The HTML form for submission */}
          {isRegister && ( // Conditional rendering: These fields are only shown if 'isRegister' is true (registration mode)
            <>
              <input type="text" placeholder="Your Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <input type="text" placeholder="Contact Number" value={contact} onChange={(e) => setContact(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              <input type="text" placeholder="Shop Name" value={shopName} onChange={(e) => setShopName(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
              {/* Location display: Shows fetched location or "Fetching..." message */}
              <div className="mb-3">
                <span className="block text-sm text-gray-600">Your Location: {loadingLocation ? 'Fetching...' : `${location.lat.toFixed(4)}, ${location.long.toFixed(4)}`}</span>
                <button type="button" onClick={getLocation} className="text-sm text-blue-500 hover:underline">Recalibrate Location</button> {/* Button to re-fetch location */}
              </div>
            </>
          )}
          {/* Common fields for both register and login */}
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-2 mb-3 border rounded" required />
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            {isRegister ? 'Register' : 'Login'} {/* Dynamic button text */}
          </button>
        </form>
        <p className="mt-4 text-center">
          {isRegister ? 'Already have an account?' : 'Need an account?'}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-blue-500 hover:underline">
            {isRegister ? 'Login here' : 'Register here'} {/* Button to toggle between register/login forms */}
          </button>
        </p>
      </div>
    </div>
  );
}
export default Auth; // Exports the Auth component for use in App.jsx here is my auth.jsx