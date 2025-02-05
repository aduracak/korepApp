import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { AuthState, UserProfile } from '../types/auth';

interface SignUpData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'professor' | 'student';
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoading: true,
    user: null,
    error: null,
  });

  useEffect(() => {
    // Provjeri trenutnu sesiju
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    });

    // Slušaj promjene auth stanja
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setState(prev => ({ ...prev, user: null, isLoading: false }));
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: data,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error('Error fetching profile:', error);
      setState(prev => ({
        ...prev,
        error: 'Greška pri dohvatanju profila',
        isLoading: false,
      }));
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Neispravni podaci za prijavu',
        isLoading: false,
      }));
      throw error;
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // 1. Kreiraj auth korisnika
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (signUpError) throw signUpError;

      // 2. Kreiraj profil
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user?.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          role: data.role,
        },
      ]);

      if (profileError) throw profileError;

      setState(prev => ({ ...prev, error: null }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Greška pri registraciji',
        isLoading: false,
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setState(prev => ({
        ...prev,
        user: null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Greška pri odjavi',
        isLoading: false,
      }));
      throw error;
    }
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', state.user?.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        user: prev.user ? { ...prev.user, ...data } : null,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: 'Greška pri ažuriranju profila',
        isLoading: false,
      }));
      throw error;
    }
  };

  const value = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
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