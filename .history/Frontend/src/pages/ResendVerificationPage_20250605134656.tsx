import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Music, Mail, AlertCircle, CheckCircle, Loader } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ResendVerificationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [showEmailChange, setShowEmailChange] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // Helper component to display field errors
  const FieldError: React.FC<{ fieldName: string }> = ({ fieldName }) => {
    const errors = fieldErrors[fieldName];
    if (!errors || errors.length === 0) return null;
    
    return (
      <div className="mt-1">
        {errors.map((errorMsg, index) => (
          <p key={index} className="text-sm text-red-400 flex items-center">
            <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
            {errorMsg}
          </p>
        ))}
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setStatus('error');
      setMessage('Please enter your email address');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Verification email sent! Please check your inbox.');
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to send verification email. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Music 
            className="mx-auto h-12 w-12 text-cyan-400" 
            style={{ filter: 'drop-shadow(0 0 8px rgba(0, 204, 255, 0.7))' }} 
          />
          <h2 className="mt-6 text-3xl font-bold"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.7), 0 0 20px rgba(0, 204, 255, 0.4)',
              letterSpacing: '2px'
            }}>
            RESEND VERIFICATION
          </h2>
          <p className="mt-2 text-sm text-cyan-400/70">
            Enter your email to receive a new verification link
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
            
            {status !== 'idle' && (
              <div className={`mb-4 p-3 rounded-md flex items-center ${
                status === 'success' 
                  ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                  : 'bg-pink-500/20 border border-pink-500/40 text-pink-400'
              }`}>
                {status === 'success' ? (
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                )}
                <p className="text-sm">{message}</p>
              </div>
            )}

            {status !== 'success' && (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-cyan-400/80">
                    Email address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-cyan-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_15px_rgba(0,204,255,0.3)] text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Send Verification Email'
                    )}
                  </button>
                </div>
              </form>
            )}

            {status === 'success' && (
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <CheckCircle className="h-16 w-16 text-green-400" />
                </div>
                <p className="text-white">
                  Check your email inbox and click the verification link to activate your account.
                </p>
                <p className="text-cyan-400/70 text-sm">
                  Don't see the email? Check your spam folder.
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-cyan-400/70">
              Remember your password?{' '}
              <Link to="/login" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
                Try logging in
              </Link>
            </p>
            <p className="text-sm text-cyan-400/70">
              Need to create an account?{' '}
              <Link to="/register" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResendVerificationPage;
