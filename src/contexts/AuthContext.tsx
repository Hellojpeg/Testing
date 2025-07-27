
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  type Auth,
  type User 
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Import the initialized app

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
    // Get the Auth instance only on the client-side
    // This ensures that the app is fully initialized.
    const authInstance = getAuth(app);
    setAuth(authInstance);

    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);
  
  const signup = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Auth not initialized"));
    return createUserWithEmailAndPassword(auth, email, pass);
  };
  
  const login = (email: string, pass: string) => {
    if (!auth) return Promise.reject(new Error("Auth not initialized"));
    return signInWithEmailAndPassword(auth, email, pass);
  };
  
  const logout = () => {
    if (!auth) return Promise.reject(new Error("Auth not initialized"));
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
