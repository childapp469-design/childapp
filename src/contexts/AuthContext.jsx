import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pinUnlocked, setPinUnlocked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      // Demo rejim: Supabase konfiqurasiya olunmayıbsa lokal admin
      setUser({ id: 'local-admin', email: 'admin@local.dev' });
      setPinUnlocked(true);
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setPinUnlocked(!!session?.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session) setPinUnlocked(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    if (!isSupabaseConfigured()) {
      setUser({ id: 'local-admin', email });
      setPinUnlocked(true);
      return { user: { email } };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setPinUnlocked(true);
    return data;
  }, []);

  const loginWithPin = useCallback(async (pin) => {
    const storedPin = localStorage.getItem('app_pin') || '1234';
    if (pin === storedPin) {
      setPinUnlocked(true);
      return true;
    }
    throw new Error('Yanlış PIN kod');
  }, []);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setPinUnlocked(false);
  }, []);

  const setAppPin = useCallback((pin) => {
    localStorage.setItem('app_pin', pin);
  }, []);

  const isAuthenticated = user && pinUnlocked;

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated, login, loginWithPin, logout, setAppPin, pinUnlocked }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider daxilində istifadə edilməlidir');
  return ctx;
}
