import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthAPI } from '@/services/api';

export interface User {
  id: string;
  name: string;
  email: string;
  profile_picture?: string;
  auth_provider: 'email' | 'google';
  created_at: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  googleLogin: (googleToken: string) => Promise<void>;
  logout: () => void;
  setAuth: (token: string, user: User) => void;
  updateProfile: (data: { name?: string; organization?: string }) => Promise<void>;
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
      
      // Trigger chat reload by updating user state
      console.log('[AuthContext] User logged in:', response.user.email);
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
      
      // Trigger chat reload by updating user state
      console.log('[AuthContext] User signed up:', response.user.email);
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
      
      // Trigger chat reload by updating user state
      console.log('[AuthContext] User logged in with Google:', response.user.email);
    } catch (error: any) {
      console.error('Google login failed:', error);
      throw new Error(error?.detail || 'Google authentication failed. Please try again.');
    }
  };

  const logout = () => {
    // Clear auth state
    setToken(null);
    setUser(null);
    
    // Clear all storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Call logout endpoint for logging purposes
    AuthAPI.logout().catch(console.error);
    
    // Note: Navigation to /login is handled by the component
    // that calls logout (usually redirects after logout)
  };

  const setAuth = (newToken: string, newUser: User) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('lexi_token', newToken);
    localStorage.setItem('lexi_user', JSON.stringify(newUser));
    
    // Trigger chat reload by updating user state
    console.log('[AuthContext] Auth set for user:', newUser.email);
  };

  const updateProfile = async (data: { name?: string; organization?: string }) => {
    try {
      console.log('[AuthContext] Updating profile with data:', data);
      const updatedUser = await AuthAPI.updateProfile(data);
      console.log('[AuthContext] Profile update response:', updatedUser);
      setUser(updatedUser);
      localStorage.setItem('lexi_user', JSON.stringify(updatedUser));
      console.log('[AuthContext] Profile updated successfully:', updatedUser.email);
    } catch (error: any) {
      console.error('[AuthContext] Profile update failed:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    signup,
    googleLogin,
    logout,
    setAuth,
    updateProfile,
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
