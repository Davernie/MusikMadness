import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Music, User, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateImage, ImageValidationResult } from '../utils/imageHandling';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const genres = [
  '', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'
] as const;

const GoogleSignupCompletionPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginWithGoogle, isAuthenticated } = useAuth();

  // Get Google user info from URL params
  const tempToken = searchParams.get('token');
  const email = searchParams.get('email');
  const name = searchParams.get('name');
  const picture = searchParams.get('picture');

  const [formData, setFormData] = useState({
    username: name ? name.toLowerCase().replace(/[^a-z0-9]/g, '') : '',
    bio: '',
    agreeToTerms: false
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  // If user is already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Validate required URL parameters
  useEffect(() => {
    if (!tempToken || !email || !name) {
      setError('Invalid signup link. Please try signing in with Google again.');
    }
  }, [tempToken, email, name]);

  // No default profile image - users start with blank avatar like normal signup

  // Suggest username from Google name
  useEffect(() => {
    if (name && !formData.username) {
      const suggestedUsername = name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 20);
      setFormData(prev => ({
        ...prev,
        username: suggestedUsername
      }));
    }
  }, [name, formData.username]);

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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };
  
  // Handle profile image selection
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const result: ImageValidationResult = await validateImage(e.target.files[0]);
      
      if (!result.isValid) {
        toast.error(result.error);
        return;
      }
      
      setProfileImage(result.file!);
      setProfileImagePreview(result.preview!);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Check if terms are agreed to
    if (!formData.agreeToTerms) {
      setError("You must agree to the Terms and Conditions");
      return;
    }

    if (!tempToken) {
      setError("Invalid signup session. Please try again.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Call the authService to complete Google signup
      const result = await authService.completeGoogleSignup(
        tempToken,
        formData.username.trim(),
        undefined, // No artist name
        formData.bio.trim(),
        profileImage || undefined
      );

      // Successfully completed signup - log the user in
      console.log('✅ Google signup completed successfully');
      loginWithGoogle(result.user, result.token);
      toast.success('Welcome to MusikMadness!');
      navigate('/');
    } catch (err: any) {
      console.error('Google signup completion error:', err);
      if (err.fieldErrors) {
        setFieldErrors(err.fieldErrors);
      }
      setError(err.message || 'Failed to complete signup');
    } finally {
      setLoading(false);
    }
  };

  if (!tempToken || !email || !name) {
    return (
      <div className="min-h-[20rem] flex items-center justify-center py-0 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="text-center">
            <Music className="mx-auto h-12 w-12 text-red-400" />
            <h2 className="mt-6 text-3xl font-bold text-red-400">
              Invalid Signup Link
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Please try signing in with Google again.
            </p>
            <Link 
              to="/login" 
              className="mt-4 inline-block text-cyan-400 hover:text-cyan-300"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-[20rem] flex items-center justify-center py-0 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Music className="mx-auto h-12 w-12 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px rgba(0, 204, 255, 0.7))' }} />
          <h2 className="mt-6 text-3xl font-bold"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.7), 0 0 20px rgba(0, 204, 255, 0.4)',
              letterSpacing: '2px'
            }}>
            COMPLETE YOUR PROFILE
          </h2>
          <p className="mt-2 text-sm text-cyan-400/70">
            Hi {name}! Let's finish setting up your account
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Signing up with: {email}
          </p>
        </div>

        <div className="mt-8">
          <div 
            className="py-8 px-6 rounded-xl border border-white/5"
            style={{
              background: 'rgba(15, 15, 20, 0.7)',
              boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 204, 255, 0.1)'
            }}
          >
            {error && (
              <div className="mb-4 p-3 bg-pink-500/20 border border-pink-500/40 rounded-md flex items-center text-pink-400">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-cyan-400/80 mb-2">
                  Profile Picture
                </label>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className={`h-24 w-24 rounded-lg overflow-hidden border-2 border-cyan-500/30 ${!profileImagePreview ? 'bg-gray-700/50' : ''}`}>
                      {profileImagePreview ? (
                        <img src={profileImagePreview} alt="Profile preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <User className="h-12 w-12 text-cyan-400/50" />
                        </div>
                      )}
                    </div>
                    <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 rounded-full p-2 cursor-pointer transition-colors">
                      <Camera className="h-4 w-4 text-white" />
                    </label>
                    <input
                      id="profileImage"
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 text-sm text-gray-400">
                    <p>Upload a profile picture (optional)</p>
                    <p className="text-xs text-gray-500 mt-1">You can always add one later in settings</p>
                  </div>
                </div>
              </div>

              {/* Username */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-cyan-400/80">
                  Username *
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className={`block w-full pl-10 pr-3 py-2 bg-gray-700/50 border rounded-md focus:outline-none focus:ring-2 text-white placeholder-gray-400 ${
                      fieldErrors.username && fieldErrors.username.length > 0
                        ? 'border-red-500 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-cyan-500/30 focus:ring-cyan-500/50 focus:border-transparent'
                    }`}
                    placeholder="Enter your username"
                  />
                </div>
                <FieldError fieldName="username" />
              </div>

              {/* Bio */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-cyan-400/80">
                  Bio
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400 resize-none"
                    placeholder="Tell us about your music, style, or interests... (Optional)"
                  />
                </div>
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-500">
                    Share a bit about yourself with the community
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.bio.length}/500
                  </p>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    checked={formData.agreeToTerms}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-cyan-400 focus:ring-cyan-500 bg-gray-700 border-gray-600 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-gray-300">
                    I agree to the{' '}
                    <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 underline">
                      Terms and Conditions
                    </Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-cyan-400 hover:text-cyan-300 underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  style={{
                    background: loading ? 'rgba(6, 182, 212, 0.3)' : 'linear-gradient(135deg, #06b6d4, #0891b2)',
                    boxShadow: loading ? 'none' : '0 4px 15px rgba(6, 182, 212, 0.4), 0 0 20px rgba(6, 182, 212, 0.1)',
                  }}
                >
                  {loading ? 'Creating Account...' : 'Complete Signup'}
                </button>
              </div>
            </form>
          </div>
          
          <p className="mt-4 text-center text-sm text-cyan-400/70">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-pink-400 hover:text-pink-300 transition-colors duration-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GoogleSignupCompletionPage; 