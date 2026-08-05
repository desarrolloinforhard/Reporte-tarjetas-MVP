import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';

import { ApiError } from '@/api/api-error';
import { queryClient } from '@/config/query-client';
import {
  setAccessToken,
  subscribeToUnauthenticated,
} from '@/features/auth/auth-token-store';
import {
  getCurrentSession,
  getCurrentUser,
  getTrustedLocalSession,
  login as loginRequest,
  logoutSession,
  refreshSession,
} from '@/features/auth/session.api';
import type { CurrentSession, CurrentUser } from '@/features/auth/session.contracts';
import {
  getStoredRefreshToken,
  setStoredRefreshToken,
} from '@/features/auth/session.storage';

type SessionContextValue = {
  authenticated: boolean;
  loading: boolean;
  session: CurrentSession | null;
  user: CurrentUser | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: PropsWithChildren) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CurrentSession | null>(null);
  const [user, setUser] = useState<CurrentUser | null>(null);

  async function applyAuthResult(result: Awaited<ReturnType<typeof loginRequest>>) {
    setAccessToken(result.access_token);
    await setStoredRefreshToken(result.refresh_token);
    setSession(result.session);
    setUser(result.user);
  }

  async function clearSession() {
    setAccessToken(null);
    await setStoredRefreshToken(null);
    setSession(null);
    setUser(null);
    queryClient.clear();
  }

  async function applyTrustedLocalSession() {
    const local = await getTrustedLocalSession();
    if (!local) return false;
    setAccessToken(null);
    await setStoredRefreshToken(null);
    setSession(local.session);
    setUser(local.user);
    return true;
  }

  useEffect(() => {
    return subscribeToUnauthenticated(() => {
      void clearSession();
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function restore() {
      try {
        if (Platform.OS === 'web') {
          const [currentSession, currentUser] = await Promise.all([
            getCurrentSession(),
            getCurrentUser(),
          ]);
          if (active) {
            setSession(currentSession);
            setUser(currentUser);
          }
        } else {
          const refreshToken = await getStoredRefreshToken();
          if (refreshToken) {
            try {
              const result = await refreshSession(refreshToken);
              if (active) await applyAuthResult(result);
            } catch {
              if (active && !(await applyTrustedLocalSession())) throw new Error('SESSION_RESTORE_FAILED');
            }
          } else if (active) {
            await applyTrustedLocalSession();
          }
        }
      } catch (error) {
        if (!(error instanceof ApiError) || error.code !== 'UNAUTHENTICATED') {
          console.warn('No se pudo restaurar la sesión de desarrollo.');
        }
        if (active) await clearSession();
      } finally {
        if (active) setLoading(false);
      }
    }

    restore();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!session?.expires_at) return;

    const renewBeforeExpirationMs = 60_000;
    const delay = Math.max(
      30_000,
      new Date(session.expires_at).getTime() - Date.now() - renewBeforeExpirationMs,
    );
    const timer = setTimeout(async () => {
      try {
        const refreshToken = await getStoredRefreshToken();
        await applyAuthResult(await refreshSession(refreshToken));
      } catch {
        await clearSession();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [session?.expires_at]);

  const value = useMemo<SessionContextValue>(
    () => ({
      authenticated: Boolean(session && user),
      loading,
      session,
      user,
      login: async (username, password) => {
        setLoading(true);
        try {
          try {
            if (await applyTrustedLocalSession()) return;
          } catch (error) {
            if (!(error instanceof ApiError) || error.code !== 'UNAUTHENTICATED') {
              console.warn('No se detectÃ³ una sesiÃ³n local confiable; se usarÃ¡ el login normal.');
            }
          }
          await applyAuthResult(await loginRequest(username, password));
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        setLoading(true);
        try {
          const refreshToken = await getStoredRefreshToken();
          await logoutSession(refreshToken);
        } finally {
          await clearSession();
          setLoading(false);
        }
      },
    }),
    [loading, session, user],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession debe utilizarse dentro de SessionProvider.');
  }
  return context;
}
