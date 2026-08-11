import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore';
import { getStorage, connectStorageEmulator, FirebaseStorage } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator, Functions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA2i2WahpN93wtX_zwOY-Fb-LNeJpVek80',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'abbcommunityridersites.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'abbcommunityridersites',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'abbcommunityridersites.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '533040607988',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:533040607988:web:1051baee97e3b1eadbe4a1',
};

// Check if valid production or local credentials exist
export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    (import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey) &&
    (import.meta.env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId)
  );
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);
storage = getStorage(app);
functions = getFunctions(app);

// Enable local emulators if configured
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  connectAuthEmulator(auth, 'http://localhost:9099');
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectStorageEmulator(storage, 'localhost', 9199);
  connectFunctionsEmulator(functions, 'localhost', 5001);
  console.info('🔥 Firebase Connected to Local Emulators');
}

export { app, auth, db, storage, functions };
