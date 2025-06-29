import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Music, CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const token = searchParams.get('token');
  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link. Please check your email for the correct link.');
        return;
      }      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ token })
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || 'Email verified successfully! Redirecting to your profile...');
            // If the backend returned authentication data, store it
          if (data.token && data.user) {
            localStorage.setItem('token', data.token);
            // Force a page reload to refresh the AuthContext
            setTimeout(() => {
              window.location.href = '/profile';
            }, 3000);
            return;
          }
          
          // Redirect to profile page after 3 seconds
          setTimeout(() => {
            navigate('/profile');
          }, 3000);        } else {
          if (data.message?.includes('expired')) {
            setStatus('expired');
            setMessage('Verification link has expired. Redirecting to resend page...');
            // Instant redirect to resend verification page
            setTimeout(() => {
              navigate('/resend-verification');
            }, 1000);
          } else {
            setStatus('error');
            setMessage(data.message || 'Email verification failed. Please try again.');
          }
        }
      } catch (error) {
        setStatus('error');
        setMessage('Network error. Please check your connection and try again.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  const renderIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader className="h-16 w-16 text-cyan-400 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-16 w-16 text-green-400" />;
      case 'expired':
        return <AlertCircle className="h-16 w-16 text-yellow-400" />;
      case 'error':
      default:
        return <XCircle className="h-16 w-16 text-red-400" />;
    }
  };

  const renderContent = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Verifying Your Email</h2>
            <p className="text-cyan-400/70">Please wait while we verify your email address...</p>
          </div>
        );      case 'success':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-green-400 mb-4">Email Verified!</h2>
            <p className="text-white mb-6">{message}</p>
            <p className="text-cyan-400/70 text-sm">Redirecting to your profile in 3 seconds...</p>
            <Link 
              to="/profile" 
              className="inline-block mt-4 bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 px-6 py-2 rounded-md font-medium text-white transition-all duration-300"
            >
              Go to Profile
            </Link>
          </div>
        );      case 'expired':
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Link Expired</h2>
            <p className="text-white mb-6">{message}</p>
            <p className="text-cyan-400/70 text-sm">Redirecting to resend page in 1 second...</p>
            <Link 
              to="/resend-verification" 
              className="inline-block mt-4 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-6 py-2 rounded-md font-medium text-white transition-all duration-300"
            >
              Go to Resend Page
            </Link>
          </div>
        );
      case 'error':
      default:
        return (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-400 mb-4">Verification Failed</h2>
            <p className="text-white mb-6">{message}</p>
            <div className="space-x-4">
              <Link 
                to="/resend-verification" 
                className="inline-block bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 px-6 py-2 rounded-md font-medium text-white transition-all duration-300"
              >
                Resend Email
              </Link>
              <Link 
                to="/register" 
                className="inline-block bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-md font-medium text-white transition-colors duration-300"
              >
                Try Again
              </Link>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Music 
            className="mx-auto h-12 w-12 text-cyan-400" 
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 204, 255, 0.7))' }} 
          />
          <div className="mt-8">
            <div className="bg-gray-800/60 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
              <div className="flex flex-col items-center space-y-4">
                {renderIcon()}
                {renderContent()}
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-cyan-400/70">
            Need help? Contact{' '}
            <a href="mailto:musikmadnessofficial@gmail.com" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
              support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
