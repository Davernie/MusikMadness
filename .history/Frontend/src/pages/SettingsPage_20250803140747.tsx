import React, { useState, useEffect } from 'react';
import { User, Loader, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { validateImage, uploadImage, type ImageValidationResult } from '../utils/imageHandling';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

// Memoized title components for optimal scrolling performance
const PageTitle = React.memo(({ children }: { children: React.ReactNode }) => (
  <div 
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform'
    }}
  >
    <div style={{ contain: 'layout style' }}>
      <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">
        {children}
      </h1>
    </div>
  </div>
), () => true);

const SectionTitle = React.memo(({ children }: { children: React.ReactNode }) => (
  <div 
    style={{
      contain: 'layout style paint',
      transform: 'translate3d(0,0,0)',
      isolation: 'isolate',
      willChange: 'transform'
    }}
  >
    <div style={{ contain: 'layout style' }}>
      <h2 className="text-2xl font-bold text-white">
        {children}
      </h2>
    </div>
  </div>
), () => true);

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
    youtube: string;
    twitch: string;
    kick: string;
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
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { user, token, updateUserProfile } = useAuth();
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
      spotify: '',
      youtube: '',
      twitch: '',
      kick: ''
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
        username: user.username || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        genre: user.genre || '',
        socials: {
          soundcloud: user.socials?.soundcloud || '',
          instagram: user.socials?.instagram || '',
          twitter: user.socials?.twitter || '',
          spotify: user.socials?.spotify || '',
          youtube: user.socials?.youtube || '',
          twitch: user.socials?.twitch || '',
          kick: user.socials?.kick || ''
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
      const file = e.target.files[0];
      
      // Validate image (this is async)
      const validation: ImageValidationResult = await validateImage(file);
      if (!validation.isValid) {
        setProfileImageState(prev => ({ ...prev, error: validation.error || 'Invalid image' }));
        return;
      }
      
      // Set file and preview
      const previewUrl = URL.createObjectURL(file);
      setProfileImageState(prev => ({
        ...prev,
        file,
        preview: previewUrl,
        error: null
      }));
    }
  };

  // Handle cover image change
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate image (this is async)
      const validation: ImageValidationResult = await validateImage(file);
      if (!validation.isValid) {
        setCoverImageState(prev => ({ ...prev, error: validation.error || 'Invalid image' }));
        return;
      }
      
      // Set file and preview
      const previewUrl = URL.createObjectURL(file);
      setCoverImageState(prev => ({
        ...prev,
        file,
        preview: previewUrl,
        error: null
      }));
    }
  };

  // Upload a single image
  const uploadSingleImage = async (
    imageState: ImageUploadState,
    setImageState: React.Dispatch<React.SetStateAction<ImageUploadState>>,
    endpoint: string,
    fieldName: string
  ): Promise<string | null> => {
    if (!imageState.file || !token) return null;

    setImageState(prev => ({ ...prev, isUploading: true, progress: 0, error: null }));

    try {
      const uploadResult = await uploadImage(
        imageState.file,
        `${API_URL}${endpoint}`,
        token,
        fieldName,
        (progress: number) => {
          setImageState(prev => ({ ...prev, progress }));
        }
      );

      if (uploadResult && (uploadResult.profilePictureUrl || uploadResult.coverImageUrl)) {
        const imageUrl = uploadResult.profilePictureUrl || uploadResult.coverImageUrl;
        setImageState(prev => ({ 
          ...prev, 
          isUploading: false, 
          progress: 100,
          preview: `${imageUrl}?t=${Date.now()}` // Update preview with new URL
        }));
        return imageUrl;
      } else {
        throw new Error(`Failed to upload ${fieldName}`);
      }
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      const errorMessage = error instanceof Error ? error.message : `Failed to upload ${fieldName}`;
      setImageState(prev => ({ ...prev, isUploading: false, error: errorMessage }));
      throw error;
    }
  };

  // Handle profile update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setMessage(null);
    setSaveSuccess(false);

    try {
      let updateData = { ...profileForm };

      // Upload profile image if selected
      if (profileImageState.file) {
        try {
          await uploadSingleImage(
            profileImageState,
            setProfileImageState,
            '/users/profile-picture',
            'profile picture'
          );
        } catch (error) {
          console.error('Profile picture upload failed:', error);
          // Don't stop the entire update process for image upload failure
        }
      }

      // Upload cover image if selected
      if (coverImageState.file) {
        try {
          await uploadSingleImage(
            coverImageState,
            setCoverImageState,
            '/users/cover-image',
            'cover image'
          );
        } catch (error) {
          console.error('Cover image upload failed:', error);
          // Don't stop the entire update process for image upload failure
        }
      }

      // Update profile data
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update the auth context with the new user data
      if (updateUserProfile) {
        updateUserProfile(updatedUser);
      }

      // Clear file selections after successful upload
      setProfileImageState(prev => ({ ...prev, file: null }));
      setCoverImageState(prev => ({ ...prev, file: null }));

      setSaveSuccess(true);
      toast.success('Profile updated successfully!');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Reset success state after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false);
        setMessage(null);
      }, 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      let finalMessage = 'Failed to update profile';
      
      if (error instanceof Error) {
        finalMessage = error.message;
      } else if (typeof error === 'string') {
        finalMessage = error;
      }

      toast.error(finalMessage);
      setMessage({ type: 'error', text: finalMessage });
    } finally {
      setLoading(false);
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
            <PageTitle>Settings</PageTitle>
            <p className="text-gray-400">Customize your MusikMadness experience</p>
          </div>

          {/* Profile Settings Card */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-blue-500/50 mb-8">
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

          {/* Profile Content */}
          <div className="space-y-6">
            <SectionTitle>Profile Settings</SectionTitle>
            
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
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">YouTube</label>
                        <input
                          type="text"
                          name="socials.youtube"
                          value={profileForm.socials.youtube}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your YouTube channel"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Twitch</label>
                        <input
                          type="text"
                          name="socials.twitch"
                          value={profileForm.socials.twitch}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your Twitch username"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Kick</label>
                        <input
                          type="text"
                          name="socials.kick"
                          value={profileForm.socials.kick}
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                          placeholder="Your Kick username"
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

          {/* Future tabs can be added here */}
          {/* 
          Example structure for future additions:
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer">
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
          </div>
          */}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
