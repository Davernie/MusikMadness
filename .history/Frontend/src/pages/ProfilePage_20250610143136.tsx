import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Trophy, Heart, Share, Camera, Loader, MapPin, Calendar, ExternalLink } from 'lucide-react';
import { mockTournaments } from '../utils/mockData';
import SubmissionsTab from '../components/profile/SubmissionsTab';
import TournamentsTab from '../components/profile/TournamentsTab';
import StatsTab from '../components/profile/StatsTab';
import { ProfileData } from '../types/profile';
import { useAuth } from '../context/AuthContext';
import defaultAvatar from '../assets/images/default-avatar.png'; // Import default avatar
import { API_BASE_URL } from '../config/api';
import defaultCoverImage from '../assets/images/default-cover.jpeg'; // Import default cover
import { toast } from 'react-toastify';

// Animation utility - OPTIMIZED for better performance
const AnimatedCounter = React.memo(({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const hasAnimatedRef = useRef(false);

  React.useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation
      const easedProgress = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const currentValue = Math.round(value * easedProgress);
      
      setDisplayValue(currentValue);
      
      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    };
    
    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimatedRef.current) {
          hasAnimatedRef.current = true;
          animationFrameRef.current = requestAnimationFrame(animate);
          // Disconnect after starting animation to prevent re-triggering
          observerRef.current?.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    
    if (counterRef.current) {
      observerRef.current.observe(counterRef.current);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [value]);
  
  return <span ref={counterRef}>{displayValue.toLocaleString()}</span>;
});

const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [activeTab, setActiveTab] = useState("submissions");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Add state for profile image upload
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean>(false);
  const [isCoverUploading, setIsCoverUploading] = useState<boolean>(false);
  const [coverUploadSuccess, setCoverUploadSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);
  const { user, token, isAuthenticated, updateProfilePictureUrl, updateCoverImageUrl } = useAuth();
  const navigate = useNavigate();
  
  const API_URL = API_BASE_URL;

  // Share profile function
  const handleShareProfile = async () => {
    try {
      const profileUrl = `${window.location.origin}/profile/${profile?.id || id}`;
      
      // Try to use the modern Clipboard API
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(profileUrl);
        toast.success('Profile link copied to clipboard!');
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          document.execCommand('copy');
          toast.success('Profile link copied to clipboard!');
        } catch (err) {
          toast.error('Failed to copy link. Please copy manually: ' + profileUrl);
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      toast.error('Failed to copy profile link');
    }
  };
  const isOwnProfile = !id || (isAuthenticated && user?.id === id);
  
  // Handle click on profile picture
  const handleProfileImageClick = () => {
    if (isOwnProfile && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleAvatarUpload(file);
    }
  };
  
  // Upload the profile image to the server
  const handleAvatarUpload = async (file: File) => {
    if (!token) return;
    
    try {
      setIsUploading(true);
      
      const formData = new FormData();
      formData.append('profileImage', file);
      
      const response = await fetch(`${API_URL}/users/profile-picture`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload profile picture');
      }
      
      // Update the profile with the new image URL
      if (profile) {
        setProfile({
          ...profile,
          avatar: data.profilePictureUrl // Use direct URL from response
        });
      }
      // Update AuthContext
      updateProfilePictureUrl(data.profilePictureUrl);
      
      // Show success feedback
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading profile picture:', err);
    } finally {
      setIsUploading(false);
      
      // Force a refresh of the profile data
      const timestamp = new Date().getTime();
      localStorage.setItem('profileUpdateTimestamp', timestamp.toString());
    }
  };

  // Handle click on cover image
  const handleCoverImageClick = () => {
    if (isOwnProfile && coverFileInputRef.current) {
      coverFileInputRef.current.click();
    }
  };
  
  // Handle cover file selection
  const handleCoverFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      await handleCoverImageUpload(file);
    }
  };
  
  // Upload the cover image to the server
  const handleCoverImageUpload = async (file: File) => {
    if (!token) return;
    
    try {
      setIsCoverUploading(true);
      
      const formData = new FormData();
      formData.append('coverImage', file);
      
      const response = await fetch(`${API_URL}/users/cover-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload cover image');
      }
      
      // Update the profile with the new cover image URL
      if (profile) {
        setProfile({
          ...profile,
          coverImage: data.coverImageUrl // Use direct URL from response
        });
      }
      // Update AuthContext
      updateCoverImageUrl(data.coverImageUrl);
      
      // Show success feedback
      setCoverUploadSuccess(true);
      setTimeout(() => setCoverUploadSuccess(false), 3000);
    } catch (err) {
      console.error('Error uploading cover image:', err);
    } finally {
      setIsCoverUploading(false);
      
      // Force a refresh of the profile data
      const timestamp = new Date().getTime();
      localStorage.setItem('profileUpdateTimestamp', timestamp.toString());
    }
  };
  // Fetch profile data - either for the current user or the specified user by ID
  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let profileId = id;
        
        if (!profileId && isAuthenticated && user) {
          profileId = user.id;
        }
        
        // If no ID in URL and user not authenticated, redirect to login
        if (!profileId && !isAuthenticated) {
          navigate('/login', { state: { from: '/profile' } });
          return;
        }

        if (!profileId) {
          setLoading(false);
          // Potentially set an error or wait for user context to update
          console.warn("ProfilePage: profileId is undefined, cannot fetch data yet.");
          // You might want to show a specific loading state or message here
          // or rely on the user object update to re-trigger the effect.
          return;
        }
        
        const response = await fetch(`${API_URL}/users/${profileId}`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch profile data');
        }
        
        const userData = await response.json();
        console.log("Profile data received:", userData);        // Transform API data to match ProfileData structure
        const profileData: ProfileData = {
          id: userData._id,
          name: userData.username,
          username: userData.username.toLowerCase().replace(/\s+/g, ''),
          bio: userData.bio || 'No bio available',
          avatar: userData.profilePictureUrl || defaultAvatar, // Use default if no URL
          coverImage: userData.coverImageUrl || defaultCoverImage, // Use default if no URL
          genres: userData.genres || ['Electronic', 'House'],
          location: userData.location || 'Unknown',
          website: userData.website || '',
          isCreator: userData.isCreator || false,
          socials: {
            soundcloud: userData.socials?.soundcloud || '',
            instagram: userData.socials?.instagram || '',
            twitter: userData.socials?.twitter || '',
            spotify: userData.socials?.spotify || ''
          },
          stats: {
            tournamentsEntered: userData.stats?.tournamentsEntered || 0,
            tournamentsWon: userData.stats?.tournamentsWon || 0,
            tournamentsCreated: userData.stats?.tournamentsCreated || 0,
            followers: userData.stats?.followers || 0
          }
        };
        
        setProfile(profileData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message || 'Error loading profile data');
        
        // For demo purposes, fallback to mock data if API fails        // For demo purposes, fallback to mock data if API fails
        // In a production app, you'd handle this differently
        setProfile({
          id: id || '1',
          name: 'Alex Johnson',
          username: 'alexjmusic',
          bio: 'Electronic music producer and DJ. Winner of Summer Beat Battle 2024.',
          avatar: defaultAvatar, // Use default
          coverImage: defaultCoverImage, // Use default
          genres: ['Electronic', 'House', 'Techno'],
          location: 'Los Angeles, CA',
          website: 'alexjmusic.com',
          isCreator: false,
          socials: {
            soundcloud: 'alexjmusic',
            instagram: 'alexjmusic',
            twitter: 'alexjmusic',
            spotify: 'alexjmusic'
          },
          stats: {
            tournamentsEntered: 12,
            tournamentsWon: 3,
            tournamentsCreated: 2,
            followers: 1250
          }
        });
      } finally {
        setLoading(false);
      }
    };    
    fetchProfileData();
    
    // Listen for profile updates from settings page
    const handleProfileUpdate = () => {
      setRefreshTrigger(prev => prev + 1);
      fetchProfileData();
    };
    
    window.addEventListener('profileUpdated', handleProfileUpdate);
    
    // Clear the update timestamp after using it
    localStorage.removeItem('profileUpdateTimestamp');
    
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, [id, user, isAuthenticated, token, navigate, refreshTrigger]);
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mx-auto"></div>
          <p className="mt-4 text-cyan-400/70">Loading profile...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error && !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Error: {error}</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-cyan-500 text-white px-4 py-2 rounded-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center text-red-500">
          <p>Profile not found</p>
          <button 
            onClick={() => navigate('/')}
            className="mt-4 bg-cyan-500 text-white px-4 py-2 rounded-lg"
          >
            Return to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Filter tournaments for those the user has participated in
  const participatedTournaments = mockTournaments.filter(t => 
    t.participants.some(p => p.username === profile.username)
  );
  
  // Filter tournaments for those the user has created
  const createdTournaments = mockTournaments.filter(t => 
    t.organizer.name === profile.name
  ).slice(0, 2);

  // Mock submissions
  const submissions = [
    {
      id: '1',
      title: 'Neon Dreams',
      tournamentId: '1',
      tournamentName: 'Summer Beat Battle 2025',
      date: '2025-05-15',
      genre: 'Electronic',
      plays: 432,
      likes: 87,
      rank: 1
    },
    {
      id: '2',
      title: 'Midnight Run',
      tournamentId: '3',
      tournamentName: 'Producer Showcase 2025',
      date: '2025-03-10',
      genre: 'House',
      plays: 256,
      likes: 45,
      rank: 5
    },
    {
      id: '3',
      title: 'Urban Jungle',
      tournamentId: '5',
      tournamentName: 'Electronic Music Awards',
      date: '2025-01-22',
      genre: 'Techno',
      plays: 321,
      likes: 63,
      rank: 3
    }
  ];

  return (
    <div className="min-h-screen flex flex-col items-center py-1 px-4 space-y-8">
      {/* Container to ensure consistent width */}
      <div className="w-full max-w-[1400px] space-y-8">
        {/* Banner Card - Separated as its own component */}
        <div className="w-full relative rounded-2xl overflow-hidden border border-cyan-500/30">
          {/* Cover Image with Profile Info */}
          <div className="h-80 md:h-96 w-full overflow-hidden relative">
            <input 
              type="file"
              ref={coverFileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleCoverFileChange}
            />
              {/* Cover image with dark overlay for text readability */}
            <div 
              className={`w-full h-full relative ${isOwnProfile ? 'cursor-pointer' : ''}`}
              onClick={isOwnProfile ? handleCoverImageClick : undefined}
            >
              <img 
                src={profile.coverImage ? `${profile.coverImage}${profile.coverImage.startsWith('http') ? '' : '?t=' + new Date().getTime()}` : defaultCoverImage}
                alt="Cover"
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error('Cover image failed to load:', profile.coverImage);
                  e.currentTarget.src = defaultCoverImage;
                }}
              />
              {/* Dark gradient overlay to ensure text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20"></div>
              
              {isCoverUploading && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-10">
                  <Loader className="animate-spin h-8 w-8 text-cyan-400" />
                </div>
              )}
              {coverUploadSuccess && (
                <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center z-10">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
              {/* Profile Info with enhanced text readability */}
            <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10 z-20">
              <div className="flex flex-col md:flex-row items-end md:items-end gap-8">
                {/* Avatar with glowing effect */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div 
                    className={`w-28 h-28 md:w-32 md:h-32 bg-black relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl z-10 ${isOwnProfile ? 'cursor-pointer' : ''}`}
                    onClick={isOwnProfile ? handleProfileImageClick : undefined}
                  >
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20">
                        <Loader className="animate-spin h-6 w-6 text-cyan-400" />
                      </div>
                    )}
                    {uploadSuccess && (
                      <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center z-20 animate-fade-out">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                    <img
                      src={profile.avatar ? `${profile.avatar}${profile.avatar.startsWith('http') ? '' : '?t=' + new Date().getTime()}` : defaultAvatar}
                      alt={profile.name}
                      className="w-full h-full object-cover filter saturate-110"
                      onError={(e) => {
                        console.error('Avatar image failed to load:', profile.avatar);
                        e.currentTarget.src = defaultAvatar;
                      }}
                    />
                    {isOwnProfile && (
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-500">
                        <div className="flex items-center gap-1.5 text-white/60 group-hover:text-white/80 transition-colors duration-500">
                          <Camera className="h-5 w-5" />
                        </div>
                      </div>
                    )}
                    {/* Hidden file input triggered by avatar click */}
                    <input 
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </div>                  {/* Badge - Show CREATOR if user is a creator/tournament organizer */}
                  {profile.isCreator && (
                    <div className="absolute -right-2 -bottom-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-2 py-1 rounded-full z-20 shadow-lg flex items-center">
                      CREATOR
                    </div>
                  )}
                </div>

                {/* User Info with Enhanced Typography and Better Contrast */}
                <div className="flex-1">
                  <span className="text-cyan-400/80 uppercase text-xs tracking-widest mb-1 block font-semibold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">FEATURED ARTIST</span>
                  <h1 
                    className="text-4xl md:text-5xl font-bold text-white mb-1 leading-none tracking-wide drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]" 
                    style={{ fontFamily: 'Crashbow, sans-serif', letterSpacing: '0.1em' }}
                  >
                    {profile.name}
                  </h1>
                  <p className="text-cyan-400 text-lg mb-3 flex items-center font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    @{profile.username}
                  </p>
                  
                  {/* Social Media Links */}
                  {(profile.socials?.soundcloud || profile.socials?.instagram || profile.socials?.twitter || profile.socials?.spotify) && (
                    <div className="flex gap-3 mt-4">
                      {profile.socials?.soundcloud && (
                        <a 
                          href={`https://soundcloud.com/${profile.socials.soundcloud}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#ff5500]/20 hover:bg-[#ff5500]/30 border border-[#ff5500]/30 hover:border-[#ff5500]/50 text-[#ff5500] hover:text-white transition-all duration-300 backdrop-blur-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          title="SoundCloud"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-soundwave" viewBox="0 0 16 16">
                            <path d="M8.5 2a.5.5 0 0 0-1 0v11a.5.5 0 0 0 1 0V8.5l.5.5a.5.5 0 0 0 .707 0l.293-.293a.5.5 0 0 0 0-.707l-.5-.5.5-.5a.5.5 0 0 0 0-.707L9.707 6.5a.5.5 0 0 0-.707 0l-.5.5V2zM7 3a.5.5 0 0 0-1 0v10a.5.5 0 0 0 1 0V3zM6 4a.5.5 0 0 0-1 0v8a.5.5 0 0 0 1 0V4zM5 5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V5zM4 6a.5.5 0 0 0-1 0v4a.5.5 0 0 0 1 0V6zM3 7a.5.5 0 0 0-1 0v2a.5.5 0 0 0 1 0V7z"/>
                          </svg>
                          <span className="text-xs font-medium">SoundCloud</span>
                        </a>
                      )}
                      {profile.socials?.instagram && (
                        <a 
                          href={`https://instagram.com/${profile.socials.instagram}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 hover:from-[#833ab4]/30 hover:via-[#fd1d1d]/30 hover:to-[#fcb045]/30 border border-[#e1306c]/30 hover:border-[#e1306c]/50 text-[#e1306c] hover:text-white transition-all duration-300 backdrop-blur-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          title="Instagram"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-instagram" viewBox="0 0 16 16">
                            <path d="M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.197-.509.332-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.175-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.276-.843.038-1.096.047-3.232.047s-2.39-.009-3.233-.047c-.78-.036-1.203-.166-1.485-.276a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.034 1.024-.044 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z"/>
                          </svg>
                          <span className="text-xs font-medium">Instagram</span>
                        </a>
                      )}
                      {profile.socials?.twitter && (
                        <a 
                          href={`https://twitter.com/${profile.socials.twitter}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1da1f2]/20 hover:bg-[#1da1f2]/30 border border-[#1da1f2]/30 hover:border-[#1da1f2]/50 text-[#1da1f2] hover:text-white transition-all duration-300 backdrop-blur-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          title="Twitter"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-twitter" viewBox="0 0 16 16">
                            <path d="M5.026 15c6.038 0 9.341-5.003 9.341-9.334 0-.14 0-.282-.006-.422A6.685 6.685 0 0 0 16 3.542a6.658 6.658 0 0 1-1.889.518 3.301 3.301 0 0 0 1.447-1.817 6.533 6.533 0 0 1-2.087.793A3.286 3.286 0 0 0 7.875 6.03a9.325 9.325 0 0 1-6.767-3.429 3.289 3.289 0 0 0 1.018 4.382A3.323 3.323 0 0 1 .64 6.575v.045a3.288 3.288 0 0 0 2.632 3.218 3.203 3.203 0 0 1-.865.115 3.23 3.23 0 0 1-.614-.057 3.283 3.283 0 0 0 3.067 2.277A6.588 6.588 0 0 1 .78 13.58a6.32 6.32 0 0 1-.78-.045A9.344 9.344 0 0 0 5.026 15z"/>
                          </svg>
                          <span className="text-xs font-medium">Twitter</span>
                        </a>
                      )}
                      {profile.socials?.spotify && (
                        <a 
                          href={`https://open.spotify.com/artist/${profile.socials.spotify}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1ed760]/20 hover:bg-[#1ed760]/30 border border-[#1ed760]/30 hover:border-[#1ed760]/50 text-[#1ed760] hover:text-white transition-all duration-300 backdrop-blur-sm drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
                          title="Spotify"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" className="bi bi-spotify" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm3.669 11.538a.498.498 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.771a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.687zm.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858zm.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288z"/>
                          </svg>
                          <span className="text-xs font-medium">Spotify</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>                {/* Action Buttons with enhanced visibility */}
                <div className="flex gap-3 mt-0">
                  {/* Only show follow button if not viewing own profile */}
                  {!isOwnProfile && (
                  <button 
                    className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center shadow-lg ${
                      isFollowing 
                        ? 'bg-white/10 border border-white/20 text-white backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.3)]' 
                        : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-purple-500/20 shadow-[0_4px_12px_rgba(139,92,246,0.3)]'
                    }`}
                    onClick={() => setIsFollowing(!isFollowing)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFollowing ? 'Following' : 'Follow'}
                  </button>
                  )}
                  {/* Show edit button for own profile */}
                  {isOwnProfile && (
                    <button 
                      className="px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/20 backdrop-blur-sm shadow-[0_4px_12px_rgba(139,92,246,0.3)]"
                      onClick={() => navigate('/settings')}
                    >
                      Edit Profile
                    </button>
                  )}
                  <button 
                    className="p-2 rounded-full text-white/90 hover:text-white hover:bg-white/20 transition-all duration-300 flex items-center justify-center backdrop-blur-sm border border-white/10 hover:border-white/30 shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    onClick={handleShareProfile}
                    title="Share profile"
                  >
                    <Share className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full">
          {/* Stats Highlights with enhanced styling and selective dividers */}
          <div className="grid grid-cols-4 px-8 py-12 bg-gradient-to-b from-slate-700/80 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-cyan-500/20 mb-8 shadow-xl shadow-cyan-500/5 relative overflow-hidden">
            {/* Darker background */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-b from-cyan-500/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-gradient-to-t from-purple-500/30 to-transparent rounded-full blur-3xl"></div>
            
            <div className="flex flex-col items-center relative z-10 border-r border-cyan-500/20">
              <span className="text-cyan-300/80 text-sm uppercase tracking-wider mb-2 font-medium" style={{ fontFamily: 'Crashbow, sans-serif' }}>Followers</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <AnimatedCounter value={profile.stats.followers} />
              </span>
            </div>
            <div className="flex flex-col items-center relative z-10 border-r border-cyan-500/20">
              <span className="text-purple-300/80 text-sm uppercase tracking-wider mb-2 font-medium font-crashbow">Tournaments</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <AnimatedCounter value={profile.stats.tournamentsEntered} />
              </span>
            </div>
            <div className="flex flex-col items-center relative z-10">                <span className="text-teal-300/80 text-sm uppercase tracking-wider mb-2 font-medium font-crashbow">Created</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-teal-200 to-teal-400 drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                <AnimatedCounter value={profile.stats.tournamentsCreated} />
              </span>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <span className="text-pink-300/80 text-sm uppercase tracking-wider mb-2 font-medium font-crashbow">Total Plays</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-pink-400 via-pink-200 to-pink-400 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]">
                <AnimatedCounter value={15243} />
              </span>
            </div>
          </div>

          {/* Two-column layout for better content organization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left sidebar */}
            <div className="lg:col-span-4 space-y-8">
              {/* Bio Section with improved styling */}
              <div className="bg-gradient-to-b from-slate-700/80 to-slate-800/90 backdrop-blur-sm rounded-2xl p-8 border border-cyan-500/20 relative overflow-hidden shadow-lg shadow-cyan-500/5">
                {/* Darker background */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/30 rounded-full blur-2xl"></div>                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center" style={{ fontFamily: 'Crashbow, sans-serif' }}>
                    <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full mr-3"></span>
                    About
                  </h2>
                </div>
                  <p className="text-white/90 mb-8 leading-relaxed tracking-wide">{profile.bio}</p>
                
                <div className="flex flex-wrap gap-2 mb-6">
                  {profile.genres.map(genre => (
                    <span 
                      key={genre} 
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 hover:from-cyan-500/40 hover:to-purple-500/40 text-white hover:text-white rounded-full text-sm border border-white/10 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                  {/* Location and Member Info at bottom */}
                <div className="flex flex-col gap-3 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-white/90 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                      <span>{profile.location}</span>
                    </div>
                    <div className="flex items-center text-white/90 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                      <span>Member since Jan 2023</span>
                    </div>
                  </div>
                  {/* Website Button */}
                  {profile.website && profile.website !== 'N/A' && profile.website.trim() !== '' && (
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-slate-500/40 to-slate-600/30 hover:from-slate-500/50 hover:to-slate-600/40 text-white/90 rounded-lg text-sm border border-slate-500/20 transition-all duration-300 shadow-sm hover:shadow-md w-fit"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">Website</span>
                    </a>
                  )}
                </div>              </div>
            </div>
            
            {/* Main content area */}
            <div className="lg:col-span-8">
              {/* Tabs Section with enhanced visual styling */}
              <div className="bg-gradient-to-b from-slate-700/80 to-slate-800/90 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden shadow-lg">
                <Tabs defaultValue="submissions" className="w-full" onValueChange={setActiveTab}>
                  <div className="border-b border-white/10 px-6 pt-6 pb-4 bg-gradient-to-r from-cyan-500/5 to-purple-500/5">
                    <TabsList className="bg-slate-800/70 backdrop-blur-sm rounded-xl border border-white/10 p-1 h-auto">
                      <TabsTrigger 
                        value="submissions" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-purple-500/30 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.2)] text-white/70 transition-all duration-300 font-crashbow"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Submissions
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tournaments" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-purple-500/30 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.2)] text-white/70 transition-all duration-300 font-crashbow"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Tournaments
                      </TabsTrigger>
                      <TabsTrigger 
                        value="stats" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500/30 data-[state=active]:to-purple-500/30 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(6,182,212,0.2)] text-white/70 transition-all duration-300 font-crashbow"
                      >
                        <BarChart className="h-4 w-4 mr-2" />
                        Stats
                      </TabsTrigger>
                    </TabsList>
                  </div>
                  
                  <div className="p-6 lg:p-8">
                    <TabsContent value="submissions">
                      <SubmissionsTab submissions={submissions} />
                    </TabsContent>
                    
                    <TabsContent value="tournaments">
                      <TournamentsTab 
                        participatedTournaments={participatedTournaments}
                        createdTournaments={createdTournaments}
                        profile={profile}
                      />
                    </TabsContent>
                    
                    <TabsContent value="stats">
                      <StatsTab />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;