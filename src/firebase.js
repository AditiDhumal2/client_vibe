// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// Remove analytics import if not used
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAQK0qQVNqiXjebfmGEzXau85tRKD8F1Ds",
  authDomain: "client-vibe.firebaseapp.com",
  projectId: "client-vibe",
  storageBucket: "client-vibe.firebasestorage.app",
  messagingSenderId: "596950498678",
  appId: "1:596950498678:web:7429566c4aca352e3e4e57",
  measurementId: "G-CSL7RNEFCP"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export auth
const auth = getAuth(app);
export { auth };