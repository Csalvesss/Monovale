import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import type { UserProfile } from '../types';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  allUsers: UserProfile[];         // all registered players (for lobby)
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, pawnId: string) => Promise<void>;
  logout: () => Promise<void>;
  updatePawn: (pawnId: string) => Promise<void>;
  refreshAllUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Load all registered users (for lobby account linking)
  async function refreshAllUsers() {
    const snap = await getDocs(collection(db, 'users'));
    const users = snap.docs.map(d => d.data() as UserProfile);
    setAllUsers(users);
  }

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const profileSnap = await getDoc(doc(db, 'users', fbUser.uid));
          if (profileSnap.exists()) {
            setProfile(profileSnap.data() as UserProfile);
          }
          await refreshAllUsers();
        } catch (e) {
          console.warn('Firestore error (check security rules):', e);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will handle profile load
  }

  async function register(email: string, password: string, displayName: string, pawnId: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });

    const newProfile: UserProfile = {
      uid: cred.user.uid,
      displayName,
      email,
      pawnId,
      stats: { gamesPlayed: 0, gamesWon: 0, totalNetWorth: 0, bankruptcies: 0 },
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    setProfile(newProfile);
    await refreshAllUsers();
  }

  async function logout() {
    await signOut(auth);
    setProfile(null);
    setAllUsers([]);
  }

  async function updatePawn(pawnId: string) {
    if (!user) return;
    await updateDoc(doc(db, 'users', user.uid), { pawnId });
    setProfile(prev => prev ? { ...prev, pawnId } : prev);
  }

  return (
    <AuthContext.Provider value={{ user, profile, allUsers, loading, login, register, logout, updatePawn, refreshAllUsers }}>
      {children}
    </AuthContext.Provider>
  );
}
