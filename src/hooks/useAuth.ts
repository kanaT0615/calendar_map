import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthState } from '../types/User';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setAuthState({
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at
        } : null,
        loading: false
      });
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setAuthState({
          user: session?.user ? {
            id: session.user.id,
            email: session.user.email!,
            created_at: session.user.created_at
          } : null,
          loading: false
        });
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user: authState.user,
    loading: authState.loading,
    signUp,
    signIn,
    signOut
  };
};