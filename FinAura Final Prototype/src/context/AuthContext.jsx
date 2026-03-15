import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const ref  = doc(db, 'users', firebaseUser.uid);
        const snap = await getDoc(ref).catch(() => null);
        setProfile(snap?.exists() ? snap.data() : null);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const createUserDoc = async (firebaseUser, extra = {}) => {
    const ref = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(ref).catch(() => null);
    if (!snap?.exists()) {
      await setDoc(ref, {
        uid:       firebaseUser.uid,
        email:     firebaseUser.email,
        name:      firebaseUser.displayName || extra.name || 'Investor',
        photoURL:  firebaseUser.photoURL || null,
        xp:        0,
        level:     1,
        riskProfile: 'Moderate',
        createdAt: serverTimestamp(),
        ...extra,
      });
    }
  };

  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    await createUserDoc(result.user);
    return result.user;
  };

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const registerWithEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(result.user, { displayName: name });
    await createUserDoc(result.user, { name });
    return result.user;
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, profile, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
