import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  User as FirebaseUser,
  UserCredential,
} from 'firebase/auth';
import { auth } from './config';

export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async (): Promise<UserCredential> => {
  return await signInWithPopup(auth, googleProvider);
};

export const logoutUser = async (): Promise<void> => {
  return await firebaseSignOut(auth);
};

export const onAuthStateChange = (callback: (user: FirebaseUser | null) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

export type { FirebaseUser };
