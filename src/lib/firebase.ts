
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration, directly provided.
const firebaseConfig = {
  apiKey: "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
  authDomain: "hangout-helper-m3ubd.firebaseapp.com",
  projectId: "hangout-helper-m3ubd",
  storageBucket: "hangout-helper-m3ubd.firebasestorage.app",
  messagingSenderId: "755444207735",
  appId: "1:755444207735:web:3e1e2a9fff14567573f672"
};

// Initialize Firebase
// A robust way to initialize Firebase in a Next.js environment.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Get the Auth instance for the initialized app.
const auth: Auth = getAuth(app);

// Export the initialized app and auth instances for use in other parts of the application.
export { app, auth };
