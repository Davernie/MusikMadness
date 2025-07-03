import React, { useState, useEffect } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Use environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [showFallback, setShowFallback] = useState(true);

  useEffect(() => {
    initializeGoogleOAuth();
  }, []);

  const initializeGoogleOAuth = async () => {
    console.log('🔵 Initializing Google OAuth...');
    
    if (!GOOGLE_CLIENT_ID) {
      onError('Google login is not configured');
      setShowFallback(true);
      return;
    }

    try {
      // Load Google API
      await loadGoogleAPI();
      console.log('✅ Google API loaded');

      // Initialize Google Sign-In
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
      });
      console.log('✅ Google initialized');

      // Render the Google button
      renderGoogleButton();
      
      setIsReady(true);
      setShowFallback(false);
      console.log('✅ Google button ready');

    } catch (error) {
      console.error('❌ Google initialization error:', error);
      onError(error instanceof Error ? error.message : 'Google login failed to initialize');
      setShowFallback(true);
    }
  };

  const renderGoogleButton = () => {
    const container = document.getElementById('google-signin-button');
    if (container) {
      // Clear any existing content
      container.innerHTML = '';
      
      // Render the actual Google button (same as debug page)
      window.google.accounts.id.renderButton(
        container,
        {
          theme: 'outline',
          size: 'large',
          type: 'standard',
          text: 'signin_with',
          width: 250
        }
      );
    }
  };

  const handleCredentialResponse = async (response: any) => {
    console.log('✅ SUCCESS: Received credential response!');
    console.log('Token length:', response.credential.length);
    
    try {
      setIsLoading(true);
      
      // Send to backend (same as debug page)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const backendResponse = await fetch(`${API_BASE_URL}/auth/google`, {
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

      if (backendResponse.ok) {
        if (data.requiresSignup) {
          // New user needs to complete signup
          console.log('🔄 New Google user - redirecting to signup completion');
          window.location.href = `/google-signup?token=${encodeURIComponent(data.tempToken)}&email=${encodeURIComponent(data.googleUserInfo.email)}&name=${encodeURIComponent(data.googleUserInfo.name)}&picture=${encodeURIComponent(data.googleUserInfo.picture)}`;
        } else {
          // Existing user - complete login
          console.log('✅ Backend authentication successful!');
          console.log('User:', data.user.email);
          onSuccess(data.user, data.token);
        }
      } else {
        console.log('❌ Backend error:', data.message);
        onError(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      onError('Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackClick = () => {
    setIsLoading(true);
    // Try to initialize again if not ready
    if (!isReady) {
      initializeGoogleOAuth();
    }
  };

  const loadGoogleAPI = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (window.google && window.google.accounts) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        // Reduced timeout for faster loading
        setTimeout(() => {
          if (window.google && window.google.accounts) {
            resolve();
          } else {
            reject(new Error('Google API failed to load'));
          }
        }, 100); // Reduced from 500ms to 100ms
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load Google API'));
      };

      document.head.appendChild(script);
    });
  };

  if (!GOOGLE_CLIENT_ID) {
    return null;
  }

  return (
    <div className={`google-login-container flex justify-center ${className}`}>
      {/* Show fallback button immediately while Google loads */}
      {showFallback && (
        <button
          onClick={handleFallbackClick}
          disabled={disabled || isLoading}
          className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continue with Google</span>
            </>
          )}
        </button>
      )}
      
      {/* This is where the actual Google button will be rendered */}
      <div 
        id="google-signin-button" 
        className={isReady ? 'flex justify-center' : 'hidden'}
      ></div>
    </div>
  );
};

// Extend the Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

export default GoogleLoginButton;
