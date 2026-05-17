// client/src/lib/firebase.js

import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your TeePoP Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkTthwGyppE_4V5BkKREMsa_Vgz4WH0Ow",
  authDomain: "agents-name.firebaseapp.com",
  projectId: "agents-name",
  storageBucket: "agents-name.firebasestorage.app",
  messagingSenderId: "880994939187",
  appId: "1:880994939187:web:eadb11e0f0299c58da0e46",
  measurementId: "G-ZDN3HSC82K"
};

// Initialize Firebase safely so React strict mode does not initialize twice
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Firebase services used by your app
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in supported browser environments
export let analytics = null;

if (typeof window !== "undefined" && firebaseConfig.measurementId) {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch(() => {
      analytics = null;
    });
}

export default app;