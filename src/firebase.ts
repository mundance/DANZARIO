import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
const env = import.meta.env;
export const emulator = env.DEV && env.VITE_USE_EMULATORS === "true";
const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_APP_ID",
] as const;
export const missingConfig = emulator
  ? []
  : required.filter((key) => !env[key]);
const config = emulator
  ? {
      apiKey: "demo-key",
      authDomain: "demo-danzario.firebaseapp.com",
      projectId: "demo-danzario",
      appId: "demo-app",
    }
  : {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      appId: env.VITE_FIREBASE_APP_ID,
    };
const app = missingConfig.length ? null : initializeApp(config);
export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
if (emulator && auth && db) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
