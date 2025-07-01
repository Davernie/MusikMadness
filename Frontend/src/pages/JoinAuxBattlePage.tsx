import React, { useState, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Music, Info, Youtube, CloudIcon } from 'lucide-react';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { extractYouTubeVideoId, isValidYouTubeUrl, getYouTubeThumbnail } from '../utils/youtube';
import { isValidSoundCloudUrl } from '../utils/soundcloud.ts';

const JoinAuxBattlePage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [submissionType, setSubmissionType] = useState<'youtube' | 'soundcloud'>('youtube');
  const [songTitle, setSongTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [soundcloudUrl, setSoundcloudUrl] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Validate based on submission type
    if (!songTitle) {
      setError('Song title is required.');
      return;
    }

    if (submissionType === 'youtube') {
      if (!youtubeUrl) {
        setError('YouTube URL is required when using YouTube submission.');
        return;
      }
      if (!isValidYouTubeUrl(youtubeUrl)) {
        setError('Please provide a valid YouTube URL.');
        return;
      }
    }

    if (submissionType === 'soundcloud') {
      if (!soundcloudUrl) {
        setError('SoundCloud URL is required when using SoundCloud submission.');
        return;
      }
      if (!isValidSoundCloudUrl(soundcloudUrl)) {
        setError('Please provide a valid SoundCloud URL.');
        return;
      }
    }

    setLoading(true);

    try {
      if (!token) {
        setError('You must be logged in to join a tournament.');
        setLoading(false);
        return;
      }

      let response;
      if (submissionType === 'youtube') {
        // YouTube submission
        response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            songTitle,
            youtubeUrl,
            streamingSource: 'youtube',
            description: description || undefined,
          }),
        });
      } else {
        // SoundCloud submission
        response = await fetch(`${API_BASE_URL}/tournaments/${tournamentId}/join`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            songTitle,
            soundcloudUrl,
            streamingSource: 'soundcloud',
            description: description || undefined,
          }),
        });
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to join tournament.');
      }

      alert('Successfully joined aux battle! Your submission has been added.');
      navigate(`/tournaments/${tournamentId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Join aux battle error:', errorMessage);
      setError(errorMessage);
    }
    setLoading(false);
  };

  const inputStyle = "block w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 ease-in-out focus:ring-cyan-500/70";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen bg-black/20">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8 relative z-10">
        <Link 
          to={tournamentId ? `/tournaments/${tournamentId}` : '/tournaments'} 
          className="inline-flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
          Back to Tournament
        </Link>

        <div className="bg-gray-800/60 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden border border-white/10">
          <div className="p-6 sm:p-8">
            <div className="flex items-center mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center mr-4 shadow-lg">
                    <Music className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Aux Battle</h1>
                    <p className="text-sm text-gray-400 mt-1">Submit your track to enter the aux battle.</p>
                </div>
            </div>

            {/* Aux Battle Info Banner */}
            <div className="mb-6 p-4 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm">
              <div className="flex items-start">
                <Info className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium mb-1">Aux Battle Submission Rules</p>
                  <p>Only YouTube and SoundCloud submissions are allowed for aux battles. File uploads are not permitted. Make sure your track is publicly accessible!</p>
                </div>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-500/20 text-red-300 border border-red-500/30 rounded-lg text-sm flex items-center">
                <Info className="h-5 w-5 mr-2 flex-shrink-0" /> {error}
              </div>
            )}            

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="songTitle" className={labelStyle}>Song Title <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  id="songTitle"
                  name="songTitle"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  className={inputStyle}
                  placeholder="Enter your song title"
                  required
                />
              </div>              

              {/* Submission Type Toggle - Only YouTube and SoundCloud */}
              <div>
                <label className={labelStyle}>Submission Type</label>
                <div className="flex rounded-lg bg-gray-800/50 p-1 border border-gray-700">
                  <button
                    type="button"
                    onClick={() => setSubmissionType('youtube')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      submissionType === 'youtube'
                        ? 'bg-red-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Youtube className="h-4 w-4 mr-1" />
                    YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setSubmissionType('soundcloud')}
                    className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      submissionType === 'soundcloud'
                        ? 'bg-orange-500 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <CloudIcon className="h-4 w-4 mr-1" />
                    SoundCloud
                  </button>
                </div>
              </div>

              {/* YouTube URL Section */}
              {submissionType === 'youtube' && (
                <div>
                  <label htmlFor="youtubeUrl" className={labelStyle}>YouTube URL <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Youtube className="h-5 w-5 text-red-400" />
                    </div>
                    <input
                      type="url"
                      id="youtubeUrl"
                      name="youtubeUrl"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className={`${inputStyle} pl-10`}
                      placeholder="https://www.youtube.com/watch?v=..."
                      required
                    />
                  </div>
                  {youtubeUrl && isValidYouTubeUrl(youtubeUrl) && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <img
                          src={getYouTubeThumbnail(extractYouTubeVideoId(youtubeUrl)!)}
                          alt="Video thumbnail"
                          className="w-16 h-12 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm text-green-400">✓ Valid YouTube URL detected</p>
                          <p className="text-xs text-gray-400 mt-1">Video will be used for your submission</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {youtubeUrl && !isValidYouTubeUrl(youtubeUrl) && (
                    <p className="mt-2 text-sm text-red-400">Please enter a valid YouTube URL</p>
                  )}
                </div>
              )}

              {/* SoundCloud URL Section */}
              {submissionType === 'soundcloud' && (
                <div>
                  <label htmlFor="soundcloudUrl" className={labelStyle}>SoundCloud URL <span className="text-red-400">*</span></label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CloudIcon className="h-5 w-5 text-orange-400" />
                    </div>
                    <input
                      type="url"
                      id="soundcloudUrl"
                      name="soundcloudUrl"
                      value={soundcloudUrl}
                      onChange={(e) => setSoundcloudUrl(e.target.value)}
                      className={`${inputStyle} pl-10`}
                      placeholder="https://soundcloud.com/artist/track-name"
                      required
                    />
                  </div>
                  {soundcloudUrl && isValidSoundCloudUrl(soundcloudUrl) && (
                    <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                      <div className="flex items-center space-x-3">
                        <div className="w-16 h-12 bg-orange-500/20 rounded flex items-center justify-center">
                          <CloudIcon className="h-6 w-6 text-orange-400" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-green-400">✓ Valid SoundCloud URL detected</p>
                          <p className="text-xs text-gray-400 mt-1">Track will be used for your submission</p>
                        </div>
                      </div>
                    </div>
                  )}
                  {soundcloudUrl && !isValidSoundCloudUrl(soundcloudUrl) && (
                    <p className="mt-2 text-sm text-red-400">Please enter a valid SoundCloud URL</p>
                  )}
                </div>
              )}

              <div>
                <label htmlFor="description" className={labelStyle}>Description (Optional)</label>
                <textarea
                  id="description"
                  name="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputStyle}
                  placeholder="Tell us a bit about your track..."
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-emerald-500 disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
                >
                  {loading ? 'Submitting...' : 'Submit Your Track'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinAuxBattlePage; 