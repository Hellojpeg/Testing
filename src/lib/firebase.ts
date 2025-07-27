
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

let app: FirebaseApp;

// Initialize Firebase
// This simplified approach checks if an app is already initialized,
// otherwise it creates a new one. This is standard practice for Next.js.
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Get the Auth instance for the initialized app.
const auth: Auth = getAuth(app);

// Export the initialized app and auth instances for use in other parts of the application.
export { app, auth };
