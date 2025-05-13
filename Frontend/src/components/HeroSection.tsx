import React from 'react';
import { Link } from 'react-router-dom';
import TournamentCard from './TournamentCard';
import { mockTournaments } from '../utils/mockData';

const HeroSection: React.FC = () => {
  // Use the first 3 tournaments as featured for the hero section
  const featuredTournaments = mockTournaments.slice(0, 3);

  return (
    <div className="relative text-white min-h-screen">
      {/* Main hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto">
          {/* JOIN THE MADNESS text with neon effect and CRashbow font */}
          <h1 className="leading-none mb-6">
            <span className="block text-6xl md:text-8xl" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff', 
              textShadow: '0 0 10px rgba(0, 204, 255, 0.2), 0 0 20px rgba(0, 204, 255, 0.1)',
              letterSpacing: '4px' 
            }}>
              JOIN THE
            </span>
            <span className="block text-7xl md:text-9xl" style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#ff00ff', 
              textShadow: '0 0 15px rgba(255, 0, 255, 0.2), 0 0 30px rgba(255, 0, 255, 0.1)',
              letterSpacing: '4px'
            }}>
              MADNESS
            </span>
          </h1>
          
          <p className="text-xl mb-12 max-w-2xl mx-auto">
          Join MusikMadness and compete in the highest tier of music tournaments. Creators post contests, artists submit your tracks and fans enjoy the show!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link
              to="/register"
              className="inline-block bg-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-pink-700 transition duration-300 shadow-lg"
              style={{ boxShadow: '0 0 15px rgba(255, 0, 255, 0.5)' }}
            >
              Join the Madness
            </Link>
            <Link
              to="/battles"
              className="inline-block border border-cyan-500 text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-cyan-500/20 transition duration-300"
              style={{ boxShadow: '0 0 10px rgba(0, 204, 255, 0.3)' }}
            >
              Watch Battles
            </Link>
          </div>
        </div>
      </div>
      
      {/* Featured Tournaments section */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 
            className="text-4xl md:text-5xl font-bold mb-10"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: '#00ccff',
              textShadow: '0 0 10px rgba(0, 204, 255, 0.1), 0 0 20px rgba(0, 204, 255, 0.1), 0 0 30px rgba(0, 204, 255, 0.1)',
              letterSpacing: '5px'
            }}
          >
            FEATURED TOURNAMENTS
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredTournaments.map((tournament) => (
            <TournamentCard key={tournament.id} tournament={tournament} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroSection;