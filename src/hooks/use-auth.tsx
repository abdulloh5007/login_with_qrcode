'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentSessionId: string | null;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
  loginWithToken: (uid: string, loginToken: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'currentSessionId';

const createSession = async (user: User) => {
    const sessionId = uuidv4();
    const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
    await setDoc(sessionRef, {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
    });
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
};

const deleteSession = async (user: User | null, sessionId: string | null) => {
    if (user && sessionId) {
        const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
        await deleteDoc(sessionRef);
    }
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (sessionId) {
            const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
            const sessionSnap = await getDoc(sessionRef);
            if (!sessionSnap.exists()) {
                sessionId = await createSession(user);
            }
        } else {
             sessionId = await createSession(user);
        }
        setCurrentSessionId(sessionId);
      } else {
        setCurrentSessionId(null);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const sessionId = await createSession(userCredential.user);
    setCurrentSessionId(sessionId);
    return userCredential;
  };
  
  const register = async (email: string, pass: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    const sessionId = await createSession(userCredential.user);
    setCurrentSessionId(sessionId);
    return userCredential;
  };
  
  const logout = async () => {
    await deleteSession(user, currentSessionId);
    await signOut(auth);
    router.push('/login');
  };

  const loginWithToken = async (uid: string, loginToken: string) => {
      // This is a simplified custom token flow. In a real production app,
      // you would generate a custom token on a secure server and use signInWithCustomToken.
      // For this demo, we'll just set the user based on the UID from the authorized request.
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      // We are "faking" a login here by setting the user state.
      // This is NOT secure for a real app.
      if (auth.currentUser?.uid !== uid) {
        await signOut(auth); // Sign out any existing user
      }
      
      // Since we can't create a real session without credentials, we'll manually
      // create a session document and then push to dashboard. The onAuthStateChanged
      // listener will then pick up the "logged in" state, but it will be based on a trick.
      
      const tempUser = { uid, email: userDoc.data()?.email || 'QR User' } as User;
      const sessionId = await createSession(tempUser);
      
      const loginRequestRef = doc(db, 'loginRequests', loginToken);
      await setDoc(loginRequestRef, { sessionId: sessionId }, { merge: true });

      // We just set the local state.
      setUser(tempUser);
      setCurrentSessionId(sessionId);
      setLoading(false);
  };


  const value = {
    user,
    loading,
    currentSessionId,
    login,
    register,
    logout,
    loginWithToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
