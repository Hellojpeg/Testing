
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  type User,
  type Auth
} from 'firebase/auth';
import { getFirebaseAuth } from '@/lib/firebase'; // Import the function to get auth

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, pass: string) => Promise<any>;
  login: (email: string, pass: string) => Promise<any>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signup: async () => {},
  login: async () => {},
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState<Auth | null>(null);

  useEffect(() => {
    // Initialize auth only on the client side
    const authInstance = getFirebaseAuth();
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
  
  const signup = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    return createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const login = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = () => {
    if (!auth) return Promise.reject(new Error("Firebase Auth not initialized"));
    return signOut(auth);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
