import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Music, Lock, Mail, User } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    artistName: '',
    primaryGenre: '',
    agreeToTerms: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const genres = [
    '', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'
  ];
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    // Handle registration logic
    console.log('Registration attempted with:', formData);
  };
  
  return (
    <div className="min-h-[calc(100vh-16rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-900">
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
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-cyan-400/80">
                  Full Name
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-cyan-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-cyan-500/30 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="John Doe"
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
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-[0_0_15px_rgba(0,204,255,0.3)] text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-pink-500 hover:from-cyan-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 transition-all duration-300"
                >
                  Create Account
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