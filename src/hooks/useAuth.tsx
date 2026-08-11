import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChange, signInWithGoogle, logoutUser, FirebaseUser } from '../firebase/auth';
import { db, doc, getDoc, setDoc } from '../firebase/firestore';
import { UserProfile, UserRole } from '../types/backend';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: FirebaseUser | { uid: string; email: string } | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  loginAsDemoAdmin: () => void;
  logout: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  loginWithGoogle: async () => {},
  loginAsDemoAdmin: () => {},
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
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            const activeRole: UserRole = 'super_admin'; // Grant super_admin for admin portal login
            const updatedProfile: UserProfile = {
              ...data,
              role: activeRole,
              lastLoginAt: now,
            };
            setProfile(updatedProfile);
            await setDoc(userDocRef, { role: activeRole, lastLoginAt: now }, { merge: true });
          } else {
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Administrator ABB',
              photoURL: firebaseUser.photoURL || undefined,
              role: 'super_admin',
              status: 'active',
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('⚠️ Gagal memuat/menyimpan profil user Firestore, mengaktifkan profil admin:', err);
          setProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email || 'abbcommunityrider@gmail.com',
            displayName: firebaseUser.displayName || 'Administrator ABB',
            photoURL: firebaseUser.photoURL || undefined,
            role: 'super_admin',
            status: 'active',
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
          });
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

  const loginAsDemoAdmin = () => {
    const now = new Date().toISOString();
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
