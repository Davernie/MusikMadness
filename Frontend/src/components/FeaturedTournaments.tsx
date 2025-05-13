import React from 'react';
import { Link } from 'react-router-dom';
import TournamentCard from './TournamentCard';
// import { Tournament } from '../types'; // Assuming Tournament type is not directly used here or handled by TournamentCard
import { ChevronRight } from 'lucide-react';
import { mockTournaments } from '../utils/mockData';

const FeaturedTournaments: React.FC = () => {
  // For demo, filter to only show the first 3 tournaments
  const featuredTournaments = mockTournaments.slice(0, 3);

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-10 backdrop-blur-sm bg-black/20 p-6 rounded-2xl">
          <h2 className="text-3xl font-bold text-white">Featured Tournaments</h2>
          <Link to="/tournaments" className="text-white hover:text-white flex items-center text-sm font-medium">
            View All Tournaments
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Link
            to="/create-tournament"
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
          >
            Create Your Own Tournament
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedTournaments;