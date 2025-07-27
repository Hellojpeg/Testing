
'use client';

import type { ReactNode, Dispatch, SetStateAction } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  type User, 
  type AuthError,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type Auth
} from 'firebase/auth';
import { app } from '@/lib/firebase'; // Import the initialized app
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation'; // Use next/navigation for App Router

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  setError: Dispatch<SetStateAction<string | null>>;
  signUp: (email: string, pass: string) => Promise<User | null>;
  signIn: (email: string, pass: string) => Promise<User | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Get the Auth instance directly from the initialized app
const auth: Auth = getAuth(app);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signUp = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      toast({ title: 'Signup Successful!', description: 'Welcome!' });
      router.push('/'); // Redirect to home after signup
      return userCredential.user;
    } catch (e) {
      const authError = e as AuthError;
      console.error("Signup error:", authError);
      setError(authError.message);
      toast({ title: 'Signup Error', description: authError.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, pass: string): Promise<User | null> => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      setUser(userCredential.user);
      toast({ title: 'Login Successful!', description: 'Welcome back!' });
      router.push('/'); // Redirect to home after login
      return userCredential.user;
    } catch (e) {
      const authError = e as AuthError;
      console.error("Signin error:", authError);
      setError(authError.message);
      toast({ title: 'Login Error', description: authError.message, variant: 'destructive' });
      return null;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setError(null);
    try {
      await firebaseSignOut(auth);
      setUser(null);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login'); // Redirect to login after logout
    } catch (e) {
      const authError = e as AuthError;
      console.error("Signout error:", authError);
      setError(authError.message);
      toast({ title: 'Logout Error', description: authError.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    user,
    loading,
    error,
    setError,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
