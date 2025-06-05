import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types/User';

// Define the shape of our auth context
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string[]>;
  updateProfilePictureUrl: (newUrl: string) => void;
  updateCoverImageUrl: (newUrl: string) => void;
}

// Define the signup data interface
export interface SignupData {
  username: string;
  email: string;
  password: string;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  fieldErrors: {},
  updateProfilePictureUrl: () => {},
  updateCoverImageUrl: () => {},
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
    name: userData.username,
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
      spotify: userData.socials?.spotify || ''
    },
    isCreator: userData.isCreator || false
  };
};

// Provider component that wraps our app and makes auth object available to any child component that calls useAuth().
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
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
        });

        if (response.ok) {
          const userData = await response.json();
          setUser(parseUserData(userData));
          setIsAuthenticated(true);
        } else {
          // If token is invalid, clear localStorage
          localStorage.removeItem('token');
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error verifying token:', err);
        setError('Error verifying authentication. Please log in again.');
        localStorage.removeItem('token');
        setToken(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    verifyToken();
  }, [token]);
  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

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
        throw new Error(data.message || 'Failed to login');
      }

      // Save token to localStorage
      localStorage.setItem('token', data.token);
      setToken(data.token);

      // Set user data
      setUser(parseUserData(data.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during login');
      setIsAuthenticated(false);
    }

    setLoading(false);
  };
  // Signup function
  const signup = async (userData: SignupData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register');
      }

      // Check if email verification is required
      if (data.requiresEmailVerification) {
        // Don't auto-login, show success message with email verification requirement
        setError('Registration successful! Please check your email to verify your account before logging in.');
        setIsAuthenticated(false);
        return;
      }

      // Save token to localStorage (only if email verification not required)
      localStorage.setItem('token', data.token);
      setToken(data.token);

      // Set user data
      setUser(parseUserData(data.user));
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
      setIsAuthenticated(false);
    }

    setLoading(false);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
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

  // Context provider value
  const value = {
    user,
    token,
    isAuthenticated,
    login,
    signup,
    logout,
    loading,
    error,
    updateProfilePictureUrl,
    updateCoverImageUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};