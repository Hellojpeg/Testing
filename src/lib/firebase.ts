import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

// This is a public configuration and is safe to be exposed.
// Security is enforced by Firebase Security Rules and App Check.
const firebaseConfig = {
    "projectId": "hangout-helper-m3ubd",
    "appId": "1:755444207735:web:33d7eb81b2bd52b773f672",
    "storageBucket": "hangout-helper-m3ubd.firebasestorage.app",
    "apiKey": "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
    "authDomain": "hangout-helper-m3ubd.firebaseapp.com",
    "measurementId": "",
    "messagingSenderId": "755444207735"
};

// Initialize Firebase App using a singleton pattern
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export a function to get the auth instance, ensuring it's only called client-side.
export const getFirebaseAuth = (): Auth => {
    return getAuth(app);
}

export { app };
