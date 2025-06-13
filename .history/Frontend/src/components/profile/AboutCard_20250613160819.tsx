import React from 'react';
import { Edit } from 'lucide-react';
import { ProfileData } from '../../types/profile';

interface AboutCardProps {
  profile: ProfileData;
}

const AboutCard: React.FC<AboutCardProps> = ({ profile }) => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="inline-block w-1 h-5 rounded-full bg-cyan-500 mr-3"></span>
            About
          </h2>
          <button className="text-gray-400 hover:text-cyan-400 flex items-center text-sm font-medium transition-colors">
            <Edit className="h-4 w-4 mr-1" />
            Edit Profile
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">{profile.bio}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-400">
            <span className="font-medium mr-2 text-white">Location:</span>
            {profile.location}
          </div>
          <div className="flex items-center text-gray-400">
            <span className="font-medium mr-2 text-white">Website:</span>
            <a href={`https://${profile.website}`} className="text-cyan-400 hover:text-cyan-300 hover:underline" target="_blank" rel="noopener noreferrer">
              {profile.website}
            </a>
          </div>
          <div className="flex items-center text-gray-400">
            <span className="font-medium mr-2 text-white">Member since:</span>
            January 2023
          </div>
        </div>
        
        <div className="mt-6 flex flex-wrap gap-2">
          {Object.entries(profile.socials).map(([platform, username]) => (
            <a 
              key={platform} 
              href={`https://${platform}.com/${username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 bg-white/5 hover:bg-white/10 rounded-full text-sm font-medium text-gray-300 border border-white/10 transition-colors"
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </a>
          ))}
        </div>
      </div>
      
      <div className="border-t border-white/10 bg-white/5">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{profile.stats.tournamentsEntered}</p>
            <p className="text-sm text-gray-400">Tournaments Entered</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-pink-400">{profile.stats.tournamentsWon}</p>
            <p className="text-sm text-gray-400">Tournaments Won</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-cyan-400">{profile.stats.tournamentsCreated}</p>
            <p className="text-sm text-gray-400">Tournaments Created</p>
          </div>
          <div className="p-4 text-center">
            <p className="text-2xl font-bold text-white">3</p>
            <p className="text-sm text-gray-400">Song Submissions</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutCard; 