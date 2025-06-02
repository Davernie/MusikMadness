import React, { useState, useEffect } from 'react';
import { Bell, Lock, User, Headphones, Monitor, Loader, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateImage, uploadImage, cleanupOldImage, type ImageValidationResult } from '../utils/imageHandling';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

// Profile form data type with all fields
type ProfileFormData = {
  username: string;
  bio: string;
  location: string;
  website: string;
  genre: string;
  socials: {
    soundcloud: string;
    instagram: string;
    twitter: string;
    spotify: string;
  };
};

// Image upload state type
type ImageUploadState = {
  file: File | null;
  preview: string;
  isUploading: boolean;
  progress: number;
  error: string | null;
};

const SettingsPage: React.FC = (): JSX.Element => {  
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [volume, setVolume] = useState(80);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  
  const { user, token } = useAuth();
  const API_URL = 'http://localhost:5000/api';
  
  // Profile form state
  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    username: '',
    bio: '',
    location: '',
    website: '',
    genre: '',
    socials: {
      soundcloud: '',
      instagram: '',
      twitter: '',
      spotify: ''
    }
  });

  // Image state with more comprehensive tracking
  const [profileImageState, setProfileImageState] = useState<ImageUploadState>({
    file: null,
    preview: '',
    isUploading: false,
    progress: 0,
    error: null
  });

  const [coverImageState, setCoverImageState] = useState<ImageUploadState>({
    file: null,
    preview: '',
    isUploading: false,
    progress: 0,
    error: null
  });
  
  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setProfileForm({
        username: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        genre: user.genre || '',
        socials: {
          soundcloud: user.socials?.soundcloud || '',
          instagram: user.socials?.instagram || '',
          twitter: user.socials?.twitter || '',
          spotify: user.socials?.spotify || ''
        }
      });

      // Set profile image preview if available
      if (user.profilePictureUrl) {
        setProfileImageState(prev => ({ 
          ...prev, 
          preview: `${user.profilePictureUrl}?t=${Date.now()}` // Add timestamp to prevent caching
        }));
      } else if (user.avatar) { // Fallback to avatar for preview if profilePictureUrl is not set
        setProfileImageState(prev => ({ 
          ...prev, 
          preview: `${user.avatar}?t=${Date.now()}`
        }));
      }
      
      // Set cover image preview if available
      if (user.coverImageUrl) {
        setCoverImageState(prev => ({ 
          ...prev, 
          preview: `${user.coverImageUrl}?t=${Date.now()}` // Add timestamp to prevent caching
        }));
      }
    }
  }, [user]);
  
  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties like socials.soundcloud
      const [parent, child] = name.split('.');
      setProfileForm(prev => {
        if (parent === 'socials') {
          return {
            ...prev,
            socials: {
              ...prev.socials,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setProfileForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Handle profile image change
  const handleProfileImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Reset any previous errors
      setProfileImageState(prev => ({
        ...prev,
        error: null
      }));
      
      const result: ImageValidationResult = await validateImage(e.target.files[0]);
      
      if (!result.isValid) {
        setProfileImageState(prev => ({
          ...prev,
          error: result.error || 'Invalid image'
        }));
        toast.error(result.error);
        return;
      }
      
      setProfileImageState(prev => ({
        ...prev,
        file: result.file!,
        preview: result.preview!
      }));
    }
  };

  // Handle cover image change
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      // Reset any previous errors
      setCoverImageState(prev => ({
        ...prev,
        error: null
      }));

      const result: ImageValidationResult = await validateImage(e.target.files[0]);
      
      if (!result.isValid) {
        setCoverImageState(prev => ({
          ...prev,
          error: result.error || 'Invalid image'
        }));
        toast.error(result.error);
        return;
      }
      
      setCoverImageState(prev => ({
        ...prev,
        file: result.file!,
        preview: result.preview!
      }));
    }
  };

  // Function to upload a single image with proper error handling
  const uploadSingleImage = async (
    imageState: ImageUploadState,
    setImageState: React.Dispatch<React.SetStateAction<ImageUploadState>>,
    endpoint: string,
    fieldName: string,
    oldImageUrl?: string
  ): Promise<string | null> => {
    if (!imageState.file || !token) {
      return null;
    }

    try {
      setImageState(prev => ({ ...prev, isUploading: true, error: null }));
      
      // Clean up old image if it exists
      if (oldImageUrl) {
        const fullCleanupUrl = oldImageUrl.startsWith('http') 
          ? oldImageUrl 
          : `${API_URL}${oldImageUrl}`;
        
        try {
          await cleanupOldImage(fullCleanupUrl, token);
        } catch (cleanupErr) {
          console.warn('Failed to clean up old image, but will continue with upload:', cleanupErr);
          // We don't want to fail the whole upload if cleanup fails
        }
      }

      // Log the upload request
      console.log(`Uploading ${fieldName} to ${endpoint}`, { 
        fileSize: imageState.file.size, 
        fileType: imageState.file.type 
      });

      // Upload the new image
      const response = await uploadImage(
        imageState.file,
        endpoint,
        token,
        fieldName,
        (progress) => setImageState(prev => ({ ...prev, progress }))
      );

      console.log(`${fieldName} upload response:`, response);

      // Check for expected response structure
      const url = fieldName === 'profileImage' 
        ? response.profilePictureUrl 
        : response.coverImageUrl;

      if (!url) {
        throw new Error(`${fieldName === 'profileImage' ? 'Profile' : 'Cover'} image upload succeeded but no URL was returned`);
      }

      // Success!
      if (response.message) {
        toast.success(response.message);
      }

      return url;
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Failed to upload ${fieldName === 'profileImage' ? 'profile' : 'cover'} image`;
      
      console.error(`Error uploading ${fieldName}:`, err);
      setImageState(prev => ({ ...prev, error: errorMessage }));
      toast.error(errorMessage);
      return null;
    } finally {
      setImageState(prev => ({ ...prev, isUploading: false, progress: 0 }));
    }
  };
  
  // Handle profile update with better parallel image uploads
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveSuccess(false);
    setMessage(null);
    
    // Track any errors that occur during the update process
    let hasErrors = false;
    
    // Create an object to hold the profile data we'll send
    const profileUpdateData: any = {
      username: profileForm.username,
      bio: profileForm.bio,
      location: profileForm.location,
      website: profileForm.website,
      genre: profileForm.genre,
      socials: profileForm.socials
    };

    try {
      // Handle image uploads in parallel for better performance
      const uploadPromises: Promise<void>[] = [];
      
      // Only attempt profile image upload if a new file is selected
      if (profileImageState.file) {
        const profileUploadPromise = (async () => {
          const profileUrl = await uploadSingleImage(
            profileImageState,
            setProfileImageState,
            `${API_URL}/users/profile-picture`,
            'profileImage',
            user?.profilePictureUrl
          );
          
          if (profileUrl) {
            profileUpdateData.profilePictureUrl = profileUrl;
          } else {
            hasErrors = true;
          }
        })();
        
        uploadPromises.push(profileUploadPromise);
      }
      
      // Only attempt cover image upload if a new file is selected
      if (coverImageState.file) {
        const coverUploadPromise = (async () => {
          const coverUrl = await uploadSingleImage(
            coverImageState,
            setCoverImageState,
            `${API_URL}/users/cover-image`,
            'coverImage',
            user?.coverImageUrl
          );
          
          if (coverUrl) {
            profileUpdateData.coverImageUrl = coverUrl;
          } else {
            hasErrors = true;
          }
        })();
        
        uploadPromises.push(coverUploadPromise);
      }
      
      // Wait for all image uploads to complete
      await Promise.all(uploadPromises);
      
      // If there were errors during image uploads, don't proceed with profile update
      if (hasErrors) {
        throw new Error('One or more image uploads failed. Please check and try again.');
      }
      
      // Log what we're about to send to the server
      console.log('Sending profile update data:', profileUpdateData);
      
      // Add a timestamp parameter to force profile reload when returning to profile page
      localStorage.setItem('profileUpdateTimestamp', Date.now().toString());
      
      // Send the profile update request
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profileUpdateData)
      });
      
      const data = await response.json();
      
      // Check if the update was successful
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }
      
      // Show success feedback
      toast.success('Profile updated successfully!');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setSaveSuccess(true);
      
      // Reset the file inputs since the uploads were successful
      if (profileImageState.file) {
        setProfileImageState(prev => ({ ...prev, file: null }));
      }
      
      if (coverImageState.file) {
        setCoverImageState(prev => ({ ...prev, file: null }));
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while updating your profile';
        
      console.error('Profile update error:', err);
      toast.error(errorMessage);
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            
            {message && (
              <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                {message.text}
              </div>
            )}
            
            <form onSubmit={handleProfileUpdate}>
              <div className="relative p-8 rounded-xl overflow-hidden backdrop-blur-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
                {/* Glassmorphic glow effects */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-pink-500/10" />
                <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" />
                
                {/* Content */}
                <div className="relative space-y-6">
                  {/* Profile Image Upload */}
                  <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10 relative group">
                      {profileImageState.isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                          <Loader className="animate-spin h-6 w-6 text-blue-400" />
                        </div>
                      )}
                      <img
                        src={profileImageState.preview || "https://api.dicebear.com/7.x/avataaars/svg?seed=John"}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-2">
                        <Camera className="h-5 w-5 text-white/80" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleProfileImageChange}
                        className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      />
                      {profileImageState.progress > 0 && profileImageState.progress < 100 && (
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                          <div 
                            className="bg-blue-500 h-1.5 rounded-full" 
                            style={{ width: `${profileImageState.progress}%` }}
                          ></div>
                        </div>
                      )}
                      <div className="mt-1 px-3 py-2 bg-blue-500/10 border border-blue-400/20 rounded-md">
                        <p className="text-sm font-medium text-blue-400">Recommended: 300×300 pixels (square)</p>
                        <p className="text-sm text-gray-400">Formats: JPEG, PNG, WebP | Max size: 5MB</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Cover Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cover Image</label>
                    <div className="relative rounded-lg overflow-hidden mb-2">
                      {coverImageState.preview && (
                        <>
                          {coverImageState.isUploading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
                              <Loader className="animate-spin h-6 w-6 text-purple-400" />
                            </div>
                          )}
                          <div className="h-32">
                            <img 
                              src={coverImageState.preview} 
                              alt="Cover Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverImageChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    />
                    {coverImageState.progress > 0 && coverImageState.progress < 100 && (
                      <div className="mt-2 w-full bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-purple-500 h-1.5 rounded-full" 
                          style={{ width: `${coverImageState.progress}%` }}
                        ></div>
                      </div>
                    )}
                    <div className="mt-1 px-3 py-2 bg-purple-500/10 border border-purple-400/20 rounded-md">
                      <p className="text-sm font-medium text-purple-400">Recommended: 1400×400 pixels (banner)</p>
                      <p className="text-sm text-gray-400">Formats: JPEG, PNG, WebP | Max size: 5MB</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                    <input
                      type="text"
                      name="username"
                      value={profileForm.username}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      placeholder="Your display name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Bio</label>
                    <textarea
                      name="bio"
                      value={profileForm.bio}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      rows={3}
                      placeholder="Tell us about yourself"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={profileForm.location}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      placeholder="City, Country"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                    <input
                      type="text"
                      name="website"
                      value={profileForm.website}
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-300">Music Genres</label>
                    </div>
                    <input
                      type="text"
                      value={profileForm.genre}
                      onChange={handleInputChange}
                      name="genre"
                      className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                      placeholder="e.g. Electronic, Hip-hop, Jazz"
                    />
                  </div>
                  
                  <div className="border-t border-white/10 pt-4">
                    <h3 className="text-lg font-medium text-white mb-3">Social Media Profiles</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">SoundCloud</label>
                        <input
                          type="text"
                          name="socials.soundcloud"
                          value={profileForm.socials.soundcloud}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your SoundCloud username"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                        <input
                          type="text"
                          name="socials.instagram"
                          value={profileForm.socials.instagram}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your Instagram handle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Twitter</label>
                        <input
                          type="text"
                          name="socials.twitter"
                          value={profileForm.socials.twitter}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your Twitter handle"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Spotify</label>
                        <input
                          type="text"
                          name="socials.spotify"
                          value={profileForm.socials.spotify}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your Spotify artist name"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit" 
                      disabled={loading || profileImageState.isUploading || coverImageState.isUploading}
                      className={`w-full ${
                        saveSuccess 
                          ? 'bg-green-500/80 hover:bg-green-600' 
                          : 'bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500'
                      } px-6 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm flex items-center justify-center text-white`}
                    >
                      {loading ? (
                        <>
                          <Loader className="animate-spin h-4 w-4 mr-2" />
                          Updating...
                        </>
                      ) : saveSuccess ? (
                        'Profile Updated Successfully!'
                      ) : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Tournament Updates</span>
                  <span className="text-sm text-gray-400">Get notified about tournament status changes</span>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    emailNotifications ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">New Messages</span>
                  <span className="text-sm text-gray-400">Receive notifications for new messages</span>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    pushNotifications ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Audio Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <label className="block text-sm font-medium text-gray-300 mb-2">Player Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{volume}%</div>
              </div>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Language Settings</h2>
            <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-gray-700/30 rounded-lg p-6 backdrop-blur-sm">
            <p className="text-white">Select a category from the sidebar to get started.</p>
          </div>
        );
    }
  };  

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[1400px] mt-[-100px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6">
          {/* Title section */}
          <div className="mb-8">
            <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">Settings</h1>
            <p className="text-gray-400">Customize your MusikMadness experience</p>
          </div>

          {/* Settings grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Profile Settings */}
            <div 
              onClick={() => setActiveTab('profile')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'profile' ? 'border-blue-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Profile</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your account information</p>
                </div>
              </div>
            </div>
            
            {/* Notification Settings */}
            <div 
              onClick={() => setActiveTab('notifications')} 
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'notifications' ? 'border-pink-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mr-4">
                  <Bell className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Notifications</h2>
                  <p className="text-sm text-gray-400 mt-1">Configure your notification preferences</p>
                </div>
              </div>
            </div>
            
            {/* Audio Settings */}
            <div 
              onClick={() => setActiveTab('audio')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'audio' ? 'border-purple-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
                  <Headphones className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Audio</h2>
                  <p className="text-sm text-gray-400 mt-1">Customize your sound settings</p>
                </div>
              </div>
            </div>
            
            {/* Language Settings */}
            <div 
              onClick={() => setActiveTab('language')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'language' ? 'border-green-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Language</h2>
                  <p className="text-sm text-gray-400 mt-1">Change your language preferences</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content section */}
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
