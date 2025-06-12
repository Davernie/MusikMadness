import React from 'react';
import { Calendar, Award, User, Music } from 'lucide-react';
import { ProfileData } from '../../types/profile';

interface Tournament {
  id: string;
  title: string;
  genre: string | string[];
  coverImage: string;
  startDate: string;
  status: string;
  participants: Array<{
    name: string;
    rank?: number;
  }>;
  organizer: {
    name: string;
  };
}

interface TournamentsTabProps {
  participatedTournaments: Tournament[];
  createdTournaments: Tournament[];
  profile: ProfileData;
}

const TournamentsTab: React.FC<TournamentsTabProps> = ({ 
  participatedTournaments, 
  createdTournaments,
  profile
}) => {
  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-bold text-white flex items-center mb-6">
          <span className="inline-block w-1 h-5 rounded-full bg-cyan-500 mr-3"></span>
          Tournaments Entered
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {participatedTournaments.map((tournament) => (
            <div key={tournament.id} className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 group hover:transform hover:-translate-y-1 transition-all duration-300">
              <div className="relative h-36 overflow-hidden">
                <img 
                  src={tournament.coverImage} 
                  alt={tournament.title}
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
                <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white backdrop-blur-sm border border-white/10">
                  {tournament.status}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-white text-lg mb-1">{tournament.title}</h3>
                <p className="text-sm text-cyan-400 mb-3">{tournament.genre}</p>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center text-gray-400">
                    <Calendar className="h-4 w-4 mr-1" />
                    {new Date(tournament.startDate).toLocaleDateString('en-US', {
                      month: 'short', 
                      year: 'numeric'
                    })}
                  </span>
                </div>
                
                {tournament.participants.find(p => p.username === profile.username)?.rank && (
                  <div className="mt-3 pt-3 border-t border-white/10 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-pink-400" />
                    <span className="text-sm font-medium text-gray-300">
                      Placed {tournament.participants.find(p => p.username === profile.username)?.rank}{
                        tournament.participants.find(p => p.username === profile.username)?.rank === 1 ? 'st' :
                        tournament.participants.find(p => p.username === profile.username)?.rank === 2 ? 'nd' :
                        tournament.participants.find(p => p.username === profile.username)?.rank === 3 ? 'rd' : 'th'
                      } out of {tournament.participants.length} participants
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center">
            <span className="inline-block w-1 h-5 rounded-full bg-pink-500 mr-3"></span>
            Your Tournaments
          </h2>
          <a 
            href="/create-tournament"
            className="inline-flex items-center px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-md font-medium text-sm transition-all duration-300"
          >
            <Music className="h-4 w-4 mr-2" />
            Create New Tournament
          </a>
        </div>
        
        {createdTournaments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {createdTournaments.map((tournament) => (
              <div key={tournament.id} className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 flex hover:transform hover:-translate-y-1 transition-all duration-300">
                <div className="relative w-1/3">
                  <img 
                    src={tournament.coverImage} 
                    alt={tournament.title}
                    className="w-full h-full object-cover opacity-50" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black"></div>
                </div>
                <div className="p-4 flex-1">
                  <h3 className="font-bold text-white text-lg mb-1">{tournament.title}</h3>
                  <p className="text-sm text-cyan-400 mb-3">{tournament.genre}</p>
                  
                  <div className="flex flex-col space-y-2 text-sm">
                    <span className="flex items-center text-gray-400">
                      <User className="h-4 w-4 mr-1" />
                      {tournament.participants.length} participants
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/5 text-white w-fit border border-white/10">
                      {tournament.status}
                    </span>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
                    <a href={`/tournaments/${tournament.id}`} className="px-3 py-1 rounded-md text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
                      View Details
                    </a>
                    <a href={`/tournaments/${tournament.id}/edit`} className="px-3 py-1 rounded-md text-sm font-medium bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors">
                      Manage
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg p-8 text-center border border-white/5">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
              <Award className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="mt-2 text-lg font-medium text-white">No tournaments created yet</h3>
            <p className="mt-1 text-gray-400">Create your first tournament and invite musicians to participate.</p>
            <div className="mt-6">
              <a 
                href="/create-tournament"
                className="inline-flex items-center px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-md font-medium text-sm transition-all duration-300"
              >
                <Music className="h-4 w-4 mr-2" />
                Create Tournament
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TournamentsTab; 