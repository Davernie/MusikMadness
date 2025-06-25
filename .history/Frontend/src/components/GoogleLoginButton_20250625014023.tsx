import React, { useState } from 'react';
import { Chrome } from 'lucide-react';

interface GoogleLoginButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Google Client ID - this should match your backend configuration
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    if (!GOOGLE_CLIENT_ID) {
      onError('Google login is not configured');
      return;
    }

    setIsLoading(true);

    try {
      // Load Google Sign-In API
      await loadGoogleAPI();

      // Initialize Google Sign-In
      await new Promise<void>((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
          auto_select: false,
        });

        // Create a temporary callback for this session
        window.googleLoginCallback = (response: any) => {
          if (response.credential) {
            handleCredentialResponse(response);
            resolve();
          } else {
            reject(new Error('No credential received'));
          }
        };

        // Trigger the login prompt
        window.google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to manual sign-in
            window.google.accounts.id.renderButton(
              document.getElementById('google-signin-button'),
              {
                theme: 'outline',
                size: 'large',
                type: 'standard',
                text: 'signin_with',
                width: 250
              }
            );
          }
        });
      });

    } catch (error) {
      console.error('Google login error:', error);
      onError(error instanceof Error ? error.message : 'Google login failed');
      setIsLoading(false);
    }
  };
  const handleCredentialResponse = async (response: any) => {
    try {
      // Get the API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      
      // Send the ID token to your backend
      const backendResponse = await fetch(`${apiBaseUrl}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.credential
        }),
      });

      const data = await backendResponse.json();

      if (backendResponse.ok) {
        onSuccess(data.user, data.token);
      } else {
        onError(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      onError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if Google API is already loaded
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      // Load Google API script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Wait a bit for the API to initialize
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            resolve();
          } else {
            reject(new Error('Google API failed to load'));
          }
        }, 500);
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google API'));
      };

      document.head.appendChild(script);
    });
  };

  if (!GOOGLE_CLIENT_ID) {
    return null; // Don't render if not configured
  }

  return (
    <div className="google-login-container">
      <button
        onClick={handleGoogleLogin}
        disabled={disabled || isLoading}
        className={`
          flex items-center justify-center gap-3 w-full px-4 py-3 
          border border-gray-300 rounded-lg text-gray-700 bg-white 
          hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <Chrome className="w-5 h-5" />
            <span>Sign in with Google</span>
          </>
        )}
      </button>
      
      {/* Hidden div for Google button rendering fallback */}
      <div id="google-signin-button" className="hidden"></div>
    </div>
  );
};

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    google: any;
    googleLoginCallback: (response: any) => void;
  }
}

export default GoogleLoginButton;
