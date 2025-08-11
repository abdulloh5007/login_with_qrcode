'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, onSnapshot, serverTimestamp, collection } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  currentSessionId: string | null;
  login: (email: string, pass: string) => Promise<any>;
  register: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'currentSessionId';

const createSession = async (user: User): Promise<string> => {
    const sessionId = uuidv4();
    const sessionRef = doc(db, `users/${user.uid}/sessions`, sessionId);
    await setDoc(sessionRef, {
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
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
  const activeListeners = useRef<{ auth: (() => void) | null, session: (() => void) | null }>({ auth: null, session: null });


  const handleLogout = useCallback(async () => {
    await cleanupSession(auth.currentUser, sessionStorage.getItem(SESSION_STORAGE_KEY));
    await signOut(auth);
    setCurrentSessionId(null);
    setUser(null);
    router.push('/login');
  }, [router]);
  
  useEffect(() => {
    if (activeListeners.current.auth) activeListeners.current.auth();

    activeListeners.current.auth = onAuthStateChanged(auth, async (newUser) => {
        if (activeListeners.current.session) {
            activeListeners.current.session();
            activeListeners.current.session = null;
        }

        if (newUser) {
            setUser(newUser);
            let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);

            if (sessionId) {
                const sessionRef = doc(db, `users/${newUser.uid}/sessions`, sessionId);
                const sessionSnap = await getDoc(sessionRef);
                if (!sessionSnap.exists()) {
                    // The previous session is invalid or was terminated, create a new one.
                    sessionId = await createSession(newUser);
                }
            } else {
                 // No session exists, create a new one.
                 sessionId = await createSession(newUser);
            }
            
            setCurrentSessionId(sessionId);

            // Listen for remote termination of the current session.
            const sessionRef = doc(db, `users/${newUser.uid}/sessions`, sessionId);
            activeListeners.current.session = onSnapshot(sessionRef, (doc) => {
                if (!doc.exists()) {
                    // The session was deleted from another device.
                    signOut(auth);
                }
            });
        } else {
            // User is signed out.
            setUser(null);
            setCurrentSessionId(null);
            sessionStorage.removeItem(SESSION_STORAGE_KEY);
            const protectedRoutes = ['/dashboard'];
            if(protectedRoutes.some(path => window.location.pathname.startsWith(path))) {
                router.push('/login');
            }
        }
        setLoading(false);
    }, (error) => {
        console.error("Auth state error:", error);
        setLoading(false);
    });

    return () => {
        if (activeListeners.current.auth) activeListeners.current.auth();
        if (activeListeners.current.session) activeListeners.current.session();
    };
  }, [router]);

  const login = async (email: string, pass: string) => {
    return await signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = async (email: string, pass: string) => {
     const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
     await setDoc(doc(db, "users", userCredential.user.uid), {
        email: userCredential.user.email,
        createdAt: serverTimestamp()
     });
     return userCredential;
  };
  
  const value = {
    user,
    loading,
    currentSessionId,
    login,
    register,
    logout: handleLogout
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
