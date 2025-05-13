import React from 'react';
import { Share2, Heart, MessageCircle, Download, Copy, Music } from 'lucide-react';

interface ActionButtonsProps {
  colors?: { primary: string; secondary: string; accent: string };
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  colors = { primary: '0, 255, 255', secondary: '0, 255, 255', accent: '0, 255, 255' } 
}) => {
  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
      {/* Gradient accent line */}
      <div 
        className="h-1 w-full"
        style={{
          background: `linear-gradient(to right, rgba(${colors.primary}, 0.8), rgba(${colors.secondary}, 0.4), rgba(${colors.accent}, 0.2))`,
        }}
      ></div>

      <div className="p-6">
        <h3 className="text-lg font-bold text-white flex items-center mb-4">
          <span 
            className="inline-block w-1 h-5 rounded-full mr-3"
            style={{ background: `rgba(${colors.primary}, 0.8)` }}
          ></span>
          Quick Actions
        </h3>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <Share2 className="h-5 w-5 mb-2" style={{ color: `rgba(${colors.primary}, 0.9)` }} />
            <span className="text-xs">Share</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <Heart className="h-5 w-5 mb-2 text-pink-400" />
            <span className="text-xs">Save</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <MessageCircle className="h-5 w-5 mb-2 text-cyan-400" />
            <span className="text-xs">Contact</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <Copy className="h-5 w-5 mb-2 text-purple-400" />
            <span className="text-xs">Copy Link</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <Download className="h-5 w-5 mb-2 text-emerald-400" />
            <span className="text-xs">Download</span>
          </button>
          
          <button className="flex flex-col items-center justify-center p-4 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-black/20">
            <Music className="h-5 w-5 mb-2 text-yellow-400" />
            <span className="text-xs">Listen</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActionButtons; 