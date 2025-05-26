import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Calendar, Award, Users } from 'lucide-react';
import TournamentParticipantCard from './TournamentParticipantCard';

interface Prize {
  amount: number;
}

interface Participant {
  name: string;
  avatar: string;
  location: string;
}

interface TournamentContentProps {
  description: string;
  startDate?: string;
  endDate?: string;
  prizes: Prize[];
  participants?: Participant[];
  maxParticipants?: number;
  rules: string[];
  matchups?: any[];
  colors: { primary: string; secondary: string; accent: string };
  formatDate?: (date: string) => string;
  genre?: string;
  language?: string;
}

const TournamentContent: React.FC<TournamentContentProps> = ({
  description = "No description available",
  startDate,
  endDate,
  prizes = [],
  participants = [],
  maxParticipants = 0,
  rules = [],
  matchups = [],
  colors = { primary: "0, 210, 255", secondary: "124, 58, 237", accent: "236, 72, 153" },
  formatDate = (date: string) => new Date(date).toLocaleDateString(),
  genre,
  language
}) => {
  // Ensure valid colors to prevent rendering issues
  const safeColors = {
    primary: colors?.primary || "0, 210, 255",
    secondary: colors?.secondary || "124, 58, 237",
    accent: colors?.accent || "236, 72, 153"
  };

  try {
    return (
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-gray-800/80 backdrop-blur-sm rounded-lg border border-white/10 p-1 mb-6 flex space-x-2 overflow-x-auto">
          <TabsTrigger 
            value="overview"
            className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
          >
            <Calendar className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="rules"
            className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
          >
            <Award className="h-4 w-4 mr-2" />
            Rules
          </TabsTrigger>
          <TabsTrigger 
            value="participants"
            className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
          >
            <Users className="h-4 w-4 mr-2" />
            Participants
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
            {/* Accent color bar at top */}
            <div 
              className="h-1 w-full"
              style={{
                background: `linear-gradient(to right, rgba(${safeColors.primary}, 0.8), rgba(${safeColors.secondary}, 0.4), rgba(${safeColors.accent}, 0.2))`,
              }}
            ></div>
            
            <div className="p-6">
              {/* Title and tags in a flex row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
                <h2 className="text-xl mb-2 md:mb-0" style={{ 
                    fontFamily: "'Crashbow', 'Impact', sans-serif",
                    color: `rgb(${safeColors.primary})`,
                    letterSpacing: '3px'
                  }}>
                  About this Tournament
                </h2>
                
                {/* Make sure these tags are more visible with improved styling */}
                <div className="flex items-center gap-2">
                  {genre && (
                    <div 
                      className="px-3 py-1 rounded-full text-xs font-medium inline-flex items-center"
                      style={{ 
                        background: `rgba(${safeColors.primary}, 0.15)`, 
                        border: `1px solid rgba(${safeColors.primary}, 0.3)`,
                        color: `rgba(${safeColors.primary}, 1)`
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ background: `rgba(${safeColors.primary}, 1)` }}></span>
                      {genre}
                    </div>
                  )}
                  
                  {language && (
                    <div className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 border border-white/20 text-gray-300 inline-flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-1.5"></span>
                      {language}
                    </div>
                  )}
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">{description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-white/10 p-6">
                  <h3 className="text-lg mb-4" style={{ 
                      fontFamily: "'Crashbow', 'Impact', sans-serif",
                      color: `rgb(${safeColors.primary})`,
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
                      color: `rgb(${safeColors.primary})`,
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
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
            {/* Accent color bar at top */}
            <div 
              className="h-1 w-full"
              style={{
                background: `linear-gradient(to right, rgba(${safeColors.primary}, 0.8), rgba(${safeColors.secondary}, 0.4), rgba(${safeColors.accent}, 0.2))`,
              }}
            ></div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-white flex items-center mb-5">
                <span 
                  className="inline-block w-1 h-5 rounded-full mr-3"
                  style={{ background: `rgba(${safeColors.primary}, 0.8)` }}
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
          <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
            {/* Accent color bar at top */}
            <div 
              className="h-1 w-full"
              style={{
                background: `linear-gradient(to right, rgba(${safeColors.primary}, 0.8), rgba(${safeColors.secondary}, 0.4), rgba(${safeColors.accent}, 0.2))`,
              }}
            ></div>
            
            <div className="p-6">
              <h2 className="text-xl font-bold text-white flex items-center mb-5">
                <span 
                  className="inline-block w-1 h-5 rounded-full mr-3"
                  style={{ background: `rgba(${safeColors.primary}, 0.8)` }}
                ></span>
                Registered Participants 
                <span className="ml-2 text-sm font-normal text-gray-400">({participants.length}/{maxParticipants})</span>
              </h2>
              
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
  } catch (error) {
    console.error("Error rendering TournamentContent:", error);
    
    // Fallback UI in case of errors
    return (
      <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl p-8 text-center">
        <p className="text-white mb-4">There was an error loading the tournament content.</p>
        <p className="text-gray-400 text-sm">Please try refreshing the page.</p>
      </div>
    );
  }
};

export default TournamentContent;