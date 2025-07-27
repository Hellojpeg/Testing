
import { initializeApp, getApps } from 'firebase/app';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Check if all required environment variables are present
const isConfigValid = 
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.storageBucket &&
  firebaseConfig.messagingSenderId &&
  firebaseConfig.appId;

// Initialize Firebase App
let app;

// Prevent re-initialization in a Next.js environment
if (!getApps().length) {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    console.error("Firebase config is missing or incomplete. Please check your .env file.");
    // Create a dummy app or throw an error to prevent the app from crashing.
    // In this case, we'll let it proceed, but auth will fail.
    app = initializeApp({}); // This will cause auth to fail gracefully.
  }
} else {
  app = getApps()[0];
}

export { app };
