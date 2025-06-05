import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Music, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { login, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);
    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form input
    if (!email.trim()) {
      setFormError('Email is required');
      return;
    }
    
    if (!password) {
      setFormError('Password is required');
      return;
    }
    
    setFormError('');
    try {
      await login(email, password);
    } catch (err: any) {
      // Check if this is an email verification error
      if (err.message && err.message.includes('verify your email')) {
        // Redirect to resend verification page after a short delay
        setTimeout(() => {
          navigate('/resend-verification');
        }, 3000);
      }
      // Error is already handled in the auth context
    }
  };
  
  return (
    <div className="min-h-[20rem] flex items-center justify-center py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Music className="mx-auto h-12 w-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 204, 255, 0.7))' }} />
          <h2 className="mt-6 text-3xl font-bold text-white"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.7), 0 0 20px rgba(0, 204, 255, 0.4)',
              letterSpacing: '2px'
            }}>
            WELCOME BACK
          </h2>
          <p className="mt-2 text-sm text-cyan-400/70">
            Sign in to your MusikMadness account
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
            {(error || formError) && (
              <div className="mb-4 p-3 bg-pink-500/20 border border-pink-500/40 rounded-md flex items-center text-pink-400">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <p className="text-sm">{formError || error}</p>
              </div>
            )}
            
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
                <label htmlFor="password" className="block text-sm font-medium text-cyan-400/80">
                  Password
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-cyan-400/70">
                    Remember me
                  </label>
                </div>
                
                <div className="text-sm">
                  <a href="#" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
                    Forgot your password?
                  </a>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_15px_rgba(0,204,255,0.3)] text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign in'}
                </button>
              </div>
            </form>
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800/60 text-cyan-400/70">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-cyan-500/30 rounded-md shadow-sm bg-gray-800/50 text-sm font-medium text-white hover:bg-gray-700/50 transition-colors duration-300"
                >
                  <span className="sr-only">Sign in with Google</span>
                  <svg className="w-5 h-5 text-cyan-400" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                </a>
                
                <a
                  href="#"
                  className="w-full inline-flex justify-center py-2 px-4 border border-cyan-500/30 rounded-md shadow-sm bg-gray-800/50 text-sm font-medium text-white hover:bg-gray-700/50 transition-colors duration-300"
                >
                  <span className="sr-only">Sign in with Facebook</span>
                  <svg className="w-5 h-5 text-cyan-400" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <p className="mt-4 text-center text-sm text-cyan-400/70">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;