'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, onSnapshot, serverTimestamp, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentSessionId: string | null;
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'currentSessionId';

const getIpAddress = async (): Promise<string> => {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        if (!response.ok) {
            throw new Error('Failed to fetch IP');
        }
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Could not fetch IP address:", error);
        return "N/A";
    }
}

const createSession = async (user: User): Promise<string> => {
    const sessionId = uuidv4();
    const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
    const ipAddress = await getIpAddress();
    
    await setDoc(sessionRef, {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        ipAddress: ipAddress,
    });
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    return sessionId;
};

const cleanupSession = async (user: User | null, sessionId: string | null) => {
    if (user && sessionId) {
        try {
            const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
            await deleteDoc(sessionRef);
        } catch (error) {
            console.error("Error deleting session doc:", error);
        }
    }
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
};


export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const router = useRouter();

  const handleSignOut = useCallback(async () => {
    await signOut(auth);
    // onAuthStateChanged will handle state cleanup
  }, []);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (newUser) => {
        setLoading(true);
        setUser(newUser);

        if (newUser) {
            let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
            if (sessionId) {
                // Verify session exists
                const sessionRef = doc(db, `users/${newUser.uid}/sessions`, sessionId);
                const sessionSnap = await getDoc(sessionRef);
                if (!sessionSnap.exists()) {
                    sessionId = null; // Session is invalid
                }
            }
            setCurrentSessionId(sessionId);
        } else {
            setCurrentSessionId(null);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            const protectedRoutes = ['/dashboard'];
            if(protectedRoutes.some(path => window.location.pathname.startsWith(path))) {
                router.push('/login');
            }
        }
        setLoading(false);
    });

    return () => unsubscribeAuth();
  }, [router]);

  useEffect(() => {
    let unsubscribeSession: (() => void) | null = null;
    if (user && currentSessionId) {
        const sessionRef = doc(db, `users/${user.uid}/sessions`, currentSessionId);
        unsubscribeSession = onSnapshot(sessionRef, (doc) => {
            if (!doc.exists()) {
                // Session was terminated remotely
                handleSignOut();
            }
        });
    }
    return () => {
        if (unsubscribeSession) {
            unsubscribeSession();
        }
    };
  }, [user, currentSessionId, handleSignOut]);

  const login = async (email: string, pass: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, pass);
    const newSessionId = await createSession(userCredential.user);
    setCurrentSessionId(newSessionId);
  };
  
  const register = async (email: string, pass: string) => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
     await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp()
     });
     const newSessionId = await createSession(userCredential.user);
     setCurrentSessionId(newSessionId);
  };

  const logout = useCallback(async () => {
    await cleanupSession(user, currentSessionId);
    await handleSignOut();
  }, [user, currentSessionId, handleSignOut]);
  
  const value = {
    user,
    loading,
    currentSessionId,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
