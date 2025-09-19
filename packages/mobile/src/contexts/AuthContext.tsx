import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { trpc } from '../lib/trpc';

interface User {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AuthContextType {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, totpToken?: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mutations
  const loginMutation = trpc.auth.login.useMutation();
  const registerMutation = trpc.auth.register.useMutation();
  const logoutMutation = trpc.auth.logout.useMutation();
  const refreshTokenMutation = trpc.auth.refreshToken.useMutation();

  // Queries
  const profileQuery = trpc.auth.getProfile.useQuery(undefined, {
    enabled: !!tokens?.accessToken,
    retry: false,
  });

  const storeTokens = async (authTokens: AuthTokens) => {
    try {
      await SecureStore.setItemAsync('accessToken', authTokens.accessToken);
      await SecureStore.setItemAsync('refreshToken', authTokens.refreshToken);
      await SecureStore.setItemAsync('tokenExpiry', authTokens.expiresAt.toISOString());
      setTokens(authTokens);
    } catch (error) {
      console.error('Error storing tokens:', error);
    }
  };

  const clearTokens = async () => {
    try {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      await SecureStore.deleteItemAsync('tokenExpiry');
      setTokens(null);
      setUser(null);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  const loadStoredTokens = async () => {
    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      const refreshToken = await SecureStore.getItemAsync('refreshToken');
      const tokenExpiry = await SecureStore.getItemAsync('tokenExpiry');

      if (accessToken && refreshToken && tokenExpiry) {
        const expiresAt = new Date(tokenExpiry);
        
        // Check if token is expired
        if (expiresAt > new Date()) {
          setTokens({
            accessToken,
            refreshToken,
            expiresAt,
          });
          return true;
        } else {
          // Try to refresh token
          return await refreshTokenIfNeeded(refreshToken);
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error loading stored tokens:', error);
      return false;
    }
  };

  const refreshTokenIfNeeded = async (refreshToken: string): Promise<boolean> => {
    try {
      const result = await refreshTokenMutation.mutateAsync({ refreshToken });
      
      const newTokens: AuthTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: new Date(result.expiresAt),
      };

      await storeTokens(newTokens);
      setUser(result.user);
      
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await clearTokens();
      return false;
    }
  };

  const login = async (email: string, password: string, totpToken?: string) => {
    try {
      const result = await loginMutation.mutateAsync({
        email,
        password,
        totpToken,
        rememberMe: true, // Mobile apps typically stay logged in
      });

      const authTokens: AuthTokens = {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresAt: new Date(result.expiresAt),
      };

      await storeTokens(authTokens);
      setUser(result.user);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const result = await registerMutation.mutateAsync({
        name,
        email,
        password,
      });

      // Registration successful, but user needs to verify email
      // Don't set tokens yet, wait for email verification
      return result;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await logoutMutation.mutateAsync({ refreshToken: tokens.refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearTokens();
    }
  };

  const refreshAuth = async () => {
    if (tokens?.refreshToken) {
      await refreshTokenIfNeeded(tokens.refreshToken);
    }
  };

  // Initialize auth state on app start
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const hasValidTokens = await loadStoredTokens();
        
        if (!hasValidTokens) {
          await clearTokens();
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        await clearTokens();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Update user when profile query succeeds
  useEffect(() => {
    if (profileQuery.data?.user) {
      setUser(profileQuery.data.user);
    }
  }, [profileQuery.data]);

  // Auto-refresh token when it's close to expiry
  useEffect(() => {
    if (!tokens?.expiresAt) return;

    const timeUntilExpiry = tokens.expiresAt.getTime() - Date.now();
    const refreshTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0); // Refresh 5 minutes before expiry

    const timer = setTimeout(async () => {
      if (tokens?.refreshToken) {
        await refreshTokenIfNeeded(tokens.refreshToken);
      }
    }, refreshTime);

    return () => clearTimeout(timer);
  }, [tokens]);

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated: !!user && !!tokens,
    login,
    register,
    logout,
    refreshAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};