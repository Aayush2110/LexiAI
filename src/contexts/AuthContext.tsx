import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  auth_provider: 'email' | 'google';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('lexi_token');
      const storedUser = localStorage.getItem('lexi_user');

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // Verify token is still valid by fetching user info
          const userData = await AuthAPI.me();
          setUser(userData);
          localStorage.setItem('lexi_user', JSON.stringify(userData));
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('lexi_token');
          localStorage.removeItem('lexi_user');
          setToken(null);
          setUser(null);
        }
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const response = await AuthAPI.login(email, password, rememberMe);
      
      setToken(response.access_token);
      setUser(response.user);
      
      localStorage.setItem('lexi_token', response.access_token);
      localStorage.setItem('lexi_user', JSON.stringify(response.user));
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error?.detail || 'Login failed. Please check your credentials.');
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const response = await AuthAPI.signup(name, email, password);
      
      setToken(response.access_token);
      setUser(response.user);
      
      localStorage.setItem('lexi_token', response.access_token);
      localStorage.setItem('lexi_user', JSON.stringify(response.user));
    } catch (error: any) {
      console.error('Signup failed:', error);
      throw new Error(error?.detail || 'Signup failed. Please try again.');
    }
  };

  const googleLogin = async (googleToken: string) => {
    try {
      const response = await AuthAPI.googleAuth(googleToken);
      
      setToken(response.access_token);
      setUser(response.user);
      
      localStorage.setItem('lexi_token', response.access_token);
      localStorage.setItem('lexi_user', JSON.stringify(response.user));
    } catch (error: any) {
      console.error('Google login failed:', error);
      throw new Error(error?.detail || 'Google authentication failed. Please try again.');
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('lexi_token');
    localStorage.removeItem('lexi_user');
    
    // Call logout endpoint for logging purposes
    AuthAPI.logout().catch(console.error);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
