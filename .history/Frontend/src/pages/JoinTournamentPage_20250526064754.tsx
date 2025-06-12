import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Music, UploadCloud, Info } from 'lucide-react';
import AnimatedBackground from '../components/profile/AnimatedBackground';

const JoinTournamentPage: React.FC = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();

  const [songTitle, setSongTitle] = useState('');
  const [songFile, setSongFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('No file chosen');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Basic validation for audio file type (can be more robust)
      if (!file.type.startsWith('audio/')) {
        setError('Invalid file type. Please upload an audio file.');
        setSongFile(null);
        setFileName('No file chosen');
        return;
      }
      // Basic validation for file size (e.g., 10MB)
      if (file.size > 10 * 1024 * 1024) { 
        setError('File is too large. Maximum size is 10MB.');
        setSongFile(null);
        setFileName('No file chosen');
        return;
      }
      setSongFile(file);
      setFileName(file.username);
      setError(null); // Clear previous errors
    } else {
      setSongFile(null);
      setFileName('No file chosen');
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!songTitle || !songFile) {
      setError('Song title and song file are required.');
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append('songTitle', songTitle);
    formData.append('songFile', songFile);
    if (description) {
      formData.append('description', description);
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('You must be logged in to join a tournament.');
        setLoading(false);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/tournaments/${tournamentId}/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Content-Type is not set, browser will set it for FormData
        },
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to join tournament.');
      }

      alert('Successfully joined tournament! Your song has been submitted.');
      navigate(`/tournaments/${tournamentId}`); // Navigate back to tournament details
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred.';
      console.error('Join tournament error:', errorMessage);
      setError(errorMessage);
    }
    setLoading(false);
  };

  const inputStyle = "block w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 ease-in-out focus:ring-cyan-500/70";
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen">
      {/* AnimatedBackground component */}
      <AnimatedBackground />
      
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
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center mr-4 shadow-lg">
                    <Music className="h-6 w-6 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white">Join Tournament</h1>
                    <p className="text-sm text-gray-400 mt-1">Submit your track to enter the competition.</p>
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

              <div>
                <label htmlFor="songFile" className={labelStyle}>Upload Song File <span className="text-red-400">*</span></label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-700 border-dashed rounded-md bg-gray-800/50 hover:border-cyan-500/70 transition-colors">
                  <div className="space-y-1 text-center">
                    <UploadCloud className="mx-auto h-10 w-10 text-gray-500" />
                    <div className="flex text-sm text-gray-400">
                      <label
                        htmlFor="songFile-upload"
                        className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 focus-within:ring-cyan-500"
                      >
                        <span>Upload a file</span>
                        <input id="songFile-upload" name="songFile" type="file" className="sr-only" onChange={handleFileChange} accept="audio/mpeg,audio/wav,audio/ogg,audio/mp3" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">MP3, WAV, OGG up to 10MB</p>
                    <p className="text-xs text-cyan-400 pt-1">{fileName}</p>
                  </div>
                </div>
              </div>

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
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 disabled:opacity-50 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95"
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

export default JoinTournamentPage;