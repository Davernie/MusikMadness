import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export interface User {
  id: string;
  username: string;
  email: string;
  profilePictureUrl?: string;
  bio?: string;
  isCreator: boolean;
  isEmailVerified: boolean;
  authProvider?: 'local' | 'google';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  requiresEmailVerification?: boolean;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('authToken');
  }

  // Set authorization header for axios requests
  private getAuthHeaders() {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  // Traditional email/password login
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      const data = response.data;
      this.setToken(data.token);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  }

  // Google OAuth login
  async googleLogin(idToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/google`, {
        idToken
      });

      const data = response.data;
      this.setToken(data.token);
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Google login failed');
    }
  }

  // Register new user
  async signup(username: string, email: string, password: string, profileImage?: File): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('username', username);
      formData.append('email', email);
      formData.append('password', password);
      
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.post(`${API_BASE_URL}/auth/signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      this.setToken(data.token);
      return data;
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        throw error.response.data;
      }
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  }

  // Complete Google signup with additional details
  async completeGoogleSignup(
    tempToken: string, 
    username: string, 
    artistName?: string, 
    bio?: string, 
    profileImage?: File
  ): Promise<AuthResponse> {
    try {
      const formData = new FormData();
      formData.append('tempToken', tempToken);
      formData.append('username', username);
      
      if (artistName) {
        formData.append('artistName', artistName);
      }
      if (bio) {
        formData.append('bio', bio);
      }
      if (profileImage) {
        formData.append('profileImage', profileImage);
      }

      const response = await axios.post(`${API_BASE_URL}/auth/google/complete-signup`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const data = response.data;
      this.setToken(data.token);
      return data;
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        throw error.response.data;
      }
      throw new Error(error.response?.data?.message || 'Google signup completion failed');
    }
  }

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders()
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user data');
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/verify-email`, {
        token
      });

      const data = response.data;
      if (data.token) {
        this.setToken(data.token);
      }
      return data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  }

  // Resend verification email
  async resendVerificationEmail(email: string, newEmail?: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/resend-verification`, {
        email,
        newEmail
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.fieldErrors) {
        throw error.response.data;
      }
      throw new Error(error.response?.data?.message || 'Failed to resend verification email');
    }
  }

  // Request password reset
  async requestPasswordReset(email: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
        email
      });

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to request password reset');
    }
  }

  // Reset password
  async resetPassword(token: string, newPassword: string): Promise<{ message: string; success: boolean }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/reset-password`, {
        token,
        newPassword
      });

      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.join(', '));
      }
      throw new Error(error.response?.data?.message || 'Password reset failed');
    }
  }

  // Set token and store in localStorage
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('authToken', token);
  }

  // Remove token and clear from localStorage
  logout(): void {
    this.token = null;
    localStorage.removeItem('authToken');
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }
}

// Export a singleton instance
const authService = new AuthService();
export default authService;
