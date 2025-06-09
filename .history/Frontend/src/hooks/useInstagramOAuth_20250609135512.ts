import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

export interface InstagramConnectionData {
  username: string;
  accountType: string;
  mediaCount: number;
  connectedAt: Date;
}

export interface UseInstagramOAuthReturn {
  isConnecting: boolean;
  isConnected: boolean;
  instagramData: InstagramConnectionData | null;
  connectInstagram: () => Promise<void>;
  disconnectInstagram: () => Promise<void>;
  checkConnection: () => Promise<void>;
}

export const useInstagramOAuth = (): UseInstagramOAuthReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [instagramData, setInstagramData] = useState<InstagramConnectionData | null>(null);
  const { token, user } = useAuth();

  // Check if Instagram is already connected
  const checkConnection = useCallback(async () => {
    if (user?.socials?.instagramConnected) {
      setIsConnected(true);
      setInstagramData({
        username: user.socials.instagramConnected.username,
        accountType: user.socials.instagramConnected.accountType || 'PERSONAL',
        mediaCount: user.socials.instagramConnected.mediaCount || 0,
        connectedAt: new Date(user.socials.instagramConnected.connectedAt)
      });
    } else {
      setIsConnected(false);
      setInstagramData(null);
    }
  }, [user]);

  // Connect to Instagram
  const connectInstagram = useCallback(async () => {
    if (!token) {
      toast.error('You must be logged in to connect Instagram');
      return;
    }

    try {
      setIsConnecting(true);

      // Get Instagram auth URL
      const response = await fetch(`${API_BASE_URL}/users/instagram/auth-url`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get Instagram authorization URL');
      }

      const { authUrl } = await response.json();

      // Open Instagram OAuth in a popup window
      const popup = window.open(
        authUrl,
        'instagram-oauth',
        'width=600,height=700,scrollbars=yes,resizable=yes'
      );

      if (!popup) {
        throw new Error('Please allow popups for this site to connect Instagram');
      }

      // Listen for the OAuth callback
      const handleCallback = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) {
          return;
        }

        if (event.data.type === 'INSTAGRAM_OAUTH_SUCCESS') {
          popup.close();
          handleOAuthSuccess(event.data.code);
          window.removeEventListener('message', handleCallback);
        } else if (event.data.type === 'INSTAGRAM_OAUTH_ERROR') {
          popup.close();
          toast.error('Instagram connection failed: ' + event.data.error);
          setIsConnecting(false);
          window.removeEventListener('message', handleCallback);
        }
      };

      window.addEventListener('message', handleCallback);

      // Check if popup was closed manually
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsConnecting(false);
          window.removeEventListener('message', handleCallback);
        }
      }, 1000);

    } catch (error) {
      console.error('Instagram connect error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to connect Instagram');
      setIsConnecting(false);
    }
  }, [token]);

  // Handle successful OAuth
  const handleOAuthSuccess = async (code: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/instagram/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code })
      });

      if (!response.ok) {
        throw new Error('Failed to complete Instagram connection');
      }

      const data = await response.json();
      
      setIsConnected(true);
      setInstagramData(data.instagram);
      toast.success(`Instagram account @${data.instagram.username} connected successfully!`);
      
      // Trigger a reload of user data
      window.location.reload();
      
    } catch (error) {
      console.error('Instagram callback error:', error);
      toast.error('Failed to complete Instagram connection');
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect Instagram
  const disconnectInstagram = useCallback(async () => {
    if (!token) {
      toast.error('You must be logged in to disconnect Instagram');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/instagram/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to disconnect Instagram');
      }

      setIsConnected(false);
      setInstagramData(null);
      toast.success('Instagram account disconnected successfully');
      
      // Trigger a reload of user data
      window.location.reload();
      
    } catch (error) {
      console.error('Instagram disconnect error:', error);
      toast.error('Failed to disconnect Instagram');
    }
  }, [token]);

  return {
    isConnecting,
    isConnected,
    instagramData,
    connectInstagram,
    disconnectInstagram,
    checkConnection
  };
};
