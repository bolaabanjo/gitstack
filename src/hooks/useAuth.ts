import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export const useAuth: any = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      setUser(data?.session?.user ?? null);
      setLoading(false);
    };

    init();

    const authListener = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      authListener?.data?.subscription?.unsubscribe?.();
    };
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    const user = data?.user ?? null;
    setUser(user);
    setLoading(false);
    return { user, error };
  };

  const signUpWithEmail = async (email: string, password: string) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({ email, password });
    const user = data?.user ?? null;
    setUser(user);
    setLoading(false);
    return { user, error };
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setLoading(false);
  };

  // Backwards-compatible aliases expected by tests
  const login = signInWithEmail;
  const signup = signUpWithEmail;
  const resetPassword = async (email: string) => {
    // Supabase uses resetPasswordForEmail on older clients; emulate behavior
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error };
  };

  return {
    user,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signOut,
    // aliases
    login,
    signup,
    resetPassword,
  };
};

export default useAuth;