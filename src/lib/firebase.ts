import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

export type FirebaseClients = {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  storage: FirebaseStorage;
};

// Global singleton cache untuk mencegah re-inisialisasi ganda saat Fast Refresh / Turbopack
declare global {
  // eslint-disable-next-line no-var
  var __firebase_clients__: FirebaseClients | undefined;
}

export function getFirebase(): FirebaseClients {
  if (globalThis.__firebase_clients__) {
    return globalThis.__firebase_clients__;
  }

  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error(
      "Firebase config belum terisi. Salin .env.local.example jadi .env.local lalu isi dari Firebase Console > Project settings."
    );
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);
  const storage = getStorage(app);

  const clients: FirebaseClients = { app, auth, db, storage };

  if (process.env.NODE_ENV !== "production") {
    globalThis.__firebase_clients__ = clients;
  }

  return clients;
}

// Backward compatibility alias
export const initFirebase = getFirebase;
