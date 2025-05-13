import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { mockTournaments } from '../utils/mockData';
import { getGenreDisplayName } from '../utils/genreUtils';
import AnimatedBackground from '../components/profile/AnimatedBackground';
import {
  OrganizerCard,
  TournamentContent,
  TournamentHeader,
  TournamentBracket,
  TournamentCoverImage // Ensure TournamentCoverImage is imported
} from '../components/tournament';

const fixedColors = { primary: '0,204,255', secondary: '255,0,255', accent: '0,204,255' };

const TournamentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Find tournament by id
  const tournament = mockTournaments.find(t => t.id === id);
  
  if (!tournament) {
    return (
      <div className="min-h-screen bg-black">
        <AnimatedBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center relative z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-xl p-8 border border-white/5">
        <h2 className="text-2xl font-bold text-white mb-4">Tournament Not Found</h2>
            <Link to="/tournaments" className="inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
              <i className="lucide-arrow-left mr-2 h-4 w-4"></i>
          Back to Tournaments
        </Link>
          </div>
        </div>
      </div>
    );
  }
  
  const {
    title,
    coverImage,
    description,
    startDate,
    endDate,
    prizePool,
    participants,
    maxParticipants,
    genre,
    status,
    rules,
    organizer,
    prizes,
    language
  } = tournament;

  // Use fixed color scheme for all tournaments
  const colors = fixedColors;

  // Get the genre display string
  const genreDisplay = getGenreDisplayName(genre);
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const daysLeft = () => {
    const now = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Fixed animated background */}
      <AnimatedBackground />
      
     {/* Centered header with limited width */}
<div className="w-full px-4 sm:px-6 relative z-10">
  <div className="grid grid-cols-12 gap-4 lg:gap-6 py-12">
    <div className="col-span-12 md:col-span-6 lg:col-span-8 md:col-start-4 lg:col-start-3">
      <TournamentHeader
        title={title}
        genre={genreDisplay}
        language={language}
        status={status}
        daysLeft={daysLeft()}
        coverImage={coverImage}
        prizePool={prizePool}
        participants={participants.length}
        maxParticipants={maxParticipants}
        colors={colors}
      />
    </div>
  </div>
</div>
      
      {/* Main content - full width with padding */}
      <div className="w-full px-4 sm:px-6 pb-16 relative z-10">
        <div className="grid grid-cols-12 gap-4 lg:gap-6">
          {/* Centered content - no sidebars */}
          <div className="col-span-12 md:col-start-3 md:col-span-8 lg:col-start-3 lg:col-span-8">
            {/* Tournament content with organizer card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-50 mb-14">
              {/* Tournament content */}
              <div className="col-span-1 md:col-span-2">
                <TournamentContent
                  description={description}
                  startDate={startDate}
                  endDate={endDate}
                  prizes={prizes}
                  participants={participants}
                  maxParticipants={maxParticipants}
                  rules={rules}
                  colors={colors}
                  formatDate={formatDate}
                />
              </div>
              
              {/* Organizer card - integrated alongside content with increased top margin to align headers */}
              <div className="col-span-1 mt-[90px]">
                <OrganizerCard
                  organizer={organizer}
                  colors={colors}
                  participants={participants.length}
                  prizePool={prizePool}
                />
              </div>
            </div>
            
            {/* Tournament bracket */}
            <div>
              <TournamentBracket
                title={title}
                colors={colors}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;