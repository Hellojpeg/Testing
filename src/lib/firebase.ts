
import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAhu7ZWWNpsPkoGdQV75lDiZvVy6dHdEWM",
  authDomain: "hangout-helper-m3ubd.firebaseapp.com",
  projectId: "hangout-helper-m3ubd",
  storageBucket: "hangout-helper-m3ubd.firebasestorage.app",
  messagingSenderId: "755444207735",
  appId: "1:755444207735:web:3e1e2a9fff14567573f672"
};


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
      app = null; 
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
       auth = null; 
    }
  } else {
     console.error("Firebase app was not initialized successfully (app object is null/undefined), cannot getAuth.");
     // @ts-ignore
     auth = null;
  }

} else {
  console.error("Firebase configuration is missing critical values. Firebase SDK will not be initialized.");
  // @ts-ignore
  app = null;
  // @ts-ignore
  auth = null;
}


export { app, auth };
