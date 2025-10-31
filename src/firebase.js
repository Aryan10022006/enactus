// firebase.js
// Firebase configuration and initialization
// Replace the firebaseConfig object with your actual Firebase project credentials

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// -----------------------------
// CONFIGURE THESE BEFORE USE
// -----------------------------
// const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "your-project.firebaseapp.com",
//   projectId: "your-project-id",
//   storageBucket: "your-project.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "your-app-id"
// };
const firebaseConfig = {
    apiKey: "AIzaSyCR6LDxqde2pfl0DiJiIZMCME3P8DU8Xcw",
    authDomain: "enactus-5ebcb.firebaseapp.com",
    projectId: "enactus-5ebcb",
    storageBucket: "enactus-5ebcb.firebasestorage.app",
    messagingSenderId: "289075981005",
    appId: "1:289075981005:web:704d71110903a4724d5784",
    measurementId: "G-JTP5WNEGQW"
  };

// Event App ID - this identifies the specific orientation event
export const APP_ID = 'enactus-orientation-2025';

// Helper to get the event document path (must be even segments for Firestore)
export const getEventPath = () => `events/${APP_ID}`;

// Budget configuration - Admin controlled
// Admin can change these values before the event
export const TOTAL_BUDGET = 100000;
export const TEAM_BUDGET_PERCENTAGE = 0.6; // 60% for team members
export const ATTENDEE_BUDGET_PERCENTAGE = 0.4; // 40% for attendees

// Hide budget details from regular users
export const HIDE_BUDGET_INFO = true;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
