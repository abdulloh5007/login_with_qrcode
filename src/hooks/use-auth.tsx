'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc, deleteDoc, getDoc, onSnapshot, serverTimestamp } from 'firebase/firestore';
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
        // The onAuthStateChanged listener will handle cleaning up session state
        // and redirecting, so we just need to sign out here.
        await signOut(auth);
  }, []);
  
  useEffect(() => {
    let sessionListenerUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, async (newUser) => {
      // If listener exists, unsubscribe
      if (sessionListenerUnsubscribe) {
        sessionListenerUnsubscribe();
        sessionListenerUnsubscribe = null;
      }
      
      setUser(newUser);

      if (newUser) {
        let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        
        // If there's no session ID or the current user changed, create a new session
        if (!sessionId || auth.currentUser?.uid !== user?.uid) {
            sessionId = await createSession(newUser);
        } else {
            const sessionRef = doc(db, `users/${newUser.uid}/sessions`, sessionId);
            const sessionSnap = await getDoc(sessionRef);
            if (!sessionSnap.exists()) {
                sessionId = await createSession(newUser);
            }
        }
        
        setCurrentSessionId(sessionId);

        // Listen for remote session termination
        const sessionRef = doc(db, `users/${newUser.uid}/sessions`, sessionId);
        sessionListenerUnsubscribe = onSnapshot(sessionRef, (doc) => {
            if (!doc.exists()) {
                console.log('Session terminated remotely. Signing out.');
                if (sessionListenerUnsubscribe) sessionListenerUnsubscribe();
                signOut(auth); // This will trigger onAuthStateChanged to clean up
            }
        });

      } else {
        // User is signed out, clean up session
        const oldSessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (user && oldSessionId) {
            await deleteDoc(doc(db, `users/${user.uid}/sessions`, oldSessionId)).catch(e => console.error("Could not clean up session on logout", e));
        }
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        setCurrentSessionId(null);
        if (router) {
            // Check if current page is protected before pushing to login
            const protectedRoutes = ['/dashboard'];
            if(protectedRoutes.some(path => window.location.pathname.startsWith(path))) {
                router.push('/login');
            }
        }
      }
      setLoading(false);
      // Previous user state for comparison
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, (error) => {
        console.error("Auth state error:", error);
        setLoading(false);
    });

    return () => {
        authUnsubscribe();
        if (sessionListenerUnsubscribe) {
            sessionListenerUnsubscribe();
        }
    };
  }, [router]);

  const login = async (email: string, pass: string) => {
    // onAuthStateChanged will handle session creation, so we just sign in.
    return await signInWithEmailAndPassword(auth, email, pass);
  };
  
  const register = async (email: string, pass: string) => {
    // onAuthStateChanged will handle session creation.
    return await createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = async () => {
    await deleteSession(user, currentSessionId);
    await handleSignOut();
  };

  const loginWithToken = async (uid: string, loginToken: string) => {
      // This is a simplified custom token flow. In a real production app,
      // you would generate a custom token on a secure server and use signInWithCustomToken.
      // For this demo, we'll just set the user based on the UID from the authorized request.
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (auth.currentUser?.uid !== uid) {
        await handleSignOut();
      }
      
      const tempUser = { uid, email: userDoc.data()?.email || 'QR User' } as User;
      const sessionId = await createSession(tempUser);
      
      const loginRequestRef = doc(db, 'loginRequests', loginToken);
      await setDoc(loginRequestRef, { sessionId: sessionId }, { merge: true });
      
      // Manually set user and session. This is a hack for the demo.
      // A real signInWithCustomToken would trigger onAuthStateChanged.
      setUser(tempUser);
      setCurrentSessionId(sessionId);
      setLoading(false);
      router.push('/dashboard');
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

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
