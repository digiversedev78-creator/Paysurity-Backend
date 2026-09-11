'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
interface JwtPayload {
  exp?: number;
}

function jwtDecode<T>(token: string): T {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(jsonPayload);
}

interface User extends JwtPayload {
  id: string;
  email: string;
  tenantId: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => void;
  setToken: (token: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const setToken = useCallback((newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('jwt_token', newToken);
      document.cookie = `jwt_token=${newToken}; path=/; max-age=86400; secure; samesite=strict`;
      try {
        const decodedUser = jwtDecode<User>(newToken);
        setUser(decodedUser);
      } catch (e) {
        console.error('Failed to decode token:', e);
      }
    } else {
      localStorage.removeItem('jwt_token');
      document.cookie = 'jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure; samesite=strict';
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          console.warn('Token expired. Logging out.');
          setToken(null);
        } else if (decoded.id && decoded.email && decoded.tenantId) {
          setUser(decoded);
          setTokenState(storedToken);
        } else {
          console.warn('Invalid token structure. Logging out.');
          setToken(null);
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, [setToken]);

  const logout = useCallback(() => {
    setToken(null);
    setError(null);
    router.push('/login');
  }, [router, setToken]);

  const login = useCallback(async (email: string, password: string, tenantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, tenantId }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid credentials. Please check your email, password, and tenant ID.');
          logout();
        } else if (response.status >= 400 && response.status < 500) {
          const errorData = await response.json();
          setError(errorData.message || 'Login failed. Please try again.');
        } else {
          setError('Server error. Please try again later.');
        }
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.token) {
        setToken(data.token);
      } else {
        setError('Login successful, but no authentication token received.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error or server unavailable.');
    } finally {
      setIsLoading(false);
    }
  }, [logout, setToken]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error, setToken }}>
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
