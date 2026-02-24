'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  playaName?: string;
  role: 'ADMIN' | 'MANAGER' | 'MEMBER';
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (token: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshSession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// Token refresh interval: refresh 5 minutes before expiry (tokens last 24h)
const REFRESH_INTERVAL_MS = 23 * 60 * 60 * 1000; // 23 hours

// Session cookie name (used by Next.js middleware for server-side route protection)
const SESSION_COOKIE = 'ca-auth-session';

/** Set or clear the lightweight session cookie used by middleware */
function setSessionCookie(active: boolean) {
  if (active) {
    // Cookie lasts 7 days (matches refresh token expiry)
    document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  } else {
    document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  }
}

interface AuthProviderProps {
  children: ReactNode;
}

/** Helper: call a tRPC mutation endpoint */
async function trpcMutate(path: string, input: unknown, token?: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/trpc/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(input),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const message =
      data.error?.json?.message ||
      data.error?.message ||
      'Request failed';
    throw new Error(message);
  }

  return data.result?.data;
}

/** Helper: call a tRPC query endpoint */
async function trpcQuery(path: string, token?: string | null) {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/trpc/${path}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) throw new Error('Request failed');

  const data = await res.json();
  return data.result?.data;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRefreshingRef = useRef(false);

  const isAuthenticated = user !== null;

  // Clear refresh timer on unmount
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    };
  }, []);

  /** Attempt to refresh the access token using the stored refresh token */
  const refreshSession = useCallback(async (): Promise<boolean> => {
    if (isRefreshingRef.current) return false;
    isRefreshingRef.current = true;

    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) return false;

      const result = await trpcMutate('auth.refresh', { refreshToken });

      if (result?.accessToken) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        if (result.user) {
          setUser(result.user);
        }
        setSessionCookie(true);
        return true;
      }
      return false;
    } catch {
      // Refresh failed, tokens are invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setSessionCookie(false);
      setUser(null);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  /** Schedule the next automatic token refresh */
  const scheduleRefresh = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);

    refreshTimerRef.current = setTimeout(async () => {
      const success = await refreshSession();
      if (success) {
        scheduleRefresh(); // schedule again after successful refresh
      }
    }, REFRESH_INTERVAL_MS);
  }, [refreshSession]);

  // Validate token and load user profile on mount
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        // Try refresh token if access token is missing
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshed = await refreshSession();
          if (refreshed) {
            scheduleRefresh();
          }
        }
        setIsLoading(false);
        return;
      }

      try {
        const profile = await trpcQuery('auth.getProfile', token);

        if (profile) {
          setUser(profile);
          setSessionCookie(true);
          scheduleRefresh();
        } else {
          throw new Error('Invalid profile response');
        }
      } catch {
        // Access token invalid -- try refresh
        const refreshed = await refreshSession();
        if (refreshed) {
          try {
            const newToken = localStorage.getItem('accessToken');
            const profile = await trpcQuery('auth.getProfile', newToken);
            if (profile) {
              setUser(profile);
              setSessionCookie(true);
              scheduleRefresh();
            }
          } catch {
            // Still failed, clear everything
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setSessionCookie(false);
            setUser(null);
          }
        } else {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          setSessionCookie(false);
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trpcMutate('auth.login', { email, password });

      if (result?.accessToken && result?.user) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        setUser(result.user);
        setError(null);
        setSessionCookie(true);
        scheduleRefresh();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleRefresh]);

  /** Accept an invite and set password (auto-login) */
  const register = useCallback(async (inviteToken: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await trpcMutate('auth.acceptInvite', { inviteToken, password });

      if (result?.accessToken && result?.user) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        setUser(result.user);
        setError(null);
        setSessionCookie(true);
        scheduleRefresh();
      } else {
        throw new Error('Unexpected response from server');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed. Please try again.';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [scheduleRefresh]);

  const logout = useCallback(() => {
    if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setSessionCookie(false);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        error,
        login,
        register,
        logout,
        clearError,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
