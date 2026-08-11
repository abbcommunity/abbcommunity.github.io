import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChange, signInWithGoogle, logoutUser, FirebaseUser } from '../firebase/auth';
import { db, doc, getDoc, setDoc } from '../firebase/firestore';
import { UserProfile, UserRole } from '../types/backend';
import { isFirebaseConfigured } from '../firebase/config';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const defaultValue: AuthContextType = {
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  loginWithGoogle: async () => {},
  logout: async () => {},
};

const AuthContext = createContext<AuthContextType>(defaultValue);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const configured = isFirebaseConfigured();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const snap = await getDoc(userDocRef);
          const now = new Date().toISOString();

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            setProfile(data);
            await setDoc(userDocRef, { lastLoginAt: now }, { merge: true });
          } else {
            const defaultRole: UserRole =
              firebaseUser.email === 'abbcommunityrider@gmail.com' ? 'super_admin' : 'member';
            const newProfile: UserProfile = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || 'Anggota ABB',
              photoURL: firebaseUser.photoURL || undefined,
              role: defaultRole,
              status: 'active',
              createdAt: now,
              updatedAt: now,
              lastLoginAt: now,
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
        } catch (err) {
          console.warn('⚠️ Gagal memuat profil user Firestore:', err);
        }
      } else {
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

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Error Logout:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured: configured,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
