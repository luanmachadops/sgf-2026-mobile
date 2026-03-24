import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database.types';

type DriverProfile = Tables<'drivers'> & {
  departments?: Tables<'departments'> | null;
};

interface AuthContextValue {
  driver: DriverProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (cpf: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function normalizeCpf(value: string) {
  return value.replace(/\D/g, '');
}

function driverEmailFromCpf(cpf: string) {
  return `driver-${normalizeCpf(cpf)}@internal.sgf2026.local`;
}

async function fetchDriverProfile(userId: string): Promise<DriverProfile | null> {
  const { data, error } = await supabase
    .from('drivers')
    .select('*, departments(*)')
    .eq('user_id', userId)
    .single();

  if (error) {
    return null;
  }

  return data as DriverProfile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncSession = useCallback(async () => {
    const {
      data: { session }
    } = await supabase.auth.getSession();

    if (!session) {
      setDriver(null);
      setToken(null);
      setIsLoading(false);
      return;
    }

    const profile = await fetchDriverProfile(session.user.id);
    setDriver(profile);
    setToken(session.access_token);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void syncSession();

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setDriver(null);
        setToken(null);
        setIsLoading(false);
        return;
      }

      setToken(session.access_token);
      void fetchDriverProfile(session.user.id).then((profile) => {
        setDriver(profile);
        setIsLoading(false);
      });
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncSession]);

  const login = useCallback(async (cpf: string, password: string) => {
    const email = driverEmailFromCpf(cpf);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw error;
    }

    const profile = await fetchDriverProfile(data.user.id);

    if (!profile) {
      await supabase.auth.signOut();
      throw new Error('Conta autenticada, mas sem vinculo com motorista.');
    }

    setDriver(profile);
    setToken(data.session.access_token);
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setDriver(null);
    setToken(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      driver,
      token,
      isLoading,
      login,
      logout
    }),
    [driver, token, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
}
