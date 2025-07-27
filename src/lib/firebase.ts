
import { initializeApp, getApps, getApp } from 'firebase/app';

const firebaseConfig = {
  "projectId": "hangout-helper-m3ubd",
  "appId": "1:755444207735:web:33d7eb81b2bd52b773f672",
  "storageBucket": "hangout-helper-m3ubd.firebasestorage.app",
  "apiKey": "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
  "authDomain": "hangout-helper-m3ubd.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "755444207735"
};

// Initialize Firebase App
// This pattern prevents re-initialization in a Next.js environment.
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export { app };
