import React, { useState } from 'react';
import { X } from 'lucide-react';

const ConstructionBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;
  return (
    <div 
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 px-4 shadow-lg cursor-pointer hover:from-orange-600 hover:to-red-600 transition-colors"
      onClick={() => setIsVisible(false)}
      title="Click to dismiss"
    >
      <div className="flex items-center justify-center relative">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-300">🚧</span>
          <span className="font-medium text-sm md:text-base">
            Website Under Construction - Some features may not work as expected
          </span>
          <span className="text-yellow-300">🚧</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Prevent double-firing when clicking the X
            setIsVisible(false);
          }}
          className="absolute right-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close banner"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default ConstructionBanner;
