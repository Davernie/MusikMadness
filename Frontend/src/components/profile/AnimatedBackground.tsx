import React, { useMemo } from 'react';

const AnimatedBackground: React.FC = React.memo(() => {
  // Generate static array for streaks using useMemo
  const streaks = useMemo(() => Array.from({ length: 60 }, (_, i) => {
    // Generate a random rotation angle
    const rotationDeg = Math.floor(Math.random() * 360);
    
    return {
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.floor(Math.random() * 200) + 150}px`,
      rotate: `${rotationDeg}deg`,
      animationClass: `streak-${(i % 5) + 1}`,
      color: Math.random() > 0.5 ? '#ff00ff' : '#00ccff',
      baseOpacity: Math.random() * 0.4 + 0.1,
    };
  }), []); // Empty dependency array ensures streaks are only generated once
  
  return (
    <div className="fixed inset-0 overflow-hidden z-0 pointer-events-none">
      <div className="absolute inset-0 opacity-40" style={{ 
        backgroundImage: `linear-gradient(135deg, transparent 0%, transparent 25%, #ff00ff33 25%, #ff00ff33 50%, transparent 50%, transparent 75%, #00ccff33 75%, #00ccff33 100%)`,
        backgroundSize: '400% 400%',
        animation: 'streak 20s linear infinite'
      }}></div>
      
      {/* Animated diagonal streaks */}
      <div className="absolute inset-0">
        {streaks.map(streak => (
          <div 
            key={streak.id}
            className={`streak ${streak.animationClass}`}
            style={{
              top: streak.top,
              left: streak.left,
              width: streak.width,
              color: streak.color,
              opacity: streak.baseOpacity,
              '--base-opacity': streak.baseOpacity,
              '--base-width': streak.width,
              '--rotation': streak.rotate,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
});

export default AnimatedBackground; 