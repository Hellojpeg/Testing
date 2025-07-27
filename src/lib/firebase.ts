
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';

// Your web app's Firebase configuration is defined here.
const firebaseConfig = {
  apiKey: "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
  authDomain: "hangout-helper-m3ubd.firebaseapp.com",
  projectId: "hangout-helper-m3ubd",
  storageBucket: "hangout-helper-m3ubd.firebasestorage.app",
  messagingSenderId: "755444207735",
  appId: "1:755444207735:web:3e1e2a9fff14567573f672"
};

// Initialize Firebase App in a way that is safe for both server and client rendering in Next.js
const app: FirebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export only the initialized app
export { app };
