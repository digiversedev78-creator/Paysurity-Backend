'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  token: null,
  setToken: () => {},
  logout: () => {},
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check various keys for backwards compat
    const storedToken =
      localStorage.getItem('paysurity_auth_token') ||
      localStorage.getItem('token') ||
      localStorage.getItem('authToken') ||
      localStorage.getItem('paysurity_merchant_auth_token');
      
    if (storedToken) {
      setTokenState(storedToken);
    }
    setIsLoading(false);
  }, []);

  const setToken = (newToken: string | null) => {
    if (newToken) {
      localStorage.setItem('paysurity_auth_token', newToken);
      setTokenState(newToken);
    } else {
      localStorage.removeItem('paysurity_auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('paysurity_merchant_auth_token');
      setTokenState(null);
    }
  };

  const logout = () => {
    setToken(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ token, setToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
