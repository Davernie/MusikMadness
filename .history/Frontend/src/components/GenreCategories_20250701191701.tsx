import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Headphones, Mic, Radio, Guitar, Drum, Piano } from 'lucide-react';

// Memoized genre categories title component with hardware acceleration
const GenreCategoriesTitle = React.memo(() => (
  <h2 
    className="text-3xl font-bold text-white mb-4 will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    Browse by Genre
  </h2>
));

const GenreCategories: React.FC = () => {
  const genres = [
    { name: 'Pop', icon: <Music className="h-6 w-6" />, color: 'from-pink-400 to-pink-600' },
    { name: 'Rock', icon: <Guitar className="h-6 w-6" />, color: 'from-red-400 to-red-600' },
    { name: 'Hip Hop', icon: <Mic className="h-6 w-6" />, color: 'from-blue-400 to-blue-600' },
    { name: 'Electronic', icon: <Headphones className="h-6 w-6" />, color: 'from-purple-400 to-purple-600' },
    { name: 'Jazz', icon: <Piano className="h-6 w-6" />, color: 'from-yellow-400 to-yellow-600' },
    { name: 'Classical', icon: <Radio className="h-6 w-6" />, color: 'from-green-400 to-green-600' },
  ];

  return (
    <section 
      className="py-16"
      style={{ 
        contain: 'layout style paint',
        isolation: 'isolate'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="text-center mb-12 backdrop-blur-sm bg-black/20 p-6 rounded-2xl"
          style={{ 
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          <GenreCategoriesTitle />
          <p className="text-gray-300 max-w-2xl mx-auto">
            Find tournaments specific to your musical style. MusikMadness hosts competitions across all genres.
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 backdrop-blur-sm bg-black/30 p-8 rounded-2xl">
          {genres.map((genre) => (
            <Link 
              key={genre.name}
              to={`/tournaments?genre=${genre.name}`}
              className="group flex flex-col items-center"
            >
              <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${genre.color} text-white flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110 mb-3`}>
                {genre.icon}
              </div>
              <span className="font-medium text-gray-200">{genre.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenreCategories;