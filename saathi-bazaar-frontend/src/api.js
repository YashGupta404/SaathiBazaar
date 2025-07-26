// saathi-bazaar-frontend/src/api.js
import axios from 'axios'; // Imports the Axios library for making HTTP requests (used to communicate with your backend)
import { auth } from './firebase'; // Imports your Firebase client-side authentication instance (from src/firebase.js)

// Creates an Axios instance with a base URL for your backend API.
// All requests made using 'api.get', 'api.post', etc., through this instance will automatically prepend this baseURL.
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // <<<<<< IMPORTANT: This is the local address of your backend server.
                                        // During local development, your backend will run on localhost:5000.
                                        // YOU WILL CHANGE THIS TO YOUR LIVE BACKEND URL DURING DEPLOYMENT (Step 12)!
});

// This is an "interceptor" which runs BEFORE every single request your app sends using this 'api' instance.
// Its job is to automatically get the current user's Firebase login token and add it to the request's headers.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser; // Gets the currently logged-in Firebase user object (if any)
  if (user) { // Checks if a user is actually logged in
    const idToken = await user.getIdToken(); // Get their Firebase ID token (this token proves they are logged in and verified by Firebase)
    config.headers.Authorization = `Bearer ${idToken}`; // Adds it to the 'Authorization' header of the request. This is how your backend verifies who is making the request.
  }
  return config; // Continues with sending the modified request
}, (error) => {
  return Promise.reject(error); // Handles any errors that occur before the request is sent
});

export default api; // Exports this configured Axios instance. You will import 'api' into your React components to make requests to your backend.