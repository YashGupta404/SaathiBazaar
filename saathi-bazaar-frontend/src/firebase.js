// saathi-bazaar-frontend/src/firebase.js
// This file configures your Firebase client-side application.

// Import necessary functions from the Firebase SDKs.
// initializeApp: For connecting your app to Firebase.
// getAuth: For using Firebase Authentication services.
// getAnalytics: For using Firebase Analytics (optional, for tracking app usage).
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration.
// This 'firebaseConfig' object contains the unique identifiers for YOUR specific Firebase project.
// You provided these details. measurementId is optional for older SDK versions, but good to include if present.
const firebaseConfig = {
  apiKey: "AIzaSyAhrSweBIDNf3j6fhOChgqA7IoTBL-wRmU", // Your Firebase API Key
  authDomain: "saathi-bazaar-hackathon-2025.firebaseapp.com", // Your Firebase Auth Domain
  projectId: "saathi-bazaar-hackathon-2025", // Your Firebase Project ID
  storageBucket: "saathi-bazaar-hackathon-2025.firebasestorage.app", // Your Firebase Storage Bucket
  messagingSenderId: "202055329041", // Your Firebase Messaging Sender ID
  appId: "1:202055329041:web:8e9939c0a42828ba33d8b0", // Your Firebase App ID
  measurementId: "G-RV0EVSRH19" // Your Firebase Measurement ID (for Analytics)
};

// Initialize Firebase
const app = initializeApp(firebaseConfig); // This connects your web app to your Firebase project.

// Get Firebase services. These objects will be used throughout your React app.
// 'auth' for user login/signup/logout.
// 'analytics' for sending usage data to Google Analytics (optional, but initialized here).
export const auth = getAuth(app);
export const analytics = getAnalytics(app); // Note: Analytics is initialized but not directly used in initial MVP features.