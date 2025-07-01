import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

// Memoized call to action title component with hardware acceleration
const CallToActionTitle = React.memo(() => (
  <h2 
    className="text-4xl md:text-5xl font-bold mb-6 will-change-transform"
    style={{ 
      fontFamily: "'Crashbow', 'Impact', sans-serif",
      color: 'rgb(255, 255, 255)',
      letterSpacing: '3px',
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    READY TO SHOWCASE YOUR{' '}
    <span 
      style={{ 
        color: 'rgb(255, 255, 255)',
      }}
    >
      MUSICAL TALENT
    </span>
    ?
  </h2>
));

// Memoized description text with hardware acceleration
const CallToActionDescription = React.memo(() => (
  <p 
    className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto text-gray-300 leading-relaxed will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    Join thousands of musicians who are competing, connecting, and growing their careers through MusikMadness tournaments.
  </p>
));

// Memoized action buttons with hardware acceleration
const CallToActionButtons = React.memo(() => (
  <div 
    className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6 will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    <Link
      to="/register"
      className="group inline-flex items-center justify-center font-medium py-4 px-8 rounded-full text-lg transition-all duration-300 shadow-lg will-change-transform"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.8), rgba(255, 105, 180, 0.6))',
        color: 'white',
        boxShadow: '0 0 20px rgba(255, 0, 255, 0.3), 0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <Sparkles className="mr-2 h-5 w-5 group-hover:rotate-12 transition-transform duration-300" />
      Create Free Account
      <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
    </Link>
    <Link
      to="/tournaments"
      className="group inline-flex items-center justify-center font-medium py-4 px-8 rounded-full text-lg transition-all duration-300 border-2 will-change-transform"
      style={{
        background: 'rgba(15, 15, 20, 0.7)',
        color: 'white',
        borderColor: 'rgba(0, 204, 255, 0.6)',
        boxShadow: '0 0 15px rgba(0, 204, 255, 0.2), 0 10px 30px -5px rgba(0, 0, 0, 0.3)',
        contain: 'layout style paint',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      Browse Tournaments
    </Link>
  </div>
));

// Memoized disclaimer text with hardware acceleration
const CallToActionDisclaimer = React.memo(() => (
  <p 
    className="mt-8 text-sm text-gray-400 will-change-transform"
    style={{ 
      contain: 'layout style paint',
      isolation: 'isolate',
      transform: 'translateZ(0)'
    }}
  >
    No credit card required. Get started in minutes.
  </p>
));

const CallToAction: React.FC = () => {
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
        className="absolute top-0 left-1/2 w-full max-w-md h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 will-change-transform"
        style={{
          transform: 'translate3d(-50%, 0, 0)',
          contain: 'layout style paint',
          isolation: 'isolate',
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden'
        }}
      ></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div 
          className="relative backdrop-blur-sm rounded-xl p-12 border border-white/10"
          style={{ 
            background: 'rgba(15, 15, 20, 0.7)',
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 0, 255, 0.1)',
            contain: 'layout style paint',
            willChange: 'transform'
          }}
        >
          {/* Accent color bar at top */}
          <div 
            className="absolute top-0 left-0 right-0 h-1 rounded-t-xl"
            style={{
              background: 'linear-gradient(to right, rgba(255, 0, 255, 0.8), rgba(0, 204, 255, 0.4))',
            }}
          ></div>

          <CallToActionTitle />
          <CallToActionDescription />
          <CallToActionButtons />
          <CallToActionDisclaimer />

          {/* Decorative glow effect */}
          <div 
            className="absolute inset-0 rounded-xl opacity-20 pointer-events-none"
            style={{ 
              background: 'linear-gradient(135deg, rgba(255, 0, 255, 0.1), rgba(0, 204, 255, 0.1))',
            }}
          ></div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;