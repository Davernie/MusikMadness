import React, { useState } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Google Client ID - this should match your backend configuration
console.log('Environment variables:', import.meta.env);
console.log('Raw VITE_GOOGLE_CLIENT_ID:', import.meta.env.VITE_GOOGLE_CLIENT_ID);
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com";

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);  const handleGoogleLogin = async () => {
    console.log('Google login button clicked');
    console.log('GOOGLE_CLIENT_ID:', GOOGLE_CLIENT_ID);
    
    if (!GOOGLE_CLIENT_ID) {
      onError('Google login is not configured');
      return;
    }

    setIsLoading(true);
    console.log('Loading state set to true');

    try {
      // Load Google Sign-In API
      console.log('Loading Google API...');
      await loadGoogleAPI();
      console.log('Google API loaded successfully');

      // Initialize Google Sign-In
      console.log('Initializing Google Sign-In...');
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      // Trigger the login prompt
      console.log('Triggering Google prompt...');
      window.google.accounts.id.prompt((notification: any) => {
        console.log('Google prompt notification:', notification);
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          console.log('Prompt not displayed, using fallback button');
          // If prompt fails, show popup instead
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
          // Click the hidden button to trigger popup
          setTimeout(() => {
            const hiddenButton = document.getElementById('google-signin-button')?.querySelector('div');
            if (hiddenButton) {
              console.log('Clicking hidden Google button');
              (hiddenButton as HTMLElement).click();
            } else {
              console.log('Hidden button not found');
              setIsLoading(false);
            }
          }, 100);
        }
      });

    } catch (error) {
      console.error('Google login error:', error);
      onError(error instanceof Error ? error.message : 'Google login failed');
      setIsLoading(false);
    }
  };const handleCredentialResponse = async (response: any) => {
    console.log('Google credential response received:', response);
    
    try {
      // Get the API base URL
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      console.log('Using API base URL:', apiBaseUrl);
      
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

      console.log('Backend response status:', backendResponse.status);
      const data = await backendResponse.json();
      console.log('Backend response data:', data);

      if (backendResponse.ok) {
        console.log('Google login successful, calling onSuccess');
        onSuccess(data.user, data.token);
      } else {
        console.log('Google login failed:', data.message);
        onError(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      onError('Authentication failed. Please try again.');
    } finally {
      console.log('Resetting loading state');
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
          flex items-center justify-center gap-2 w-full px-4 py-2 
          border border-cyan-500/30 rounded-md shadow-sm bg-gray-800/50 
          text-sm font-medium text-white hover:bg-gray-700/50 
          focus:outline-none focus:ring-2 focus:ring-cyan-500/50 
          disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-300
          ${className}
        `}
      >
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="w-4 h-4 text-cyan-400" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
            </svg>
            <span>Google</span>
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
