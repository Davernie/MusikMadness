import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Calendar, Award, Users } from 'lucide-react';
import TournamentParticipantCard from './TournamentParticipantCard';
import { Participant } from '../../types';

interface Prize {
  amount: number;
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
  genre: string;
  language: string;
  formatDate?: (date: string) => string;
}

const TournamentContent: React.FC<TournamentContentProps> = ({
  description,
  startDate,
  endDate,
  prizes,
  participants = [],
  maxParticipants = 0,
  rules,
  matchups = [],
  colors,
  genre,
  language,
  formatDate = (date: string) => new Date(date).toLocaleDateString()
}) => {
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
              <div className="flex space-x-2">
                <div className="px-3 py-1 rounded-md border-l-2 border-white/5" 
                  style={{ 
                    borderLeftColor: `rgba(${colors.primary}, 0.7)`,
                    background: `linear-gradient(90deg, rgba(${colors.primary}, 0.1), transparent)` 
                  }}>
                  <span className="text-white/90 font-medium text-sm" style={{ 
                    color: `rgb(${colors.primary})`,
                    textShadow: `0 0 10px rgba(${colors.primary}, 0.3)`
                  }}>{genre}</span>
                </div>
                <div className="px-2.5 py-1 rounded-md border border-white/5 bg-gray-900/30 backdrop-blur-sm text-sm">
                  <span className="text-white/90" style={{ 
                    color: `rgb(${colors.secondary})` 
                  }}>{language}</span>
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
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
          {/* Accent color bar at top */}
          <div 
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
            }}
          ></div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center mb-5">
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
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
          {/* Accent color bar at top */}
          <div 
            className="h-1 w-full"
            style={{
              background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
            }}
          ></div>
          
          <div className="p-6">
            <h2 className="text-xl font-bold text-white flex items-center mb-5">
              <span 
                className="inline-block w-1 h-5 rounded-full mr-3"
                style={{ background: `rgba(${colors.primary}, 0.8)` }}
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
};

export default TournamentContent;