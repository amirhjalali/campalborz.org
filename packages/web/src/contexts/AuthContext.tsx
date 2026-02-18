'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

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
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = user !== null;

  // Validate token and load user profile on mount
  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('accessToken');

      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/trpc/auth.getProfile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token validation failed');
        }

        const data = await response.json();
        const profile = data.result?.data;

        if (profile) {
          setUser(profile);
        } else {
          throw new Error('Invalid profile response');
        }
      } catch {
        // Token invalid or API unavailable - clear tokens silently
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    validateSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/trpc/auth.login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        const message = data.error?.json?.message
          || data.error?.message
          || 'Invalid email or password';
        throw new Error(message);
      }

      const result = data.result?.data;

      if (result?.accessToken && result?.user) {
        localStorage.setItem('accessToken', result.accessToken);
        if (result.refreshToken) {
          localStorage.setItem('refreshToken', result.refreshToken);
        }
        setUser(result.user);
        setError(null);
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
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
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
        logout,
        clearError,
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
