import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Trophy, BarChart } from 'lucide-react';
import { mockTournaments } from '../utils/mockData';
import ProfileHeader from '../components/profile/ProfileHeader';
import AboutCard from '../components/profile/AboutCard';
import SubmissionsTab from '../components/profile/SubmissionsTab';
import TournamentsTab from '../components/profile/TournamentsTab';
import StatsTab from '../components/profile/StatsTab';
import AnimatedBackground from '../components/profile/AnimatedBackground';
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
    t.participants.some(p => p.name === profile.name)
  );
  
  // Filter tournaments for those the user has created
  const createdTournaments = mockTournaments.filter(t => 
    t.organizer.name === profile.name
  ).slice(0, 2);  // Just for demo purposes
  
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
    <div className="min-h-screen bg-black">
      {/* Fixed animated background */}
      <AnimatedBackground />
      
      {/* Profile header with cover image and user info */}
      <ProfileHeader profile={profile} />
      
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 relative z-10">
        <AboutCard profile={profile} />
            
        <Tabs defaultValue="submissions" className="space-y-6 mt-8">
          <TabsList className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-1 mb-6">
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
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;