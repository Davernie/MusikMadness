import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Music, Lock, AlertCircle, CheckCircle, Loader, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

const ResetPasswordPage: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [validToken, setValidToken] = useState<boolean | null>(null);
  
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setValidToken(false);
      setStatus('error');
      setMessage('No reset token provided. Please request a new password reset link.');
      return;
    }
    setValidToken(true);
  }, [token]);

  // Password requirements validation
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
    };
    
    const isValid = Object.values(requirements).every(req => req);
    return { isValid, requirements };
  };

  const passwordValidation = validatePassword(newPassword);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setStatus('error');
      setMessage('No reset token provided');
      return;
    }

    if (!newPassword.trim()) {
      setStatus('error');
      setMessage('Please enter a new password');
      return;
    }

    if (!passwordValidation.isValid) {
      setStatus('error');
      setMessage('Password does not meet security requirements');
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      return;
    }

    setLoading(true);
    setStatus('idle');

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token, newPassword })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || 'Password reset successful. You can now log in with your new password.');
        // Redirect to login page after 3 seconds
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setStatus('error');
        setMessage(data.message || 'Failed to reset password. Please try again or request a new reset link.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }

    setLoading(false);
  };

  // If token is invalid, show error message
  if (validToken === false) {
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
              INVALID RESET LINK
            </h2>
          </div>
          
          <div className="mt-8">
            <div className="bg-gray-800/60 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
              <div className="bg-pink-500/20 border border-pink-500/40 text-pink-400 mb-4 p-3 rounded-md flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{message}</p>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-white">
                  The password reset link you clicked is either invalid or has expired.
                </p>
                <p className="text-cyan-400/70 text-sm">
                  Password reset links are only valid for 1 hour after being sent.
                </p>
              </div>
            </div>
            
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-cyan-400/70">
                <Link to="/forgot-password" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
                  Request a new password reset link
                </Link>
              </p>
              <p className="text-sm text-cyan-400/70">
                <Link to="/login" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300 inline-flex items-center">
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            RESET PASSWORD
          </h2>
          <p className="mt-2 text-sm text-cyan-400/70">
            Enter your new password below
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
                {/* New Password field */}
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-cyan-400/80">
                    New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-cyan-400" />
                    </div>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-cyan-400/70 hover:text-cyan-400 focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  {/* Password Requirements */}
                  {newPassword && (
                    <div className="mt-2 text-xs text-gray-400">
                      <p className="mb-1 font-medium text-cyan-400/80">Password Requirements:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center ${
                          passwordValidation.requirements.length 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">{passwordValidation.requirements.length ? '✓' : '•'}</span>
                          At least 8 characters
                        </li>
                        <li className={`flex items-center ${
                          passwordValidation.requirements.uppercase 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">{passwordValidation.requirements.uppercase ? '✓' : '•'}</span>
                          One uppercase letter
                        </li>
                        <li className={`flex items-center ${
                          passwordValidation.requirements.lowercase 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">{passwordValidation.requirements.lowercase ? '✓' : '•'}</span>
                          One lowercase letter
                        </li>
                        <li className={`flex items-center ${
                          passwordValidation.requirements.number 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">{passwordValidation.requirements.number ? '✓' : '•'}</span>
                          One number
                        </li>
                        <li className={`flex items-center ${
                          passwordValidation.requirements.special 
                            ? 'text-green-400' 
                            : 'text-gray-400'
                        }`}>
                          <span className="mr-2">{passwordValidation.requirements.special ? '✓' : '•'}</span>
                          One special character (!@#$%^&*...)
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
                
                {/* Confirm Password field */}
                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400/80">
                    Confirm New Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-cyan-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`block w-full pl-10 pr-10 py-2 bg-gray-700/50 border rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                        confirmPassword && newPassword && newPassword !== confirmPassword
                          ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                          : 'border-cyan-500/30 focus:ring-cyan-500/50 focus:border-transparent'
                      }`}
                      placeholder="••••••••"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="text-cyan-400/70 hover:text-cyan-400 focus:outline-none"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {confirmPassword && newPassword && newPassword !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-400 flex items-center">
                      <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
                      Passwords do not match
                    </p>
                  )}
                </div>
                
                <div>
                  <button
                    type="submit"
                    disabled={loading || !passwordValidation.isValid || newPassword !== confirmPassword}
                    className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_15px_rgba(0,204,255,0.3)] text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                        Resetting Password...
                      </>
                    ) : (
                      'Reset Password'
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
                  Your password has been reset successfully!
                </p>
                <p className="text-cyan-400/70 text-sm">
                  You will be redirected to the login page in a few seconds...
                </p>
                <Link 
                  to="/login"
                  className="inline-block font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300"
                >
                  Go to Login Page Now
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 text-center space-y-2">
            <p className="text-sm text-cyan-400/70">
              <Link to="/login" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300 inline-flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Sign In
              </Link>
            </p>
            <p className="text-sm text-cyan-400/70">
              Don't have an account?{' '}
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

export default ResetPasswordPage;
