
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// Your web app's Firebase configuration is defined here.
const firebaseConfig = {
  apiKey: "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
  authDomain: "hangout-helper-m3ubd.firebaseapp.com",
  projectId: "hangout-helper-m3ubd",
  storageBucket: "hangout-helper-m3ubd.firebasestorage.app",
  messagingSenderId: "755444207735",
  appId: "1:755444207735:web:3e1e2a9fff14567573f672"
};

// Singleton pattern to ensure only one instance of Firebase is initialized.
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth: Auth = getAuth(app);

// Export the singleton instances.
export { app, auth };
