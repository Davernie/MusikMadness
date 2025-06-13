import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/Tabs';
import { Music, Globe, Award, Crown, Flame, Star, Trophy, Users, Mic, Music2, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface UserStats {
  id: string;
  username: string;
  totalPoints: number;
  genres: Record<string, number>;
  languages: Record<string, number>;
  categories: {
    artist: number;
    producer: number;
    aux: number;
  };
  profile: {
    avatar: string;
    level: number;
    winStreak: number;
    totalWins: number;
    badge: string;
    status: 'online' | 'offline' | 'in-game';
    joinDate: string;
    preferredCategory: 'artist' | 'producer' | 'aux';
  };
}

// Sample data with complete category information
const sampleUsers: UserStats[] = [
  {
    id: "6507f6b1d7ae29c97f0cb95a",
    username: "BeatMaster3000",
    totalPoints: 15800,
    genres: { electronic: 5200, hiphop: 4800, trap: 3000, dubstep: 2800 },
    languages: { english: 8000, japanese: 4800, korean: 3000 },
    categories: {
      producer: 8500,
      artist: 4300,
      aux: 3000
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1520341280432-4749d4d7bcf9?w=400&h=400&fit=crop",
      level: 75,
      winStreak: 12,
      totalWins: 156,
      badge: "Grand Champion Producer",
      status: 'online',
      joinDate: '2024-01',
      preferredCategory: 'producer'
    }
  },
  {
    id: "6507f6b1d7ae29c97f0cb95b",
    username: "VocalVirtuosa",
    totalPoints: 14200,
    genres: { rnb: 4900, soul: 4600, jazz: 4700 },
    languages: { english: 7500, spanish: 6700 },
    categories: {
      artist: 9200,
      producer: 3000,
      aux: 2000
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop",
      level: 68,
      winStreak: 8,
      totalWins: 142,
      badge: "Elite Artist",
      status: 'in-game',
      joinDate: '2024-02',
      preferredCategory: 'artist'
    }
  },
  {
    id: "6507f6b1d7ae29c97f0cb95c",
    username: "AuxMaster",
    totalPoints: 13500,
    genres: { hiphop: 4800, trap: 4500, rnb: 4200 },
    languages: { english: 7000, spanish: 6500 },
    categories: {
      aux: 7800,
      artist: 3200,
      producer: 2500
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      level: 65,
      winStreak: 5,
      totalWins: 128,
      badge: "Aux Battle King",
      status: 'online',
      joinDate: '2024-01',
      preferredCategory: 'aux'
    }
  },
  {
    id: "6507f6b1d7ae29c97f0cb95d",
    username: "SoundScientist",
    totalPoints: 12800,
    genres: { techno: 4400, house: 4200, electronic: 4200 },
    languages: { english: 6800, german: 6000 },
    categories: {
      producer: 7200,
      artist: 3100,
      aux: 2500
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      level: 62,
      winStreak: 3,
      totalWins: 115,
      badge: "Beat Architect",
      status: 'offline',
      joinDate: '2024-03',
      preferredCategory: 'producer'
    }
  },
  {
    id: "6507f6b1d7ae29c97f0cb95e",
    username: "MelodyMaven",
    totalPoints: 12200,
    genres: { pop: 4300, rnb: 4100, soul: 3800 },
    languages: { english: 6500, french: 5700 },
    categories: {
      artist: 6800,
      producer: 3400,
      aux: 2000
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop",
      level: 59,
      winStreak: 4,
      totalWins: 108,
      badge: "Vocal Virtuoso",
      status: 'online',
      joinDate: '2024-02',
      preferredCategory: 'artist'
    }
  },
  {
    id: "6507f6b1d7ae29c97f0cb95f",
    username: "AuxLegend",
    totalPoints: 11500,
    genres: { hiphop: 4000, rap: 3800, trap: 3700 },
    languages: { english: 6000, spanish: 5500 },
    categories: {
      aux: 6500,
      artist: 3000,
      producer: 2000
    },
    profile: {
      avatar: "https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?w=400&h=400&fit=crop",
      level: 55,
      winStreak: 2,
      totalWins: 98,
      badge: "Aux Battle Master",
      status: 'offline',
      joinDate: '2024-03',
      preferredCategory: 'aux'
    }
  }
];

const genres = ["All", "Jazz", "Rock", "Classical", "Blues", "Metal", "Pop", "Electronic"];
const languages = ["All", "English", "Spanish", "French", "German", "Italian", "Japanese"];
const categories = ["All", "Artist", "Producer", "Aux"];

const getCategoryIcon = (category: string, className: string = "w-4 h-4") => {
  switch (category.toLowerCase()) {
    case 'artist':
      return <Mic className={className} />;
    case 'producer':
      return <Music2 className={className} />;
    case 'aux':
      return <Users className={className} />;
    default:
      return <Trophy className={className} />;
  }
};

const LeaderboardPage = () => {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [selectedLanguage, setSelectedLanguage] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [currentTab, setCurrentTab] = useState("categories"); // Updated default tab

  // Function to get rank badge based on position
  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-yellow-500 p-2 rounded-full shadow-lg shadow-yellow-500/50"
          >
            <Crown className="h-6 w-6 text-white" />
          </motion.div>
        );
      case 1:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-gray-300 p-2 rounded-full shadow-lg shadow-gray-300/50"
          >
            <Trophy className="h-6 w-6 text-gray-800" />
          </motion.div>
        );
      case 2:
        return (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -left-2 -top-2 bg-amber-600 p-2 rounded-full shadow-lg shadow-amber-600/50"
          >
            <Star className="h-6 w-6 text-white" />
          </motion.div>
        );
      default:
        return null;
    }
  };

  // Updated filter function to include categories
  const filterUsers = (users: UserStats[], filterType: 'genres' | 'languages' | 'categories', filter: string) => {
    if (filter === "All") return users.sort((a, b) => b.totalPoints - a.totalPoints);
    
    return users.sort((a, b) => {
      let aPoints = 0;
      let bPoints = 0;

      if (filterType === "categories") {
        aPoints = a.categories[filter.toLowerCase() as keyof UserStats['categories']] || 0;
        bPoints = b.categories[filter.toLowerCase() as keyof UserStats['categories']] || 0;
      } else if (filterType === "genres") {
        aPoints = a.genres[filter.toLowerCase()] || 0;
        bPoints = b.genres[filter.toLowerCase()] || 0;
      } else {
        aPoints = a.languages[filter.toLowerCase()] || 0;
        bPoints = b.languages[filter.toLowerCase()] || 0;
      }

      return bPoints - aPoints;
    });
  };

  const displayUsers = (() => {
    switch (currentTab) {
      case "genres":
        return filterUsers(sampleUsers, "genres", selectedGenre);
      case "languages":
        return filterUsers(sampleUsers, "languages", selectedLanguage);
      case "categories":
        return filterUsers(sampleUsers, "categories", selectedCategory);
      default:
        return sampleUsers;
    }
  })();

  // Updated display user card render
  const renderUserCard = (user: UserStats, index: number) => (
    <motion.div
      key={user.id}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className={`relative p-6 rounded-lg border group ${
        index === 0
          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
          : index === 1
          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
          : index === 2
          ? 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/50'
          : 'bg-gray-800/40 border-white/5 hover:bg-gray-700/40'
      } transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
    >
      {getRankBadge(index)}
      <Link 
        to={`/profile/${user.id}`} 
        className="flex items-center gap-4 group-hover:opacity-90 transition-opacity relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
        
        <div className="relative">
          <img 
            src={user.profile.avatar} 
            alt={user.username} 
            className="w-16 h-16 rounded-lg border-2 border-white/10 object-cover object-center"
            loading="lazy"
          />
          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
            user.profile.status === 'online' ? 'bg-green-500' :
            user.profile.status === 'in-game' ? 'bg-purple-500' :
            'bg-gray-500'
          }`} />
          {currentTab === 'categories' && selectedCategory !== 'All' && 
           user.profile.preferredCategory === selectedCategory.toLowerCase() && (
            <div className="absolute -top-2 -right-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="bg-purple-500 p-1 rounded-full shadow-lg shadow-purple-500/50"
              >
                <Star className="h-4 w-4 text-white" />
              </motion.div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-crashbow text-white flex items-center gap-2">
                {user.username}
                <span className="text-sm px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                  Lvl {user.profile.level}
                </span>
              </h3>
              <p className="text-sm text-gray-400">
                {currentTab === "categories" 
                  ? `Preferred: ${user.profile.preferredCategory}`
                  : currentTab === "genres"
                  ? `Top Genre: ${Object.entries(user.genres).sort((a, b) => b[1] - a[1])[0][0]}`
                  : `Top Language: ${Object.entries(user.languages).sort((a, b) => b[1] - a[1])[0][0]}`
                }
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-crashbow font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                {(() => {
                  switch (currentTab) {
                    case "categories":
                      return selectedCategory === "All"
                        ? user.totalPoints
                        : user.categories[selectedCategory.toLowerCase() as keyof UserStats['categories']] || 0;
                    case "genres":
                      return selectedGenre === "All"
                        ? user.totalPoints
                        : user.genres[selectedGenre.toLowerCase()] || 0;
                    case "languages":
                      return selectedLanguage === "All"
                        ? user.totalPoints
                        : user.languages[selectedLanguage.toLowerCase()] || 0;
                    default:
                      return user.totalPoints;
                  }
                })()} pts
              </div>
              {index === 0 && (
                <div className="text-xs font-medium text-yellow-500 flex items-center justify-end mt-1">
                  <Flame className="w-4 h-4 mr-1" />
                  Winner
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-2 flex items-center gap-4 text-sm">
            <div className="flex items-center text-purple-400">
              <Trophy className="w-4 h-4 mr-1" />
              {user.profile.totalWins} wins
            </div>
            <div className="flex items-center text-orange-400">
              <Flame className="w-4 h-4 mr-1" />
              {user.profile.winStreak} streak
            </div>
            <div className="bg-gray-700/30 px-2 py-0.5 rounded-full text-gray-300 text-xs">
              {user.profile.badge}
            </div>
          </div>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
          <ExternalLink className="w-5 h-5 text-purple-400" />
        </div>
      </Link>
    </motion.div>
  );

  return (
    <div className="container mx-auto px-4 py-8 relative min-h-screen">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute top-0 left-0 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div 
          className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto relative">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >          <h1 className="text-5xl font-crashbow text-white mb-2 flex items-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
            <Award className="mr-3 h-12 w-12 text-purple-400" />
            Leaderboard
          </h1>
          <p className="text-gray-400 text-lg">Compete with musicians worldwide!</p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-gray-800/90 via-gray-800/70 to-gray-800/90 backdrop-blur-lg rounded-xl border border-white/10 overflow-hidden shadow-2xl"
        >
          <Tabs defaultValue={currentTab} onValueChange={setCurrentTab} className="w-full">
            <div className="border-b border-white/10 px-6 pt-4">
              <TabsList className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-1">
                <TabsTrigger
                  value="categories"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  By Category
                </TabsTrigger>
                <TabsTrigger
                  value="genres"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                >
                  <Music className="h-4 w-4 mr-2" />
                  By Genre
                </TabsTrigger>
                <TabsTrigger
                  value="languages"
                  className="rounded-md py-2 px-4 data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-blue-500 data-[state=active]:text-white text-gray-400 transition-all duration-300"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  By Language
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              <TabsContent value="categories">
                <div className="flex flex-wrap gap-2 mb-6">
                  {categories.map((category) => (
                    <motion.button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedCategory === category
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-500/10'
                      } flex items-center space-x-2`}
                    >
                      {getCategoryIcon(category)}
                      <span>{category}</span>
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="genres">
                <div className="flex flex-wrap gap-2 mb-6">
                  {genres.map((genre) => (
                    <motion.button
                      key={genre}
                      onClick={() => setSelectedGenre(genre)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedGenre === genre
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      {genre}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="languages">
                <div className="flex flex-wrap gap-2 mb-6">
                  {languages.map((language) => (
                    <motion.button
                      key={language}
                      onClick={() => setSelectedLanguage(language)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                        selectedLanguage === language
                          ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/25'
                          : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 hover:shadow-lg hover:shadow-purple-500/10'
                      }`}
                    >
                      {language}
                    </motion.button>
                  ))}
                </div>
              </TabsContent>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`${selectedCategory}${selectedGenre}${selectedLanguage}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {displayUsers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`relative p-6 rounded-lg border ${
                        index === 0
                          ? 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 shadow-lg shadow-yellow-500/20'
                          : index === 1
                          ? 'bg-gradient-to-r from-gray-400/20 to-gray-500/20 border-gray-400/50'
                          : index === 2
                          ? 'bg-gradient-to-r from-amber-700/20 to-amber-800/20 border-amber-700/50'
                          : 'bg-gray-800/40 border-white/5 hover:bg-gray-700/40'
                      } transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
                    >
                      {getRankBadge(index)}
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={user.profile.avatar} 
                            alt={user.username} 
                            className="w-16 h-16 rounded-lg border-2 border-white/10 object-cover object-center"
                            loading="lazy"
                          />
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-gray-800 ${
                            user.profile.status === 'online' ? 'bg-green-500' :
                            user.profile.status === 'in-game' ? 'bg-purple-500' :
                            'bg-gray-500'
                          }`} />
                          {currentTab === 'categories' && selectedCategory !== 'All' && 
                           user.profile.preferredCategory === selectedCategory.toLowerCase() && (
                            <div className="absolute -top-2 -right-2">
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-purple-500 p-1 rounded-full shadow-lg shadow-purple-500/50"
                              >
                                <Star className="h-4 w-4 text-white" />
                              </motion.div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-xl font-crashbow text-white flex items-center gap-2">
                                {user.username}
                                <span className="text-sm px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/20">
                                  Lvl {user.profile.level}
                                </span>
                              </h3>
                              <p className="text-sm text-gray-400">
                                {currentTab === "categories" 
                                  ? `Preferred: ${user.profile.preferredCategory}`
                                  : currentTab === "genres"
                                  ? `Top Genre: ${Object.entries(user.genres).sort((a, b) => b[1] - a[1])[0][0]}`
                                  : `Top Language: ${Object.entries(user.languages).sort((a, b) => b[1] - a[1])[0][0]}`
                                }
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-2xl font-crashbow font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                                {(() => {
                                  switch (currentTab) {
                                    case "categories":
                                      return selectedCategory === "All"
                                        ? user.totalPoints
                                        : user.categories[selectedCategory.toLowerCase() as keyof UserStats['categories']] || 0;
                                    case "genres":
                                      return selectedGenre === "All"
                                        ? user.totalPoints
                                        : user.genres[selectedGenre.toLowerCase()] || 0;
                                    case "languages":
                                      return selectedLanguage === "All"
                                        ? user.totalPoints
                                        : user.languages[selectedLanguage.toLowerCase()] || 0;
                                    default:
                                      return user.totalPoints;
                                  }
                                })()} pts
                              </div>
                              {index === 0 && (
                                <div className="text-xs font-medium text-yellow-500 flex items-center justify-end mt-1">
                                  <Flame className="w-4 h-4 mr-1" />
                                  Winner
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4 text-sm">
                            <div className="flex items-center text-purple-400">
                              <Trophy className="w-4 h-4 mr-1" />
                              {user.profile.totalWins} wins
                            </div>
                            <div className="flex items-center text-orange-400">
                              <Flame className="w-4 h-4 mr-1" />
                              {user.profile.winStreak} streak
                            </div>
                            <div className="bg-gray-700/30 px-2 py-0.5 rounded-full text-gray-300 text-xs">
                              {user.profile.badge}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
