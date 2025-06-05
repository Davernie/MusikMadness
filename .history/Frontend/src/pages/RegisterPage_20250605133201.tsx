import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Music, Lock, Mail, User, AlertCircle, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateImage, type ImageValidationResult } from '../utils/imageHandling';
import { toast } from 'react-toastify';

const genres = [
  '', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'
] as const;

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    artistName: '',
    primaryGenre: '',
    bio: '',
    agreeToTerms: false
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formError, setFormError] = useState('');
  
  const { signup, loading, error, fieldErrors, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // If user is already authenticated, redirect to home page
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Handle redirect after successful registration with email verification
  useEffect(() => {
    if (error && error.includes('Registration successful')) {
      const redirectTimer = setTimeout(() => {
        navigate('/resend-verification');
      }, 3000);

      // Clean up timer if component unmounts or error changes
      return () => clearTimeout(redirectTimer);
    }
  }, [error, navigate]);
  
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
    setFormError('');
    
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      setFormError("Passwords don't match!");
      return;
    }
    
    // Check if terms are agreed to
    if (!formData.agreeToTerms) {
      setFormError("You must agree to the Terms and Conditions");
      return;
    }
    
    // Create signup data
    const signupData = {
      username: formData.username,
      email: formData.email,
      password: formData.password
    };
    
    try {
      await signup(signupData);
      // The redirect will be handled by the useEffect hook watching for the success message
    } catch (err) {
      // Error is already handled in the auth context
    }
  };
  
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
            CREATE YOUR ACCOUNT
          </h2>
          <p className="mt-2 text-sm text-cyan-400/70">
            Join the MusikMadness community of musicians
          </p>
        </div>
        
        <div className="mt-8">
          <div className="bg-gray-800/60 backdrop-blur-sm py-8 px-6 shadow-md rounded-xl border border-cyan-500/20 shadow-[0_0_15px_rgba(0,204,255,0.15)]">
            {(error || formError) && (
              <div className={`mb-4 p-3 rounded-md flex items-center ${
                error && error.includes('Registration successful') 
                  ? 'bg-green-500/20 border border-green-500/40 text-green-400' 
                  : 'bg-pink-500/20 border border-pink-500/40 text-pink-400'
              }`}>
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{formError || error}</p>
                  {error && error.includes('Registration successful') && (
                    <p className="text-xs mt-2 text-cyan-400">
                      Redirecting to verification page in 3 seconds...
                    </p>
                  )}
                </div>
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Profile Image Upload */}
              <div>
                <label className="block text-sm font-medium text-cyan-400/80 mb-2">
                  Profile Picture (Optional)
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
                    <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-cyan-500 hover:bg-cyan-600 transition-colors rounded-full p-2 cursor-pointer">
                      <Camera className="h-4 w-4 text-white" />
                      <input
                        type="file"
                        id="profile-image"
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400">
                      Add a profile picture to help others recognize you.
                      <br />
                      Max file size: 5MB. Supported formats: JPEG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>

              {/* Username field */}
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-cyan-400/80">
                  Username
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="johnmusic123"
                  />
                </div>
              </div>
              
              {/* Email field */}
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
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="you@example.com"
                  />
                </div>
              </div>
              
              {/* Password field */}
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
                    autoComplete="new-password"
                    required
                    value={formData.password}
                    onChange={handleChange}
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
              
              {/* Confirm Password field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-cyan-400/80">
                  Confirm Password
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
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
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
              </div>
              
              {/* Artist Name field */}
              <div>
                <label htmlFor="artistName" className="block text-sm font-medium text-cyan-400/80">
                  Artist/Band Name (optional)
                </label>
                <div className="mt-1">
                  <input
                    id="artistName"
                    name="artistName"
                    type="text"
                    value={formData.artistName}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Your stage name or band"
                  />
                </div>
              </div>
              
              {/* Primary Genre field */}
              <div>
                <label htmlFor="primaryGenre" className="block text-sm font-medium text-cyan-400/80">
                  Primary Music Genre
                </label>
                <div className="mt-1">
                  <select
                    id="primaryGenre"
                    name="primaryGenre"
                    value={formData.primaryGenre}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white appearance-none"
                  >
                    <option value="" className="bg-gray-800 text-white">Select a genre</option>
                    {genres.filter(g => g !== '').map((genre) => (
                      <option key={genre} value={genre} className="bg-gray-800 text-white">{genre}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Bio field */}
              <div>
                <label htmlFor="bio" className="block text-sm font-medium text-cyan-400/80">
                  Bio (optional)
                </label>
                <div className="mt-1">
                  <textarea
                    id="bio"
                    name="bio"
                    rows={3}
                    value={formData.bio}
                    onChange={handleChange}
                    className="block w-full px-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Tell us a little about yourself..."
                  />
                </div>
              </div>
              
              {/* Terms checkbox */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="agreeToTerms"
                    name="agreeToTerms"
                    type="checkbox"
                    required
                    checked={formData.agreeToTerms}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-gray-600 rounded bg-gray-700"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="agreeToTerms" className="text-cyan-400/70">
                    I agree to the{' '}
                    <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors duration-300">
                      Terms and Conditions
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-pink-400 hover:text-pink-300 transition-colors duration-300">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_15px_rgba(0,204,255,0.3)] text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating account...' : 'Create account'}
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

export default RegisterPage;