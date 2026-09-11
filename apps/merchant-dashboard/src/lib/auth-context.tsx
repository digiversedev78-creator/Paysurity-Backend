'use client';

import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; // Next.js navigation (NOT react-router-dom)
import { jwtDecode, JwtPayload } from 'jwt-decode';

// Define the structure of the user object stored in context.
interface User extends JwtPayload {
  id: string;
  email: string;
  tenantId: string;
}

// Define the shape of our AuthContext
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string, tenantId: string) => Promise<void>;
  logout: () => void;
}

// Create the Auth Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter(); // Next.js router replaces react-router-dom's useNavigate

  // On mount, check for an existing token in localStorage and validate it
  useEffect(() => {
    const storedToken = localStorage.getItem('jwt_token');
    if (storedToken) {
      try {
        const decoded = jwtDecode<User>(storedToken);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          console.warn('Token expired. Logging out.');
          localStorage.removeItem('jwt_token');
          setUser(null);
          setToken(null);
        } else if (decoded.id && decoded.email && decoded.tenantId) {
          setUser(decoded);
          setToken(storedToken);
        } else {
          console.warn('Invalid token structure. Logging out.');
          localStorage.removeItem('jwt_token');
          setUser(null);
          setToken(null);
        }
      } catch (e) {
        console.error('Failed to decode token:', e);
        localStorage.removeItem('jwt_token');
        setUser(null);
        setToken(null);
      }
    }
    setIsLoading(false);
  }, []);

  // Logout (defined before login since login calls logout)
  const logout = useCallback(() => {
    localStorage.removeItem('jwt_token');
    setUser(null);
    setToken(null);
    setError(null);
    router.push('/login');
  }, [router]);

  // Login function
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
        localStorage.setItem('jwt_token', data.token);
        const decodedUser = jwtDecode<User>(data.token);
        setUser(decodedUser);
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
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to consume the Auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}