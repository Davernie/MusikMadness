import React from 'react';
import { Music, Upload } from 'lucide-react';

interface Submission {
  id: string;
  title: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  genre: string;
  plays: number;
  likes: number;
  rank: number;
}

interface SubmissionsTabProps {
  submissions: Submission[];
}

const SubmissionsTab: React.FC<SubmissionsTabProps> = ({ submissions }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white flex items-center">
          <span className="inline-block w-1 h-5 rounded-full bg-cyan-500 mr-3"></span>
          Song Submissions
        </h2>
        <button className="inline-flex items-center px-4 py-2 bg-gradient-to-br from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white rounded-md font-medium text-sm transition-all duration-300">
          <Upload className="h-4 w-4 mr-2" />
          Upload New Track
        </button>
      </div>
      
      <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Track
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Tournament
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Genre
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Plays
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {submissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex items-center justify-center h-8 w-8 rounded-full bg-pink-500/20 mr-3">
                        <Music className="h-4 w-4 text-pink-400" />
                      </div>
                      <div className="text-sm font-medium text-white">{submission.title}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-300 hover:text-cyan-400 transition-colors">
                      <a href={`/tournaments/${submission.tournamentId}`}>
                        {submission.tournamentName}
                      </a>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">
                      {new Date(submission.date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-white/5 text-gray-300 border border-white/10">
                      {submission.genre}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {submission.plays}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${
                      submission.rank === 1 ? 'text-yellow-400' :
                      submission.rank === 2 ? 'text-gray-300' :
                      submission.rank === 3 ? 'text-amber-600' :
                      'text-gray-400'
                    }`}>
                      {submission.rank === 1 ? '1st Place' :
                       submission.rank === 2 ? '2nd Place' :
                       submission.rank === 3 ? '3rd Place' :
                       `${submission.rank}th Place`}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SubmissionsTab; 