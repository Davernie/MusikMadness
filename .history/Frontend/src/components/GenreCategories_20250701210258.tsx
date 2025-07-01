import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Headphones, Mic, Radio, Guitar, Piano } from 'lucide-react';

// Memoized genre categories title component with hardware acceleration
const GenreCategoriesTitle = React.memo(() => (
  <h2 
    className="text-4xl md:text-5xl font-bold mb-4 will-change-transform"
    style={{ 
      fontFamily: "'Crashbow', 'Impact', sans-serif",
      color: 'rgb(255, 255, 255)',
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    BROWSE BY GENRE
  </h2>
));

const GenreCategories: React.FC = () => {
  const genres = [
    { 
      name: 'Pop', 
      icon: <Music className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(255, 20, 147, 0.8), rgba(255, 105, 180, 0.6))',
      shadow: 'rgba(255, 20, 147, 0.3)',
      primary: '255, 20, 147'
    },
    { 
      name: 'Rock', 
      icon: <Guitar className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(220, 20, 60, 0.8), rgba(255, 69, 0, 0.6))',
      shadow: 'rgba(220, 20, 60, 0.3)',
      primary: '220, 20, 60'
    },
    { 
      name: 'Hip Hop', 
      icon: <Mic className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(0, 191, 255, 0.8), rgba(30, 144, 255, 0.6))',
      shadow: 'rgba(0, 191, 255, 0.3)',
      primary: '0, 191, 255'
    },
    { 
      name: 'Electronic', 
      icon: <Headphones className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(138, 43, 226, 0.8), rgba(75, 0, 130, 0.6))',
      shadow: 'rgba(138, 43, 226, 0.3)',
      primary: '138, 43, 226'
    },
    { 
      name: 'Jazz', 
      icon: <Piano className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(255, 215, 0, 0.8), rgba(255, 165, 0, 0.6))',
      shadow: 'rgba(255, 215, 0, 0.3)',
      primary: '255, 215, 0'
    },
    { 
      name: 'Classical', 
      icon: <Radio className="h-8 w-8" />, 
      gradient: 'linear-gradient(135deg, rgba(50, 205, 50, 0.8), rgba(34, 139, 34, 0.6))',
      shadow: 'rgba(50, 205, 50, 0.3)',
      primary: '50, 205, 50'
    },
  ];

  return (
    <section 
      className="py-20 relative"
      style={{ 
        contain: 'layout style paint',
        isolation: 'isolate'
      }}
    >
      {/* Background gradient line */}
      <div 
        className="absolute top-0 left-1/2 w-full max-w-lg h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 will-change-transform"
        style={{
          transform: 'translate3d(-50%, 0, 0)',
          contain: 'layout style paint',
          isolation: 'isolate',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div 
          className="text-center mb-16"
          style={{ 
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          <GenreCategoriesTitle />
          <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed">
            Discover tournaments tailored to your musical style. From underground beats to classical masterpieces.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {genres.map((genre) => (
            <Link 
              key={genre.name}
              to={`/tournaments?genre=${genre.name}`}
              className="group relative"
              style={{ 
                contain: 'layout style paint',
                willChange: 'transform'
              }}
            >
              <div 
                className="relative backdrop-blur-sm rounded-xl p-6 transition-all duration-500 hover:transform hover:-translate-y-2 border border-white/10"
                style={{
                  background: 'rgba(15, 15, 20, 0.7)',
                  boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(${genre.primary}, 0.1)`,
                }}
              >
                {/* Accent color bar at top */}
                <div 
                  className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
                  style={{ background: genre.gradient }}
                ></div>

                <div className="flex items-center gap-4">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110 flex-shrink-0"
                    style={{
                      background: genre.gradient,
                      boxShadow: `0 0 20px ${genre.shadow}, 0 0 40px ${genre.shadow}50`,
                    }}
                  >
                    {genre.icon}
                  </div>
                  
                  <div className="flex-1">
                    <h3 
                      className="text-2xl font-bold text-white mb-2"
                      style={{ 
                        fontFamily: "'Crashbow', 'Impact', sans-serif",
                        letterSpacing: '1px'
                      }}
                    >
                      {genre.name.toUpperCase()}
                    </h3>
                    <p className="text-gray-300 text-sm">
                      Explore {genre.name.toLowerCase()} tournaments
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <div 
                      className="w-2 h-8 rounded-full opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: genre.gradient }}
                    ></div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div 
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none"
                  style={{ background: genre.gradient }}
                ></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GenreCategories;