import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { initializeAuth, getReactNativePersistence, getAuth } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyAO9zkgMRHMm4MMknoK9JqRdGIsgtQWEq4",
  authDomain: "pro-movie-app.firebaseapp.com",
  projectId: "pro-movie-app",
  storageBucket: "pro-movie-app.firebasestorage.app",
  messagingSenderId: "623643146379",
  appId: "1:623643146379:web:3251cc65027fb7983cfc8e",
};

// Check if app is already initialized (prevents hot-reload errors)
const isNewApp = getApps().length === 0;
const app = isNewApp ? initializeApp(firebaseConfig) : getApp();

let auth;
if (isNewApp) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} else {
  // Use existing auth instance during hot reload
  auth = getAuth(app);
}

export { auth };
export const db = getFirestore(app);