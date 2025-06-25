import React, { useState, useEffect } from 'react';

interface GoogleLoginButtonProps {
  onSuccess: (user: any, token: string) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

// Use hardcoded for now (will restore env var when working)
const GOOGLE_CLIENT_ID = "426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com";

const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess,
  onError,
  disabled = false,
  className = ''
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initializeGoogleOAuth();
  }, []);

  const initializeGoogleOAuth = async () => {
    console.log('🔵 Initializing Google OAuth...');
    
    if (!GOOGLE_CLIENT_ID) {
      onError('Google login is not configured');
      setIsLoading(false);
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
      setIsLoading(false);
      console.log('✅ Google button ready');

    } catch (error) {
      console.error('❌ Google initialization error:', error);
      onError(error instanceof Error ? error.message : 'Google login failed to initialize');
      setIsLoading(false);
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
        console.log('✅ Backend authentication successful!');
        console.log('User:', data.user.email);
        onSuccess(data.user, data.token);
      } else {
        console.log('❌ Backend error:', data.message);
        onError(data.message || 'Google login failed');
      }
    } catch (error) {
      console.error('Backend authentication error:', error);
      onError('Authentication failed. Please try again.');
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
        // Wait a bit for the API to fully initialize
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
    return null;
  }
  return (
    <div className={`google-login-container flex justify-center ${className}`}>
      {isLoading && (
        <div className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-cyan-500/30 rounded-md shadow-sm bg-gray-800/50 text-sm font-medium text-white">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cyan-400"></div>
          <span>Loading Google...</span>
        </div>
      )}
      
      {/* This is where the actual Google button will be rendered */}
      <div 
        id="google-signin-button" 
        className={isReady ? 'flex justify-center' : 'hidden'}
      ></div>
      
      {!isLoading && !isReady && (
        <div className="flex items-center justify-center gap-2 w-full px-4 py-2 border border-red-500/30 rounded-md shadow-sm bg-red-800/20 text-sm font-medium text-red-400">
          <span>Google login unavailable</span>
        </div>
      )}
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
