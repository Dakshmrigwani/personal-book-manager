'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, clearStoredTokens, getStoredTokens, setStoredTokens } from './api';
import * as authApi from './auth';
import type { User } from './auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  refreshTokens: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadUser() {
      const { accessToken, refreshToken } = getStoredTokens();
      if (!accessToken || !refreshToken) {
        clearStoredTokens();
        setUser(null);
        setIsLoading(false);
        return;
      }
      try {
        const userData = await apiFetch<User>('/user/profile');
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user profile:', error);
        clearStoredTokens();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await authApi.login({ email, password });
    setStoredTokens(res.tokens.access.token, res.tokens.refresh.token);
    setUser(res.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authApi.register({ name, email, password });
    // User will be redirected to verify OTP, then login to establish active session
    clearStoredTokens();
    setUser(null);
  };

  const logout = async () => {
    const { refreshToken } = getStoredTokens();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    clearStoredTokens();
    setUser(null);
  };

  const forgotPassword = async (email: string) => {
    await authApi.forgotPassword({ email });
  };

  const resetPassword = async (token: string, password: string) => {
    await authApi.resetPassword(token, { password });
  };

  const sendVerificationEmail = async () => {
    await authApi.sendVerificationEmail();
  };

  const verifyEmail = async (token: string) => {
    await authApi.verifyEmail(token);
  };

  const refreshTokens = async () => {
    const { refreshToken } = getStoredTokens();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }
    const newTokens = await authApi.refreshTokens(refreshToken);
    setStoredTokens(newTokens.access.token, newTokens.refresh.token);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        sendVerificationEmail,
        verifyEmail,
        refreshTokens,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User };
