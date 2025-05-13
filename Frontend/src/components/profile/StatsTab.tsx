import React from 'react';
import { BarChart } from 'lucide-react';

const StatsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
        <div className="p-6">
          <h2 className="text-xl font-bold text-white flex items-center mb-6">
            <span className="inline-block w-1 h-5 rounded-full bg-pink-500 mr-3"></span>
            Performance Statistics
          </h2>
          <p className="text-gray-300 mb-6">Detailed statistics about your tournament performances and track analytics would be displayed here.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
              <p className="text-cyan-400 text-2xl font-bold">67%</p>
              <p className="text-sm text-gray-400">Average Score</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
              <p className="text-white text-2xl font-bold">3,210</p>
              <p className="text-sm text-gray-400">Total Plays</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
              <p className="text-pink-400 text-2xl font-bold">420</p>
              <p className="text-sm text-gray-400">Total Likes</p>
            </div>
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 text-center border border-white/10">
              <p className="text-yellow-400 text-2xl font-bold">25%</p>
              <p className="text-sm text-gray-400">Tournament Win Rate</p>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-12 flex items-center justify-center border border-white/10">
            <div className="text-center">
              <BarChart className="mx-auto h-12 w-12 text-gray-500" />
              <p className="mt-4 text-gray-400">Detailed charts and analytics would be displayed here</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsTab; 