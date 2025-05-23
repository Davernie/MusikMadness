import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AnimatedBackground from '../components/profile/AnimatedBackground';
import { TrackPlayer } from '../components/tournament';
import './MatchupDetailsPage.css'; // We'll create this file next

// Component to display a matchup between two tracks with voting
const MatchupDetailsPage: React.FC = () => {
  const { tournamentId, matchupId } = useParams<{ tournamentId: string; matchupId: string }>();
  const navigate = useNavigate();
    // State for loading and error handling
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  
  // Define types for our matchup and comments data
  interface Competitor {
    id: string;
    name: string;
    artist: string;
    score: number;
    audioUrl: string;
    coverImage?: string;
  }
  
  interface MatchupData {
    id: string;
    tournamentId: string;
    round: number;
    player1: Competitor;
    player2: Competitor;
    status: 'active' | 'completed' | 'upcoming';
    votingEndsAt: number;
  }
  
  interface CommentData {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    avatarColor: string;
  }
  
  const [matchup, setMatchup] = useState<MatchupData | null>(null);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  
  // Fetch matchup data
  useEffect(() => {
    const fetchMatchupData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {        // In a real app, this would be an API call
        // For now, we'll simulate with a timeout and mock data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data for demonstration
        const matchupData: MatchupData = {
          id: matchupId || 'unknown',
          tournamentId: tournamentId || 'unknown',
          round: 1,
          player1: {
            id: 'p1',
            name: 'Neon Dreams',
            artist: 'Alex Johnson',
            score: 65,
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            coverImage: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          player2: {
            id: 'p2',
            name: 'Electric Pulse',
            artist: 'Maya Wilson',
            score: 35,
            audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
            coverImage: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=300'
          },
          status: 'active' as 'active', // Explicitly cast to the union type
          votingEndsAt: new Date().setDate(new Date().getDate() + 3),
        };
        
        setMatchup(matchupData);
        
        // Fetch comments
        await fetchComments();
      } catch (err) {
        console.error('Error fetching matchup data:', err);
        setError('Failed to load matchup details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMatchupData();
  }, [tournamentId, matchupId]);
  
  // Fetch comments (mock implementation)
  const fetchComments = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock comments data
      const mockComments = [
        {
          id: 'c1',
          author: 'MusicFan88',
          content: 'The beat on the first track is absolutely fire! Definitely has my vote.',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          avatarColor: 'from-purple-500 to-pink-600'
        },
        {
          id: 'c2',
          author: 'BeatMaster',
          content: 'That second track has a unique vibe, reminds me of early 2000s with a modern twist!',
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          avatarColor: 'from-cyan-500 to-blue-600'
        }
      ];
      
      setComments(mockComments);
    } catch (err) {
      console.error('Error fetching comments:', err);
      // We don't set the main error state for comments to avoid blocking the whole UI
    }
  };
  
  // Handle voting
  const handleVote = async (playerId: string) => {
    if (isVoting || !matchup) return;
    
    setIsVoting(true);
    
    try {
      // In a real app, this would be an API call to record the vote
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update UI optimistically
      setMatchup(prev => {
        if (!prev) return prev;
        
        // Clone the previous state
        const updated: MatchupData = { ...prev };
        
        // Update scores based on vote
        if (playerId === 'p1') {
          updated.player1.score = Math.min(100, updated.player1.score + 1);
          if (updated.player1.score + updated.player2.score > 100) {
            updated.player2.score = 100 - updated.player1.score;
          }
        } else {
          updated.player2.score = Math.min(100, updated.player2.score + 1);
          if (updated.player1.score + updated.player2.score > 100) {
            updated.player1.score = 100 - updated.player2.score;
          }
        }
        
        return updated;
      });
      
      // Get player name safely
      const playerName = playerId === 'p1' ? matchup.player1.name : matchup.player2.name;
      
      // Show success message
      alert(`Thank you for voting for ${playerName}!`);
    } catch (err) {
      console.error('Error submitting vote:', err);
      alert('Failed to submit your vote. Please try again.');
    } finally {
      setIsVoting(false);
    }
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || isSubmittingComment) return;
    
    setIsSubmittingComment(true);
    
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Create new comment
      const newComment = {
        id: `c${comments.length + 1}`,
        author: 'CurrentUser', // In a real app, this would be the logged-in user
        content: commentText,
        createdAt: new Date().toISOString(),
        avatarColor: 'from-cyan-500 to-fuchsia-500'
      };
      
      // Add to comments list
      setComments([newComment, ...comments]);
      
      // Clear input
      setCommentText('');
    } catch (err) {
      console.error('Error posting comment:', err);
      alert('Failed to post your comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  const handleBack = () => {
    navigate(`/tournaments/${tournamentId}`);
  };
  
  // Format time ago
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffSeconds < 60) return `${diffSeconds} seconds ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)} minutes ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} hours ago`;
    return `${Math.floor(diffSeconds / 86400)} days ago`;
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading matchup details...</p>
        </div>
      </div>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-md rounded-xl border border-red-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }
  
  // No matchup data
  if (!matchup) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <AnimatedBackground />
        <div className="relative z-10 text-center max-w-md mx-auto p-6 bg-gray-900/80 backdrop-blur-md rounded-xl border border-yellow-500/30">
          <h2 className="text-xl font-bold text-white mb-2">Matchup Not Found</h2>
          <p className="text-gray-300 mb-4">This matchup might have been removed or doesn't exist.</p>
          <button 
            onClick={handleBack}
            className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
          >
            Back to Tournament
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <AnimatedBackground />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <button 
          onClick={handleBack}
          className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors mb-6"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="m15 18-6-6 6-6"/></svg>
          Back to Tournament
        </button>
        
        <div className="bg-gray-900/80 backdrop-blur-md rounded-xl p-8 border border-white/10">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400">
              Round {matchup.round} Matchup
            </span>
          </h1>          <div className="flex flex-col md:flex-row items-center justify-center mb-8">
            {/* First player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player1.id,
                  title: matchup.player1.name,
                  artist: matchup.player1.artist,
                  audioUrl: matchup.player1.audioUrl
                }}
                competitorId={matchup.player1.id}
                competitorProfileImage={matchup.player1.coverImage}
                isLeft={true}
                gradientStart="cyan"
                gradientEnd="blue"
              />
              <button 
                onClick={() => handleVote(matchup.player1.id)}
                disabled={isVoting}
                className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-600 
                  hover:from-cyan-600 hover:to-blue-700 text-white font-medium rounded-lg 
                  text-center transform transition hover:scale-105 
                  ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? 'Submitting...' : `Vote for ${matchup.player1.name}`}
              </button>            </div>
            
            {/* VS divider - positioned between players */}
            <div className="md:w-[16%] flex items-center justify-center py-6 md:py-0 vs-container">
              <div className="vs-particle"></div>
              <div className="vs-particle"></div>
              <div className="vs-particle"></div>
              <div className="vs-particle"></div>
              
              <div className="relative">
                <div className="rounded-full bg-gradient-to-r from-cyan-500/80 to-fuchsia-500/80 backdrop-blur-md p-1.5 vs-glow">
                  <div className="rounded-full bg-black/70 backdrop-blur-md p-4 md:p-5 border border-white/30 shadow-lg">
                    <div className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400 vs-symbol">VS</div>
                  </div>
                </div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-36 md:w-44 h-36 md:h-44 bg-gradient-to-r from-cyan-500/20 to-fuchsia-500/20 rounded-full blur-xl -z-10"></div>              </div>
            </div>
            
            {/* Second player */}
            <div className="md:w-[42%]">
              <TrackPlayer 
                track={{
                  id: matchup.player2.id,
                  title: matchup.player2.name,
                  artist: matchup.player2.artist,
                  audioUrl: matchup.player2.audioUrl
                }}
                competitorId={matchup.player2.id}
                competitorProfileImage={matchup.player2.coverImage}
                isLeft={false}
                gradientStart="fuchsia"
                gradientEnd="purple"
              />
              <button 
                onClick={() => handleVote(matchup.player2.id)}
                disabled={isVoting}
                className={`mt-4 w-full py-3 px-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 
                  hover:from-fuchsia-600 hover:to-purple-700 text-white font-medium rounded-lg 
                  text-center transform transition hover:scale-105
                  ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? 'Submitting...' : `Vote for ${matchup.player2.name}`}
              </button>
            </div>
          </div>
            
          {/* Voting status */}
          <div className="text-center text-gray-300">
            <p>Voting ends in {Math.ceil((new Date(matchup.votingEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days</p>
            <div className="w-full bg-gray-800 rounded-full h-2.5 mt-3 max-w-md mx-auto">
              <div className="h-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500" style={{ width: `${matchup.player1.score}%` }}></div>
            </div>
            <div className="flex justify-between max-w-md mx-auto mt-1">
              <span>{matchup.player1.score}%</span>
              <span>{matchup.player2.score}%</span>
            </div>
          </div>
          
          {/* Comments section */}
          <div className="mt-8 border-t border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-white mb-4">Discussion</h2>
            
            <div className="space-y-4 mb-6">
              {comments.length > 0 ? (
                comments.map(comment => (
                  <div key={comment.id} className="bg-gray-800/50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${comment.avatarColor} mr-3`}></div>
                      <span className="font-medium text-white">{comment.author}</span>
                      <span className="ml-auto text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                    </div>
                    <p className="text-gray-300">{comment.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-400">
                  Be the first to comment on this matchup!
                </div>
              )}
            </div>
            
            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500"></div>
              <div className="flex-1">
                <textarea 
                  className="w-full bg-gray-800/70 border border-white/10 rounded-lg p-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent" 
                  placeholder="Add a comment..."
                  rows={2}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={isSubmittingComment}
                ></textarea>
                <button 
                  type="submit"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className={`mt-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-medium rounded-lg
                    ${(isSubmittingComment || !commentText.trim()) ? 'opacity-70 cursor-not-allowed' : 'hover:from-cyan-600 hover:to-fuchsia-600'}`}
                >
                  {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchupDetailsPage;
