// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
// COPY THIS FILE TO firebase.js AND REPLACE WITH YOUR ACTUAL CONFIG
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  authDomain: 'your-project.firebaseapp.com',
  projectId: 'your-project-id',
  storageBucket: 'your-project.appspot.com',
  messagingSenderId: '123456789',
  appId: 'your_app_id_here'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize and export auth
const auth = getAuth(app);
export { auth };