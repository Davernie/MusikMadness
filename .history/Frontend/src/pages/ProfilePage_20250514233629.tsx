import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Trophy, BarChart, MapPin, Calendar, Heart, Share, Link, MessageCircle, Star } from 'lucide-react';
import { mockTournaments } from '../utils/mockData';
import SubmissionsTab from '../components/profile/SubmissionsTab';
import TournamentsTab from '../components/profile/TournamentsTab';
import StatsTab from '../components/profile/StatsTab';
import { ProfileData } from '../types/profile';

// Animation utility
const AnimatedCounter = ({ value }: { value: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const counterRef = useRef<HTMLSpanElement>(null);

  React.useEffect(() => {
    const duration = 1500;
    const frameDuration = 1000 / 60;
    const totalFrames = Math.round(duration / frameDuration);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentValue = Math.round(value * progress);
      
      setDisplayValue(currentValue);
      
      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameDuration);
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          counter;
          observer.unobserve(counterRef.current!);
        }
      },
      {
        threshold: 0.2,
      }
    );
    
    if (counterRef.current) {
      observer.observe(counterRef.current);
    }
    
    return () => {
      clearInterval(counter);
      if (counterRef.current) observer.unobserve(counterRef.current);
    };
  }, [value]);
  
  return <span ref={counterRef}>{displayValue.toLocaleString()}</span>;
};

const ProfilePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("submissions");
  const [isFollowing, setIsFollowing] = useState(false);
  
  // For demo purposes, we'll use a mock profile
  const profile: ProfileData = {
    id: '1',
    name: 'Alex Johnson',
    username: 'alexjmusic',
    bio: 'Electronic music producer and DJ based in Los Angeles. Winner of Summer Beat Battle 2024.',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300',
    coverImage: 'https://images.pexels.com/photos/1105666/pexels-photo-1105666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    genres: ['Electronic', 'House', 'Techno'],
    location: 'Los Angeles, CA',
    website: 'alexjmusic.com',
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
  };
  
  // Filter tournaments for those the user has participated in
  const participatedTournaments = mockTournaments.filter(t => 
    t.participants.some(p => p.name === profile.name)
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
    <div className="min-h-screen flex flex-col items-center py-12 px-4 space-y-8">
      {/* Banner Card - Separated as its own component */}
      <div className="w-full max-w-[1400px] mt-[-100px] relative rounded-2xl overflow-hidden 
        backdrop-blur-lg border border-cyan-500/30 shadow-[0_0_40px_rgba(6,182,212,0.5)]">
        {/* Cover Image with Profile Info */}
        <div className="h-80 md:h-96 w-full overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/90"></div>
          <img 
            src={profile.coverImage}
            alt="Cover"
            className="w-full h-full object-cover object-center opacity-90 transform-gpu transition-all duration-1000 hover:scale-105"
          />
          {/* Abstract visual elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-[20%] right-[10%] w-40 h-40 rounded-full bg-gradient-to-r from-cyan-500/10 to-transparent"></div>
            <div className="absolute bottom-[30%] left-[15%] w-60 h-60 rounded-full bg-gradient-to-r from-purple-500/10 to-transparent"></div>
          </div>
          {/* Overlay with reduced blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/60 to-black/90"></div>
          
          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-end md:items-end gap-8">
              {/* Avatar with glowing effect */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur-lg opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-28 h-28 md:w-32 md:h-32 bg-black relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl z-10">
                  <img
                    src={profile.avatar}
                    alt={profile.name}
                    className="w-full h-full object-cover filter saturate-110"
                  />
                </div>
                {/* Badge */}
                <div className="absolute -right-2 -bottom-2 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full z-20 shadow-lg flex items-center">
                  <Star className="w-3 h-3 mr-1 animate-pulse" />
                  PRO
                </div>
              </div>

              {/* User Info with Better Typography */}
              <div className="flex-1">
                <span className="text-cyan-400/60 uppercase text-xs tracking-widest mb-1 block">FEATURED ARTIST</span>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-1 leading-none tracking-tight">
                  {profile.name}
                </h1>
                <p className="text-cyan-400 text-lg mb-3 flex items-center">
                  @{profile.username}
                </p>
                <div className="flex flex-wrap gap-4 text-white/70 text-sm">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                    {profile.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    Member since Jan 2023
                  </div>
                  <div className="flex items-center">
                    <Link className="w-4 h-4 mr-2 text-pink-400" />
                    {profile.website}
                  </div>
                </div>
              </div>

              {/* Action Buttons with improved styling */}
              <div className="flex gap-3 mt-0">
                <button 
                  className={`px-6 py-2 rounded-xl font-bold text-sm transition-all duration-300 flex items-center justify-center ${
                    isFollowing 
                      ? 'bg-white/10 border border-white/20 text-white' 
                      : 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                  }`}
                  onClick={() => setIsFollowing(!isFollowing)}
                >
                  <Heart className={`h-4 w-4 mr-2 ${isFollowing ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
                <button className="px-6 py-2 rounded-xl font-medium text-sm text-white bg-white/10 border border-white/10 hover:bg-white/20 transition-all duration-300 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </button>
                <button className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors flex items-center justify-center">
                  <Share className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card - Separated as its own component */}
      <div className="w-full max-w-[1400px] relative rounded-2xl overflow-hidden">
        {/* Main Content */}
        <div className="p-6 md:p-12">
          {/* Stats Highlights with enhanced styling */}
          <div className="grid grid-cols-3 divide-x divide-white/10 px-8 py-12 bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 mb-12 shadow-lg shadow-purple-500/5 relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-b from-cyan-500/10 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-gradient-to-t from-purple-500/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="flex flex-col items-center relative z-10">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-2">Followers</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-cyan-200 to-cyan-400 drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]">
                <AnimatedCounter value={profile.stats.followers} />
              </span>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-2">Tournaments</span>
              <span className="text-4xl md:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-purple-200 to-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                <AnimatedCounter value={profile.stats.tournamentsEntered} />
              </span>
            </div>
            <div className="flex flex-col items-center relative z-10">
              <span className="text-white/60 text-sm uppercase tracking-wider mb-2">Total Plays</span>
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
              <div className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/5 rounded-full blur-2xl"></div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full mr-3"></span>
                  About
                </h2>
                <p className="text-white/80 mb-8 leading-relaxed">{profile.bio}</p>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map(genre => (
                    <span 
                      key={genre} 
                      className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white rounded-full text-sm border border-white/10 transition-colors duration-300 cursor-pointer"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
              
              {/* Achievements Section - New */}
              <div className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm rounded-2xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/5 rounded-full blur-2xl"></div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                  <span className="w-1 h-6 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full mr-3"></span>
                  Achievements
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Trophy className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Tournament Winner</h3>
                      <p className="text-white/60 text-sm">Summer Beat Battle 2024</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
                      <Star className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Rising Star</h3>
                      <p className="text-white/60 text-sm">Top 100 New Artists</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5 hover:bg-white/10 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center text-pink-400">
                      <Music className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium">Featured Track</h3>
                      <p className="text-white/60 text-sm">MusikMadness Spotlight</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main content area */}
            <div className="lg:col-span-8">
              {/* Tabs Section with enhanced visual styling */}
              <div className="bg-gradient-to-b from-white/5 to-transparent backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden">
                <Tabs defaultValue="submissions" className="w-full" onValueChange={setActiveTab}>
                  <div className="border-b border-white/10 px-6 pt-6 pb-4 bg-white/5">
                    <TabsList className="bg-black/30 backdrop-blur-sm rounded-xl border border-white/10 p-1 h-auto">
                      <TabsTrigger 
                        value="submissions" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(255,255,255,0.1)] text-white/70 transition-all duration-300"
                      >
                        <Music className="h-4 w-4 mr-2" />
                        Submissions
                      </TabsTrigger>
                      <TabsTrigger 
                        value="tournaments" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(255,255,255,0.1)] text-white/70 transition-all duration-300"
                      >
                        <Trophy className="h-4 w-4 mr-2" />
                        Tournaments
                      </TabsTrigger>
                      <TabsTrigger 
                        value="stats" 
                        className="rounded-lg py-3 px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white 
                        data-[state=active]:shadow-[0_0_10px_rgba(255,255,255,0.1)] text-white/70 transition-all duration-300"
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