import React from 'react';
import { Tabs, TabsList, Tab  formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }) + ' on ' + dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };bsContent } from '../../components/ui/Tabs';
import { Calendar, Award, Users, Music } from 'lucide-react';
import TournamentParticipantCard from './TournamentParticipantCard';
import { Participant } from '../../types/tournament';
import { getGenreColors } from '../../utils/tournamentUtils'; // Import getGenreColors

interface Prize {
  amount: number;
}

// Copied from TournamentDetailsPage.tsx, consider moving to a shared types file
interface BackendTrack { 
  _id: string;
  title: string;
  artist: string;
  url: string;
}

interface BackendMatchup {
  _id: string;
  round: number;
  track1?: BackendTrack;
  track2?: BackendTrack;
  winner?: string;
  votesTrack1?: number;
  votesTrack2?: number;
}

interface TournamentContentProps {
  description: string;
  startDate?: string;
  endDate?: string;
  prizes: Prize[];
  participants?: Participant[];
  maxParticipants?: number;
  rules: string[];
  colors: { primary: string; secondary: string; accent: string };
  genre: string;
  language: string;
  formatDate?: (date: string) => string;
  matchups?: BackendMatchup[]; // Added matchups prop
}

const TournamentContent: React.FC<TournamentContentProps> = ({
  description,
  startDate,
  endDate,
  prizes,
  participants = [],
  maxParticipants = 0,
  rules,
  colors,
  genre,
  language,
  formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    }) + ' at ' + dateObj.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  },
  matchups = []
}) => {
  const genreSpecificColors = getGenreColors(genre); // Get colors for the current genre

  return (
    <Tabs defaultValue="overview" className="space-y-6">
      <TabsList className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/10 p-1 mb-6 flex space-x-1 sm:space-x-2 w-full">
        <TabsTrigger 
          value="overview"
          className="rounded-md py-2 px-1 sm:px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400 flex-1 sm:flex-initial text-xs sm:text-sm whitespace-nowrap"
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Overview</span>
        </TabsTrigger>
        <TabsTrigger 
          value="rules"
          className="rounded-md py-2 px-1 sm:px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400 flex-1 sm:flex-initial text-xs sm:text-sm whitespace-nowrap"
        >
          <Award className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Rules</span>
        </TabsTrigger>
        <TabsTrigger 
          value="participants"
          className="rounded-md py-2 px-1 sm:px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400 flex-1 sm:flex-initial text-xs sm:text-sm whitespace-nowrap"
        >
          <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 flex-shrink-0" />
          <span className="truncate">Participants</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
          {/* Accent color bar at top */}
          <div 
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
            }}
          ></div>
          
          <div className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl" style={{ 
                  fontFamily: "'Crashbow', 'Impact', sans-serif",
                  color: `rgb(${colors.primary})`,
                  letterSpacing: '3px'
                }}>
                  About this Tournament
                </h2>
              <div className="flex items-center space-x-3"> {/* Added items-center for vertical alignment */}
                {/* Tournament card style genre badge */}
                <div 
                  className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full text-white transition-all duration-300 hover:scale-105"
                  style={{ 
                    background: `rgba(${genreSpecificColors.primary}, 0.15)`, 
                    border: `1px solid rgba(${genreSpecificColors.primary}, 0.3)`,
                    boxShadow: `0 2px 8px rgba(${genreSpecificColors.primary}, 0.1)`
                  }}
                >
                  <Music className="h-3 w-3 mr-1.5" style={{ color: `rgba(${genreSpecificColors.primary}, 0.9)` }} />
                  {genre}
                </div>
                {/* Subtle language badge */}
                <div className="inline-flex items-center text-xs font-medium px-3 py-1.5 rounded-full border transition-all duration-300 hover:scale-105" 
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: `0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)`
                  }}>
                  <span className="text-xs font-medium tracking-wide text-gray-300">
                    {language}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">{description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg mb-4" style={{ 
                    fontFamily: "'Crashbow', 'Impact', sans-serif",
                    color: `rgb(${colors.primary})`,
                    letterSpacing: '3px'
                  }}>
                  Prize Distribution
                </h3>
                <div className="space-y-3">
                  {prizes.map((prize, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Award className={`h-5 w-5 mr-2 ${
                          index === 0 ? 'text-yellow-400' : 
                          index === 1 ? 'text-gray-400' : 
                          index === 2 ? 'text-amber-700' : 'text-gray-500'
                        }`} />
                        <span className="text-gray-300">
                          {index === 0 ? '1st Place' : 
                           index === 1 ? '2nd Place' : 
                           index === 2 ? '3rd Place' : 
                           `${index + 1}th Place`}
                        </span>
                      </div>
                      <span className="text-white font-medium">${prize.amount}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                <h3 className="text-lg mb-4 flex items-center" style={{ 
                    fontFamily: "'Crashbow', 'Impact', sans-serif",
                    color: `rgb(${colors.primary})`,
                    letterSpacing: '3px'
                  }}>
                  Key Dates
                </h3>
                <div className="space-y-4">
                  {startDate && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 mr-3 border border-white/10">
                        <Calendar className="h-5 w-5 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Registration Deadline</p>
                        <p className="text-white">{formatDate(startDate)}</p>
                      </div>
                    </div>
                  )}
                  {endDate && (
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 mr-3 border border-white/10">
                        <Calendar className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Tournament End</p>
                        <p className="text-white">{formatDate(endDate)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="rules">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 h-[500px] ">
          {/* Accent color bar at top */}
          <div 
            className="h-1 w-full sticky top-0 z-10"
            style={{
              background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`
            }}
          ></div>
          
          <div className="p-6 overflow-y-auto h-[calc(500px-0.25rem)]">
            <h2 className="text-xl font-bold text-white flex items-center mb-5 sticky top-0 bg-gray-800/80 py-4 z-10">
              <span 
                className="inline-block w-1 h-5 rounded-full mr-3"
                style={{ background: `rgba(${colors.primary}, 0.8)` }}
              ></span>
              Tournament Rules
            </h2>
            <div className="prose prose-invert max-w-none text-gray-300">
              <ul className="space-y-3 list-none pl-0">
                {rules.map((rule, index) => (
                  <li key={index} className="flex items-start">
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/5 text-xs font-medium text-white mr-3 flex-shrink-0 border border-white/10">
                      {index + 1}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="participants">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 h-[500px] flex flex-col">
          {/* Accent color bar at top - remains sticky */}
          <div 
            className="h-1 w-full sticky top-0 z-20 flex-shrink-0"
            style={{
              background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`
            }}
          ></div>
          
          {/* Sticky header for Participants title and count - positioned via sticky, not part of the scrollable content div directly */}
          <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-[0.25rem] bg-gray-800 z-10 flex-shrink-0"> {/* Adjusted p-6, added border, top is height of accent bar */}
            <h2 className="text-xl font-bold text-white flex items-center">
              <span 
                className="inline-block w-1 h-5 rounded-full mr-3"
                style={{ background: `rgba(${colors.primary}, 0.8)` }}
              ></span>
              Registered Participants 
              <span className="ml-2 text-sm font-normal text-gray-400">({participants?.length || 0}/{maxParticipants})</span>
            </h2>
          </div>
            
          {/* Scrollable content area for participant cards */}
          {/* Height calculation: 500px (total) - 0.25rem (accent bar) - approx 4rem (title bar with p-6: 1.5rem top + 1.5rem bottom + text height)  ~ 500px - 68px */}
          <div className="overflow-y-auto flex-grow p-6 h-[calc(500px-0.25rem-4rem)]"> 
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {participants.map((participant, index) => (
                <TournamentParticipantCard 
                  key={index}
                  participant={participant}
                  colors={colors}
                  index={index}
                />
              ))}
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default TournamentContent;