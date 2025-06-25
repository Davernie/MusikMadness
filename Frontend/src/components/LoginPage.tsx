import React, { useState } from 'react';
import GoogleLoginButton from './GoogleLoginButton';

const LoginPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const handleGoogleSuccess = (userData: any, token: string) => {
    // Store the token in localStorage or your preferred storage method
    localStorage.setItem('authToken', token);
    
    // Update user state
    setUser(userData);
    
    // Clear any previous errors
    setError('');
    
    console.log('Google login successful:', userData);
    
    // Redirect or update app state as needed
    // For example: navigate('/dashboard');
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
    console.error('Google login error:', errorMessage);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Welcome!</h2>
        <div className="space-y-2">
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Email Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Auth Provider:</strong> {user.authProvider || 'local'}</p>
          {user.profilePictureUrl && (
            <div>
              <p><strong>Profile Picture:</strong></p>
              <img 
                src={user.profilePictureUrl} 
                alt="Profile" 
                className="w-16 h-16 rounded-full mt-2"
              />
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Login to MusikMadness</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="space-y-4">
        {/* Traditional login form can go here */}
        <div className="text-center text-gray-500 mb-4">
          Or sign in with:
        </div>
        
        {/* Google Login Button */}
        <GoogleLoginButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        />
      </div>
    </div>
  );
};

export default LoginPage;
