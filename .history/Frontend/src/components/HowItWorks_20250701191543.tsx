import React from 'react';
import { Music, Trophy, Calendar, Upload } from 'lucide-react';

// Memoized "How It Works" title component with hardware acceleration
const HowItWorksTitle = React.memo(() => (
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
    HOW IT WORKS
  </h2>
));

// Memoized step number component with hardware acceleration
const StepNumber = React.memo(({ index }: { index: number }) => (
  <span 
    className="text-4xl font-bold will-change-transform"
    style={{
      fontFamily: "'Crashbow', 'Impact', sans-serif",
      color: index % 2 === 0 ? '#00ccff' : '#ff00ff',
      textShadow: index % 2 === 0 
        ? '0 0 10px rgba(0, 204, 255, 0.2), 0 0 20px rgba(0, 204, 255, 0.1)'
        : '0 0 10px rgba(255, 0, 255, 0.2), 0 0 20px rgba(255, 0, 255, 0.1)',
      letterSpacing: '2px',
      contain: 'layout style paint',
      transform: 'translateZ(0)'
    }}
  >
    {index + 1}
  </span>
));

const HowItWorks: React.FC = () => {
  const steps = [
    {
      icon: <Calendar className="h-12 w-12 text-blue-400" />,
      title: 'Find a Tournament',
      description: 'Browse upcoming tournaments and find the perfect competition for your music style.'
    },
    {
      icon: <Upload className="h-12 w-12 text-pink-400" />,
      title: 'Submit Your Track',
      description: 'Upload your best original song for evaluation by judges and fellow musicians.'
    },
    {
      icon: <Music className="h-12 w-12 text-blue-400" />,
      title: 'Get Feedback',
      description: 'Receive valuable feedback from industry professionals and the community.'
    },
    {
      icon: <Trophy className="h-12 w-12 text-pink-400" />,
      title: 'Win Prizes',
      description: 'Top performers win cash prizes, exposure opportunities, and industry recognition.'
    }
  ];

  return (
    <section className="py-16 relative">
      {/* Background gradient line */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-sm h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ 
            fontFamily: "'Crashbow', 'Impact', sans-serif",
            color: 'rgb(255, 255, 255)',
          
          }}>
            HOW IT WORKS
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto text-lg">
            Participating in music tournaments on our platform is simple. Follow these steps to showcase your talent.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={index}>
              <div 
                className="relative group"
                style={{
                  background: index % 2 === 0 
                    ? 'linear-gradient(135deg, rgba(0, 204, 255, 0.1), rgba(0, 204, 255, 0.05))'
                    : 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 255, 0.05))',
                  borderRadius: '1rem',
                  padding: '1px'
                }}
              >
                <div 
                  className="backdrop-blur-sm bg-black/40 rounded-xl p-6 transition-all duration-300 h-full"
                  style={{
                    boxShadow: index % 2 === 0 
                      ? '0 0 20px rgba(0, 204, 255, 0.1)'
                      : '0 0 20px rgba(255, 0, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center gap-4 mb-6">
                    <span 
                      className="text-4xl font-bold"
                      style={{
                        fontFamily: "'Crashbow', 'Impact', sans-serif",
                        color: index % 2 === 0 ? '#00ccff' : '#ff00ff',
                        textShadow: index % 2 === 0 
                          ? '0 0 10px rgba(0, 204, 255, 0.2), 0 0 20px rgba(0, 204, 255, 0.1)'
                          : '0 0 10px rgba(255, 0, 255, 0.2), 0 0 20px rgba(255, 0, 255, 0.1)',
                        letterSpacing: '2px'
                      }}
                    >
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{step.title}</h3>
                    </div>
                  </div>
                  <div className="flex justify-center mb-6">
                    <div 
                      className="p-4 rounded-full transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: index % 2 === 0 
                          ? 'linear-gradient(135deg, rgba(0, 204, 255, 0.1), rgba(0, 204, 255, 0.05))'
                          : 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(255, 0, 255, 0.05))',
                        boxShadow: index % 2 === 0 
                          ? '0 0 15px rgba(0, 204, 255, 0.2)'
                          : '0 0 15px rgba(255, 0, 255, 0.2)'
                      }}
                    >
                      {step.icon}
                    </div>
                  </div>
                  <p className="text-gray-300 text-center leading-relaxed">{step.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;