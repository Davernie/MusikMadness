import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Globe, Award } from 'lucide-react';

// Sample data - replace with actual data from your backend
const sampleUsers = [
  { id: 1, username: "JazzMaster", totalPoints: 2500, genres: { jazz: 1200, blues: 800, fusion: 500 }, languages: { english: 1500, spanish: 1000 } },
  { id: 2, username: "RockStar", totalPoints: 2300, genres: { rock: 1400, metal: 900 }, languages: { english: 2000, german: 300 } },
  { id: 3, username: "ClassicalVirtuoso", totalPoints: 2100, genres: { classical: 1600, baroque: 500 }, languages: { italian: 1200, french: 900 } },
  // Add more sample users as needed
];

const genres = ["All", "Jazz", "Rock", "Classical", "Blues", "Metal", "Pop", "Electronic"];
const languages = ["All", "English", "Spanish", "French", "German", "Italian", "Japanese"];

const LeaderboardPage = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [currentTab, setCurrentTab] = useState("genres");

  // Function to filter users based on selected genre/language
  const filterUsers = (users: typeof sampleUsers, category: string, filter: string) => {
    if (filter === "All") return users;
    
    return users.sort((a, b) => {
      const aPoints = category === "genres" 
        ? (a.genres[filter.toLowerCase()] || 0)
        : (a.languages[filter.toLowerCase()] || 0);
      const bPoints = category === "genres"
        ? (b.genres[filter.toLowerCase()] || 0)
        : (b.languages[filter.toLowerCase()] || 0);
      return bPoints - aPoints;
    });
  };

  const displayUsers = currentTab === "genres" 
    ? filterUsers(sampleUsers, "genres", selectedGenre)
    : filterUsers(sampleUsers, "languages", selectedLanguage);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-crashbow text-white mb-2 flex items-center">
            <Award className="mr-3 h-8 w-8 text-purple-400" />
            Global Leaderboard
          </h1>
          <p className="text-gray-400">Compete with musicians worldwide and climb the ranks!</p>
        </div>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="border-b border-white/10 px-6 pt-4">
              <TabsList className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                <TabsTrigger
                  value="genres"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
                >
                  <Music className="h-4 w-4 mr-2" />
                  By Genre
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=active]:border-l-2 data-[state=active]:border-l-cyan-500 text-gray-400"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  By Language
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="genres">
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedGenre === genre
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="languages">
                <div className="flex flex-wrap gap-2 mb-6">
                  {languages.map((language) => (
                    <button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === language
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </TabsContent>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 text-gray-400 font-medium">Rank</th>
                      <th className="text-left py-4 text-gray-400 font-medium">User</th>
                      <th className="text-right py-4 text-gray-400 font-medium">Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayUsers.map((user, index) => (
                      <tr
                        key={user.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-4 text-gray-300">#{index + 1}</td>
                        <td className="py-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold mr-3">
                              {user.username.charAt(0)}
                            </div>
                            <span className="text-white">{user.username}</span>
                          </div>
                        </td>
                        <td className="py-4 text-right">
                          <span className="text-purple-400 font-medium">
                            {currentTab === "genres"
                              ? (selectedGenre === "All"
                                ? user.totalPoints
                                : user.genres[selectedGenre.toLowerCase()] || 0)
                              : (selectedLanguage === "All"
                                ? user.totalPoints
                                : user.languages[selectedLanguage.toLowerCase()] || 0)
                            } pts
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
