
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Enhanced diagnostic log - This will log in the BROWSER console
if (typeof window !== 'undefined') { 
  console.log('--- Firebase Initialization Diagnostics (Client-Side) ---');
  const expectedVars = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', // Added for completeness
  ];
  let allVarsPresent = true;
  let criticalVarMissing = false;

  console.log('Reading Firebase config from process.env:');
  expectedVars.forEach(varName => {
    const value = process.env[varName];
    if (value && value.trim() !== '') {
      console.log(`  ✅ ${varName} is PRESENT (length: ${value.length})`);
    } else {
      console.error(`  ❌ CRITICAL: ${varName} is MISSING or EMPTY in .env.local or not loaded by Next.js!`);
      allVarsPresent = false;
      if (varName === 'NEXT_PUBLIC_FIREBASE_API_KEY') {
        criticalVarMissing = true;
      }
    }
  });

  if (allVarsPresent) {
    console.log('All expected Firebase environment variables appear to be loaded by Next.js.');
    console.log('If you are still seeing "auth/invalid-api-key":');
    console.log('1. Double-check that the API_KEY value in .env.local is an EXACT MATCH from your Firebase project console.');
    console.log('2. Ensure you have FULLY RESTARTED your Next.js development server (e.g., `npm run dev`) after creating/modifying .env.local.');
  } else {
    console.error('One or more Firebase environment variables are missing or empty. Firebase initialization WILL FAIL.');
    if (criticalVarMissing) {
      console.error('Specifically, NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty. This is essential.');
    }
    console.error('Please ensure your .env.local file is correctly set up in the project root and you have restarted your development server.');
  }
  console.log('--- End Firebase Diagnostics ---');
}


let app: FirebaseApp;
let auth: Auth;

// Check if all critical environment variables are present before initializing
if (
  firebaseConfig.apiKey &&
  firebaseConfig.authDomain &&
  firebaseConfig.projectId &&
  firebaseConfig.appId
) {
  if (!getApps().length) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (e) {
      console.error("Firebase initialization failed during initializeApp:", e);
      // @ts-ignore
      app = null; // Ensure app is null if initialization fails
    }
  } else {
    app = getApp();
  }

  // @ts-ignore
  if (app) {
    try {
      auth = getAuth(app);
    } catch (e) {
       console.error("Firebase getAuth failed:", e);
       // @ts-ignore
       auth = null; // Ensure auth is null if getAuth fails
    }
  } else {
     console.error("Firebase app was not initialized successfully, cannot getAuth.");
     // @ts-ignore
     auth = null;
  }

} else {
  console.error("Firebase configuration is missing critical environment variables. Firebase SDK will not be initialized.");
  // @ts-ignore
  app = null; 
  // @ts-ignore
  auth = null;
}


export { app, auth };
