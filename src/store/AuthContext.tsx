import type { Session, User } from '@supabase/supabase-js';
import * as Linking from 'expo-linking';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  getCurrentUser,
  maybeHandleAuthCallback,
  sendMagicLink,
  signOut as signOutFromService,
} from '../services/authService';
import { env } from '../config/env';
import { supabase } from '../lib/supabase';
import { useLanguage } from './LanguageContext';

type AuthContextValue = {
  user: User | null;
  session: Session | null;
  isInitializing: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  sendMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (env.useMockData) {
      setSession(null);
      setUser(null);
      setAuthError(null);
      setIsInitializing(false);
      return;
    }

    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const initialUrl = await Linking.getInitialURL();
        await maybeHandleAuthCallback(initialUrl);

        const {
          data: { session: currentSession },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        const currentUser = await getCurrentUser();

        if (!isMounted) {
          return;
        }

        setSession(currentSession);
        setUser(currentUser);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setAuthError(toErrorMessage(error, t('common.error')));
      } finally {
        if (isMounted) {
          setIsInitializing(false);
        }
      }
    };

    void initializeAuth();

    const authSubscription = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
    });

    const linkingSubscription = Linking.addEventListener('url', ({ url }) => {
      void maybeHandleAuthCallback(url).catch((error) => {
        setAuthError(toErrorMessage(error, t('common.error')));
      });
    });

    return () => {
      isMounted = false;
      authSubscription.data.subscription.unsubscribe();
      linkingSubscription.remove();
    };
  }, [t]);

  const handleSendMagicLink = useCallback(async (email: string) => {
    setAuthError(null);
    await sendMagicLink(email);
  }, []);

  const handleSignOut = useCallback(async () => {
    setAuthError(null);
    await signOutFromService();
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      isInitializing,
      isAuthenticated: Boolean(user),
      authError,
      sendMagicLink: handleSendMagicLink,
      signOut: handleSignOut,
      clearAuthError,
    }),
    [user, session, isInitializing, authError, handleSendMagicLink, handleSignOut, clearAuthError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
