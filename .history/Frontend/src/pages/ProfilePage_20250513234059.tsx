import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Trophy, BarChart, MapPin, Globe, Calendar, Users } from 'lucide-react';
import { mockTournaments } from '../utils/mockData';
import SubmissionsTab from '../components/profile/SubmissionsTab';
import TournamentsTab from '../components/profile/TournamentsTab';
import StatsTab from '../components/profile/StatsTab';
import { ProfileData } from '../types/profile';

const ProfilePage: React.FC = () => {
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
    t.participants.some(p => p.username === profile.username)
  );
  
  // Filter tournaments for those the user has created
  const createdTournaments = mockTournaments.filter(t => 
    t.organizer.username === profile.username
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
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[1400px] mt-[-100px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-xl overflow-hidden">
        {/* Header with gradient bar */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        {/* Profile Header */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-64 md:h-80 w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80"></div>
            <img 
              src={profile.coverImage}
              alt="Cover"
              className="w-full h-full object-cover opacity-70"
            />
            {/* Glassmorphic overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/80 backdrop-blur-sm"></div>
          </div>

          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-4 border-black/50 shadow-xl">
                  <img
                    src={profile.avatar}
                    alt={profile.username}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* User Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-crashbow text-white mb-2">{profile.username}</h1>
                <p className="text-cyan-400 text-lg mb-4">@{profile.username}</p>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center text-gray-300">
                    <MapPin className="w-4 h-4 mr-2 text-cyan-400" />
                    {profile.location}
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Globe className="w-4 h-4 mr-2 text-pink-400" />
                    <a href={`https://${profile.website}`} className="hover:text-cyan-400 transition-colors">
                      {profile.website}
                    </a>
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                    Member since Jan 2023
                  </div>
                  <div className="flex items-center text-gray-300">
                    <Users className="w-4 h-4 mr-2 text-emerald-400" />
                    {profile.stats.followers} followers
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-4 md:mt-0">
                <button className="px-6 py-2 bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all duration-300">
                  Follow
                </button>
                <button className="px-6 py-2 bg-gray-700/40 hover:bg-gray-700/60 text-white rounded-lg font-medium transition-colors duration-300 backdrop-blur-sm">
                  Message
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-2xl font-bold text-white mb-1">{profile.stats.tournamentsEntered}</p>
              <p className="text-sm text-gray-400">Tournaments Entered</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-2xl font-bold text-cyan-400 mb-1">{profile.stats.tournamentsWon}</p>
              <p className="text-sm text-gray-400">Tournaments Won</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-2xl font-bold text-pink-400 mb-1">{profile.stats.tournamentsCreated}</p>
              <p className="text-sm text-gray-400">Tournaments Created</p>
            </div>
            <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <p className="text-2xl font-bold text-purple-400 mb-1">{profile.stats.followers}</p>
              <p className="text-sm text-gray-400">Followers</p>
            </div>
          </div>

          {/* Bio Section */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-xl font-crashbow text-white mb-4">About</h2>
            <p className="text-gray-300 mb-6">{profile.bio}</p>
            <div className="flex flex-wrap gap-2">
              {profile.genres.map(genre => (
                <span key={genre} className="px-3 py-1 bg-gray-900/50 text-gray-300 rounded-full text-sm border border-white/10">
                  {genre}
                </span>
              ))}
            </div>
          </div>

          {/* Tabs Section */}
          <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
            <Tabs defaultValue="submissions" className="w-full">
              <div className="border-b border-white/10 px-6 pt-4">
                <TabsList className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                  <TabsTrigger 
                    value="submissions" 
                    className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
                  >
                    <Music className="h-4 w-4 mr-2" />
                    Submissions
                  </TabsTrigger>
                  <TabsTrigger 
                    value="tournaments" 
                    className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    Tournaments
                  </TabsTrigger>
                  <TabsTrigger 
                    value="stats" 
                    className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
                  >
                    <BarChart className="h-4 w-4 mr-2" />
                    Stats
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="p-6">
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
  );
};

export default ProfilePage;