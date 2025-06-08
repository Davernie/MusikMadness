import React, { useState, useEffect } from 'react';
import { Bell, Lock, User, Headphones, Monitor, Loader, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateImage, uploadImage, type ImageValidationResult } from '../utils/imageHandling';
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
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);  const { user, token } = useAuth();
  const API_URL = API_BASE_URL;
  
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
      }      // Set cover image preview if available
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
    fieldName: string
  ): Promise<string | null> => {
    if (!imageState.file || !token) {
      return null;
    }    try {
      setImageState(prev => ({ ...prev, isUploading: true, error: null }));
      
      // Note: The backend automatically handles replacing old images when new ones are uploaded
      // so we don't need to explicitly delete old images
      
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
      }      // Success! (Don't show individual toast here, we'll show a consolidated message later)
      return url;    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : `Failed to upload ${fieldName === 'profileImage' ? 'profile' : 'cover'} image`;
      
      console.error(`Error uploading ${fieldName}:`, err);
      setImageState(prev => ({ ...prev, error: errorMessage }));
      // Note: Error toast will be shown by the calling function
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
    
    // Track image upload results and any errors
    let hasImageUploadErrors = false;
    let successfulUploads: string[] = [];    // Create an object to hold the profile data we'll send
    const profileUpdateData: any = {};
    
    // Only add fields that have actual values
    if (profileForm.bio?.trim()) {
      profileUpdateData.bio = profileForm.bio.trim();
    }
    
    if (profileForm.location?.trim()) {
      profileUpdateData.location = profileForm.location.trim();
    }
    
    if (profileForm.website?.trim()) {
      profileUpdateData.website = profileForm.website.trim();
    }
    
    // Only add genres if there's a value
    if (profileForm.genre?.trim()) {
      profileUpdateData.genres = [profileForm.genre.trim()];
    }
    
    // Only add socials if any have values
    const socials: any = {};
    let hasSocials = false;
    
    if (profileForm.socials.soundcloud?.trim()) {
      socials.soundcloud = profileForm.socials.soundcloud.trim();
      hasSocials = true;
    }
    
    if (profileForm.socials.instagram?.trim()) {
      socials.instagram = profileForm.socials.instagram.trim();
      hasSocials = true;
    }
    
    if (profileForm.socials.twitter?.trim()) {
      socials.twitter = profileForm.socials.twitter.trim();
      hasSocials = true;
    }
    
    if (profileForm.socials.spotify?.trim()) {
      socials.spotify = profileForm.socials.spotify.trim();
      hasSocials = true;
    }
    
    if (hasSocials) {
      profileUpdateData.socials = socials;
    }

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
            'profileImage'
          );
          
          if (profileUrl) {
            profileUpdateData.profilePictureUrl = profileUrl;
            successfulUploads.push('profile picture');
          } else {
            hasImageUploadErrors = true;
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
            'coverImage'
          );
          
          if (coverUrl) {
            profileUpdateData.coverImageUrl = coverUrl;
            successfulUploads.push('cover image');
          } else {
            hasImageUploadErrors = true;
          }
        })();
        
        uploadPromises.push(coverUploadPromise);
      }
      
      // Wait for all image uploads to complete
      await Promise.all(uploadPromises);
        // If there were errors during image uploads, don't proceed with profile update
      if (hasImageUploadErrors) {
        // Show error message for any failed uploads (but success message will be shown at the end if any succeeded)
        throw new Error('One or more image uploads failed. Please check the errors above and try again.');
      }
      
      // Note: We'll show success message for image uploads at the end with the profile update
      
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
        // Profile update failed, but images may have uploaded successfully
        let errorMessage = data.message || 'Failed to update profile data';
        
        if (successfulUploads.length > 0) {
          errorMessage += `. Note: Your ${successfulUploads.join(' and ')} uploaded successfully, but profile data update failed.`;
        }
        
        throw new Error(errorMessage);
      }
      
      // Complete success!
      const successMessage = successfulUploads.length > 0 
        ? `Profile and ${successfulUploads.join(' and ')} updated successfully!`
        : 'Profile updated successfully!';
      
      toast.success(successMessage);
      setMessage({ type: 'success', text: successMessage });
      setSaveSuccess(true);
      
      // Reset the file inputs since everything was successful
      if (profileImageState.file) {
        setProfileImageState(prev => ({ ...prev, file: null }));
      }
      
      if (coverImageState.file) {
        setCoverImageState(prev => ({ ...prev, file: null }));
      }    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'An error occurred while updating your profile';
      
      // Create a consolidated message that includes both successes and failures
      let finalMessage = errorMessage;
      if (successfulUploads.length > 0) {
        finalMessage = `Successfully uploaded: ${successfulUploads.join(' and ')}. However, ${errorMessage.toLowerCase()}`;
      }
        
      console.error('Profile update error:', err);
      toast.error(finalMessage);
      setMessage({ type: 'error', text: finalMessage });
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
                          <div className="w-full aspect-[3.5/1] bg-gray-800/40">
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
                      </div>                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Instagram</label>
                        {isInstagramConnected && instagramData ? (
                          // Connected state
                          <div className="bg-green-500/10 border border-green-400/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <CheckCircle className="h-5 w-5 text-green-400" />
                                <div>
                                  <p className="text-sm font-medium text-green-400">
                                    @{instagramData.username}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {instagramData.accountType} • {instagramData.mediaCount} posts
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <a
                                  href={`https://instagram.com/${instagramData.username}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-gray-400 hover:text-white transition-colors"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                                <button
                                  onClick={disconnectInstagram}
                                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                                >
                                  Disconnect
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          // Not connected state
                          <button
                            onClick={connectInstagram}
                            disabled={isConnectingInstagram}
                            className={`w-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-400/30 rounded-lg py-3 px-4 flex items-center justify-center space-x-2 hover:from-pink-500/30 hover:to-purple-500/30 transition-all duration-300 ${
                              isConnectingInstagram ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            {isConnectingInstagram ? (
                              <Loader className="animate-spin h-4 w-4 text-pink-400" />
                            ) : (
                              <Instagram className="h-4 w-4 text-pink-400" />
                            )}
                            <span className="text-pink-400 font-medium">
                              {isConnectingInstagram ? 'Connecting...' : 'Connect Instagram'}
                            </span>
                          </button>
                        )}
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
      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Billing & Payments</h2>
            <div className="space-y-4">
              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
                <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-blue-600" viewBox="0 0 48 48" fill="none">
                        <path d="M44 11H4V37H44V11Z" fill="#E1E1E1"/>
                        <path d="M19 24C19 20.134 22.134 17 26 17C29.866 17 33 20.134 33 24C33 27.866 29.866 31 26 31C22.134 31 19 27.866 19 24Z" fill="#FFA726"/>
                        <path d="M25 24C25 22.343 26.343 21 28 21C29.657 21 31 22.343 31 24C31 25.657 29.657 27 28 27C26.343 27 25 25.657 25 24Z" fill="#FF9800"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Mastercard ending in 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Edit
                  </button>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 px-6 py-2 rounded-lg font-medium transition-all duration-300">
                  Add Payment Method
                </button>
              </div>

              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Subscription</h3>
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-white font-medium">Pro Plan</p>
                      <p className="text-sm text-gray-400">Billed monthly</p>
                    </div>
                    <span className="text-white font-bold">$9.99/mo</span>
                  </div>
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-lg text-white transition-colors">
                      Change Plan
                    </button>
                    <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-red-400 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Billing History</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-800/40 rounded-lg">
                    <div>
                      <p className="text-white">April 2025</p>
                      <p className="text-sm text-gray-400">Pro Plan Monthly</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      Download
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-800/40 rounded-lg">
                    <div>
                      <p className="text-white">March 2025</p>
                      <p className="text-sm text-gray-400">Pro Plan Monthly</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Security Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-6 py-2 rounded-md font-medium transition-all duration-300">
                    Update Password
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-white">Two-Factor Authentication</span>
                    <span className="text-sm text-gray-400">Add an extra layer of security</span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-4 py-2 rounded-md font-medium transition-all duration-300">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">User Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Private Profile</span>
                  <span className="text-sm text-gray-400">Only registered users can view your profile</span>
                </div>
                <button
                  onClick={() => {}}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-600"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Show Tournament History</span>
                  <span className="text-sm text-gray-400">Display your past tournament participation</span>
                </div>
                <button
                  onClick={() => {}}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-500"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
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

            {/* Billing Settings */}
            <div 
              onClick={() => setActiveTab('billing')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'billing' ? 'border-red-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center mr-4">
                  <Monitor className="h-5 w-5 text-red-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Billing</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your payment methods and subscription</p>
                </div>
              </div>
            </div>
            
            {/* Security Settings */}
            <div 
              onClick={() => setActiveTab('security')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'security' ? 'border-orange-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center mr-4">
                  <Lock className="h-5 w-5 text-orange-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Security</h2>
                  <p className="text-sm text-gray-400 mt-1">Update your password and security settings</p>
                </div>
              </div>
            </div>
            
            {/* Preferences Settings */}
            <div 
              onClick={() => setActiveTab('preferences')}
              className={`bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border ${
                activeTab === 'preferences' ? 'border-teal-500/50' : 'border-white/10'
              } hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Preferences</h2>
                  <p className="text-sm text-gray-400 mt-1">Set your user preferences</p>
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
