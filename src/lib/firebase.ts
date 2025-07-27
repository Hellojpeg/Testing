
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

// A function to initialize Firebase and get the app instance.
// This ensures that we don't try to initialize the app more than once.
const getFirebaseApp = (): FirebaseApp => {
  return !getApps().length ? initializeApp(firebaseConfig) : getApp();
};

// The main Firebase app instance.
export const app: FirebaseApp = getFirebaseApp();

// The main Firebase Auth instance, now guaranteed to be initialized.
export const auth: Auth = getAuth(app);
