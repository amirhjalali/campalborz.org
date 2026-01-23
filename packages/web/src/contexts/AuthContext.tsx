'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';

// Demo mode - enables local authentication when API is unavailable
const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || true;

interface AuthProviderProps {
  children: ReactNode;
}

// Helper to generate mock tokens
const generateMockToken = () => `demo_token_${Date.now()}_${Math.random().toString(36).substring(7)}`;

// Default admin account for demo mode
const DEMO_ADMIN: User = {
  id: 'admin_001',
  email: 'admin@campalborz.org',
  name: 'Camp Admin',
  role: 'ADMIN',
  emailVerified: true,
};
const DEMO_ADMIN_PASSWORD = 'admin123';

function seedDemoAdmin() {
  const storedUsers: User[] = JSON.parse(localStorage.getItem('demo_users') || '[]');
  if (!storedUsers.find((u) => u.email === DEMO_ADMIN.email)) {
    storedUsers.push(DEMO_ADMIN);
    localStorage.setItem('demo_users', JSON.stringify(storedUsers));
    const passwords = JSON.parse(localStorage.getItem('demo_passwords') || '{}');
    passwords[DEMO_ADMIN.email] = DEMO_ADMIN_PASSWORD;
    localStorage.setItem('demo_passwords', JSON.stringify(passwords));
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    if (DEMO_MODE) seedDemoAdmin();

    const checkAuth = async () => {
      const token = localStorage.getItem('accessToken');
      const userData = localStorage.getItem('user');

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch {
          // Invalid stored data, clear it
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string, rememberMe = false) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try API first
      const response = await fetch(`${API_BASE_URL}/trpc/auth.login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: { email, password, rememberMe },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Login failed');
      }

      const result = data.result?.data;

      if (result?.success) {
        localStorage.setItem('accessToken', result.accessToken);
        localStorage.setItem('refreshToken', result.refreshToken);
        localStorage.setItem('user', JSON.stringify(result.user));

        setState({
          user: result.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error(result?.message || 'Login failed');
      }
    } catch (error) {
      // If API fails and demo mode is enabled, use mock auth
      if (DEMO_MODE) {
        console.log('API unavailable, using demo mode authentication');

        // Get stored demo users
        const storedUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        const user = storedUsers.find((u: User) => u.email === email);

        if (user) {
          // Check password (stored in a separate key for demo)
          const passwords = JSON.parse(localStorage.getItem('demo_passwords') || '{}');
          if (passwords[email] === password) {
            const accessToken = generateMockToken();
            const refreshToken = generateMockToken();

            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));

            setState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
            return;
          }
        }

        // No matching user or wrong password
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: 'Invalid email or password. Please register first.',
        }));
        throw new Error('Invalid email or password');
      }

      const message = error instanceof Error ? error.message : 'Login failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Try API first
      const response = await fetch(`${API_BASE_URL}/trpc/auth.register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          json: { email, password, name },
        }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error?.message || 'Registration failed');
      }

      const result = data.result?.data;

      if (result?.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
      } else {
        throw new Error(result?.message || 'Registration failed');
      }
    } catch (error) {
      // If API fails and demo mode is enabled, use mock registration
      if (DEMO_MODE) {
        console.log('API unavailable, using demo mode registration');

        // Check if email already exists
        const storedUsers = JSON.parse(localStorage.getItem('demo_users') || '[]');
        if (storedUsers.find((u: User) => u.email === email)) {
          setState(prev => ({
            ...prev,
            isLoading: false,
            error: 'An account with this email already exists.',
          }));
          throw new Error('Email already registered');
        }

        // Create new demo user
        const newUser: User = {
          id: `demo_${Date.now()}`,
          email,
          name,
          role: 'MEMBER',
          emailVerified: true, // Auto-verify in demo mode
        };

        storedUsers.push(newUser);
        localStorage.setItem('demo_users', JSON.stringify(storedUsers));

        // Store password
        const passwords = JSON.parse(localStorage.getItem('demo_passwords') || '{}');
        passwords[email] = password;
        localStorage.setItem('demo_passwords', JSON.stringify(passwords));

        setState(prev => ({
          ...prev,
          isLoading: false,
          error: null,
        }));
        return;
      }

      const message = error instanceof Error ? error.message : 'Registration failed';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken');

    try {
      if (refreshToken && !refreshToken.startsWith('demo_')) {
        await fetch(`${API_BASE_URL}/trpc/auth.logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            json: { refreshToken },
          }),
        });
      }
    } catch {
      // Ignore logout API errors
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
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
