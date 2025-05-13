import React from 'react';
import { Music, Award, Edit } from 'lucide-react';
import { ProfileData } from '../../types/profile';

interface ProfileHeaderProps {
  profile: ProfileData;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <>
      {/* Profile header with cover image */}
      <div className="relative h-64 md:h-80 bg-black">
        <img
          src={profile.coverImage}
          alt={`${profile.name} cover`}
          className="w-full h-full object-cover opacity-30 mix-blend-luminosity"
        />
        {/* Noise texture overlay */}
        <div 
          className="absolute inset-0 opacity-30 mix-blend-overlay z-20 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
            backgroundSize: '200px 200px'
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/30"></div>
        
        {/* Animated glowing border at the bottom of the image section */}
        <div 
          className="absolute bottom-0 left-0 right-0 h-[1px]" 
          style={{
            background: 'linear-gradient(90deg, transparent 0%, rgba(0, 204, 255, 0.5) 50%, transparent 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 3s infinite linear'
          }}
        ></div>
      </div>
      
      {/* Profile info section */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end -mt-20 md:-mt-32 mb-6 md:mb-10">
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 z-10">
            <img
              src={profile.avatar}
              alt={profile.name}
              className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-black/50 object-cover shadow-xl"
            />
          </div>
          
          <div className="flex-1 md:pb-4">
            <h1 className="text-3xl font-bold text-white mb-1">{profile.name}</h1>
            <p className="text-cyan-400 mb-4">@{profile.username}</p>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-300 mb-4">
              <span className="flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Music className="h-4 w-4 mr-1 text-cyan-400" />
                {profile.genres.join(', ')}
              </span>
              <span className="flex items-center bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Award className="h-4 w-4 mr-1 text-pink-400" />
                {profile.stats.tournamentsWon} tournaments won
              </span>
            </div>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button className="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-600 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-300">
              Follow
            </button>
            <button className="bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-md font-medium text-sm transition-colors">
              Message
            </button>
            <button className="bg-transparent border border-white/20 text-white hover:bg-white/10 p-2 rounded-md transition-colors">
              <Edit className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader; 