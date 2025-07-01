import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';
import authService from '../services/authService';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  loginWithGoogle: (user: any, token: string) => void;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  updateProfilePictureUrl: (newUrl: string) => void;
  updateCoverImageUrl: (newUrl: string) => void;
  updateUserProfile: (updatedData: Partial<User>) => void;
}

// Define the signup data interface
export interface SignupData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  profileImage?: File;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  loginWithGoogle: () => {},
  signup: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  fieldErrors: {},
  updateProfilePictureUrl: () => {},
  updateCoverImageUrl: () => {},
  updateUserProfile: () => {},
});

// API base URL
import { API_BASE_URL } from '../config/api';

const API_URL = API_BASE_URL;

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Parse user data from API response
const parseUserData = (userData: any): User => {
  return {
    id: userData._id,
    username: userData.username,
    email: userData.email,
    profilePictureUrl: userData.profilePictureUrl || null,
    coverImageUrl: userData.coverImageUrl || null,
    bio: userData.bio || '',
    location: userData.location || '',
    genre: userData.genres?.[0] || '',
    website: userData.website || '',
    socials: {
      soundcloud: userData.socials?.soundcloud || '',
      instagram: userData.socials?.instagram || '',
      twitter: userData.socials?.twitter || '',
      spotify: userData.socials?.spotify || '',
      youtube: userData.socials?.youtube || ''
    },
    isCreator: userData.isCreator || false
  };
};

// Helper functions for token storage
const getStoredToken = (): string | null => {
  // Check localStorage first (for "Remember Me"), then sessionStorage
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

const isRememberedSession = (): boolean => {
  // Returns true if the token is stored in localStorage (remembered session)
  return !!localStorage.getItem('token');
};

const setStoredToken = (token: string, rememberMe: boolean = false) => {
  if (rememberMe) {
    localStorage.setItem('token', token);
    sessionStorage.removeItem('token'); // Remove from session storage if exists
  } else {
    sessionStorage.setItem('token', token);
    localStorage.removeItem('token'); // Remove from localStorage if exists
  }
};

const removeStoredToken = () => {
  localStorage.removeItem('token');
  sessionStorage.removeItem('token');
};

// Provider component that wraps our app and makes auth object available to any child component that calls useAuth().
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!token);

  // Check if user is logged in on page load
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });        if (response.ok) {
          const userData = await response.json();
          setUser(parseUserData(userData));
          setIsAuthenticated(true);
        } else {
          // If token is invalid, clear stored token
          removeStoredToken();
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setError('Error verifying authentication. Please log in again.');
        removeStoredToken();
        setToken(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };    verifyToken();
  }, [token]);
    // Login function
  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle email verification required
        if (response.status === 403 && data.requiresEmailVerification) {
          throw new Error('Please verify your email address before logging in. Check your inbox for a verification link.');
        }
        
        // Handle field-specific validation errors
        if (data.fieldErrors) {
          setFieldErrors(data.fieldErrors);
          setError(data.message || 'Validation failed');
        } else {
          throw new Error(data.message || 'Failed to login');
        }
        return;
      }

      // Save token based on "Remember Me" preference
      setStoredToken(data.token, rememberMe);
      setToken(data.token);

      // Set user data
      setUser(parseUserData(data.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setIsAuthenticated(false);
    }    setLoading(false);
  };
  
  // Signup function
  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      const result = await authService.signup(userData);

      // Check if email verification is required
      if (result.requiresEmailVerification) {
        // Don't auto-login, show success message with email verification requirement
        setError('Registration successful! Please check your email to verify your account before logging in.');
        setIsAuthenticated(false);
        return;
      }

      // Set user data
      setUser(parseUserData(result.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      // Handle field-specific errors
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
        setError(err.message || 'Please fix the errors below');
      } else {
        setError(err.message || 'An error occurred during registration');
      }
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  // Google login function - called when Google authentication succeeds
  const loginWithGoogle = (userData: any, authToken: string) => {
    // Clear any existing errors
    setError(null);
    setFieldErrors({});

    // Save token to localStorage (Google logins are considered "remembered")
    setStoredToken(authToken, true);
    setToken(authToken);

    // Parse and set user data consistently
    setUser(parseUserData(userData));
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = () => {
    removeStoredToken();
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateProfilePictureUrl = (newUrl: string) => {
    console.log('[AuthContext] Attempting to update profilePictureUrl to:', newUrl);
    setUser(prevUser => {
      if (!prevUser) {
        console.log('[AuthContext] Update skipped, prevUser is null');
        return null;
      }
      const updatedUser = { ...prevUser, profilePictureUrl: newUrl };
      console.log('[AuthContext] Updated user object will be:', updatedUser);
      return updatedUser;
    });
  };
  const updateCoverImageUrl = (newUrl: string) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, coverImageUrl: newUrl };
    });
  };

  const updateUserProfile = (updatedData: Partial<User>) => {
    setUser(prevUser => {
      if (!prevUser) return null;
      return { ...prevUser, ...updatedData };
    });
  };  // Context provider value
  const value = {
    user,
    token,
    isAuthenticated,
    login,
    loginWithGoogle,
    signup,
    logout,
    loading,
    error,
    fieldErrors,
    updateProfilePictureUrl,
    updateCoverImageUrl,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};