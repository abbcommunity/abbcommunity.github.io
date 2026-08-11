import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChange, signInWithGoogle, logoutUser, FirebaseUser } from '../firebase/auth';
import { db, doc, setDoc } from '../firebase/firestore';
import { UserProfile, UserRole } from '../types/backend';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: FirebaseUser | { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  loginWithGoogle: async () => {},
  loginAsDemoAdmin: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | { uid: string; email: string } | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        const now = new Date().toISOString();

        // Grant super_admin profile immediately so UI proceeds instantly
        const activeProfile: UserProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || 'abbcommunityrider@gmail.com',
          displayName: firebaseUser.displayName || 'Administrator ABB',
          photoURL: firebaseUser.photoURL || undefined,
          role: 'super_admin',
          status: 'active',
          createdAt: now,
          updatedAt: now,
          lastLoginAt: now,
        };

        setProfile(activeProfile);

        // Sync with Firestore in background
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          await setDoc(userDocRef, activeProfile, { merge: true });
        } catch (err) {
          console.warn('⚠️ Firestore user profile sync note (admin mode active):', err);
        }
      } else if (!user) {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Error Sign-in Google:', err);
      throw err;
    }
  };

  const loginAsDemoAdmin = async () => {
    const now = new Date().toISOString();
    try {
      // Authenticate with Firebase Auth anonymously so request.auth != null in security rules
      const cred = await signInAnonymously(auth);
      const demoProfile: UserProfile = {
        uid: cred.user.uid,
        email: 'abbcommunityrider@gmail.com',
        displayName: 'Adipta Yanuardie (Super Admin Demo)',
        role: 'super_admin',
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      setUser(cred.user);
      setProfile(demoProfile);
    } catch (e) {
      // Fallback if offline
      const demoProfile: UserProfile = {
        uid: 'demo-super-admin-uid',
        email: 'abbcommunityrider@gmail.com',
        displayName: 'Adipta Yanuardie (Super Admin Demo)',
        role: 'super_admin',
        status: 'active',
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      };
      setUser({ uid: 'demo-super-admin-uid', email: 'abbcommunityrider@gmail.com' });
      setProfile(demoProfile);
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // ignore
    }
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: configured,
        loginWithGoogle,
        loginAsDemoAdmin,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
