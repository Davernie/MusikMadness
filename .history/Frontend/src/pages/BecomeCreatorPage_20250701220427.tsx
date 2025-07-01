import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { creatorService } from '../services/creatorService';
import { CreatorEligibilityResponse } from '../types/Creator';
import { getGenreColors } from '../utils/tournamentUtils';
import { 
  Music, 
  Trophy, 
  Star, 
  Clock, 
  AlertCircle,
  ExternalLink,
  User,
  FileText
} from 'lucide-react';

// Memoized Submit Button Component to prevent unnecessary re-renders
const SubmitButton = memo(({ 
  isFormValid, 
  submitting, 
  onSubmit 
}: { 
  isFormValid: boolean; 
  submitting: boolean; 
  onSubmit: (e: React.FormEvent) => void; 
}) => (
  <div 
    className="pt-6"
    style={{
      transform: 'translate3d(0,0,0)',
      willChange: 'transform',
      isolation: 'isolate',
      backfaceVisibility: 'hidden',
      WebkitBackfaceVisibility: 'hidden'
    }}
  >
    <button
      type="submit"
      disabled={!isFormValid || submitting}
      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:hover:scale-100"
      onClick={onSubmit}
    >
      {submitting ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          Submitting Application...
        </div>
      ) : (
        'Submit Application'
      )}
    </button>
  </div>
), (prevProps, nextProps) => {
  // Custom comparison function to ensure proper memoization
  return prevProps.isFormValid === nextProps.isFormValid &&
         prevProps.submitting === nextProps.submitting;
});

// Simplified form data for the new version
interface SimpleCreatorApplicationData {
  firstName: string;
  lastName: string;
  socialMediaLinks: {
    soundcloud?: string;
    spotify?: string;
    youtube?: string;
    instagram?: string;
    twitter?: string;
    other?: string;
  };
  reasonForApplying: string;
  isStreamer: string;
  wantsFeatured: string;
  streamingPlatform: string;
  streamingAccount: string;
}

const BecomeCreatorPage: React.FC = React.memo(() => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<CreatorEligibilityResponse | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(true);

  // Get color scheme for styling (using Electronic as default) - memoized for performance
  const colors = useMemo(() => getGenreColors('Electronic'), []);

  // Memoize card styles to prevent recalculation on every render
  const cardStyles = useMemo(() => ({
    background: 'rgba(15, 15, 20, 0.7)',
    boxShadow: `0 10px 30px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(${colors.primary}, 0.1)`,
  }), [colors.primary]);

  const [formData, setFormData] = useState<SimpleCreatorApplicationData>({
    firstName: '',
    lastName: '',
    socialMediaLinks: {
      soundcloud: '',
      spotify: '',
      youtube: '',
      instagram: '',
      twitter: '',
      other: ''
    },
    reasonForApplying: '',
    isStreamer: '',
    wantsFeatured: '',
    streamingPlatform: '',
    streamingAccount: ''
  });

  useEffect(() => {
    // If user is already a creator, redirect to create tournament page
    if (user?.isCreator) {
      navigate('/create-tournament');
      return;
    }
    
    // Only check eligibility if user is not a creator
    checkEligibility();
  }, [user, navigate]);

  const checkEligibility = async () => {
    try {
      setCheckingEligibility(true);
      const response = await creatorService.checkEligibility();
      setEligibility(response);
    } catch (error) {
      console.error('Error checking eligibility:', error);
      setEligibility({
        canApply: false,
        message: 'Error checking eligibility. Please try again later.'
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Memoize input change handler to prevent unnecessary re-renders
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('socialMediaLinks.')) {
      const linkType = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialMediaLinks: {
          ...prev.socialMediaLinks,
          [linkType]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      alert('Please fill in all required fields.');
      return;
    }

    try {
      setSubmitting(true);
      // Convert simplified data to full format for backend
      const fullApplicationData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: `Applied via simplified form. Reason: ${formData.reasonForApplying}`,
        experience: `This user applied through our simplified creator application form. Their motivation and background: ${formData.reasonForApplying}`,
        musicGenres: ['General'], // Default genre
        musicLinks: {
          soundcloud: formData.socialMediaLinks.soundcloud,
          spotify: formData.socialMediaLinks.spotify,
          youtube: formData.socialMediaLinks.youtube,
          bandcamp: '',
          other: formData.socialMediaLinks.other
        },
        reasonForApplying: formData.reasonForApplying,
        pastTournaments: 'Not specified in simplified application',
        estimatedTournamentsPerMonth: 1,
        // Include streaming data
        streaming: {
          isStreamer: formData.isStreamer === 'yes',
          wantsFeatured: formData.wantsFeatured === 'yes',
          preferredPlatform: formData.streamingPlatform || undefined,
          streamingAccount: formData.streamingAccount || undefined
        }
      };
      
      await creatorService.submitApplication(fullApplicationData);
      
      // Show success message and redirect
      alert('Application submitted successfully! We\'ll review your application and get back to you within 3-5 business days.');
      navigate('/profile');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert(`Error submitting application: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };
  // Memoize character count to prevent frequent re-calculations
  const characterCount = useMemo(() => formData.reasonForApplying.length, [formData.reasonForApplying.length]);

  // Memoize date formatting to prevent expensive recalculations
  const formattedSubmittedDate = useMemo(() => {
    return eligibility?.submittedAt 
      ? new Date(eligibility.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
  }, [eligibility?.submittedAt]);

  const formattedCanReapplyDate = useMemo(() => {
    return eligibility?.canReapplyAt 
      ? new Date(eligibility.canReapplyAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
  }, [eligibility?.canReapplyAt]);
  const isFormValid = useMemo(() => {
    return formData.firstName.length >= 2 && 
           formData.lastName.length >= 2 &&
           formData.reasonForApplying.length >= 50 &&
           (formData.socialMediaLinks.soundcloud || 
            formData.socialMediaLinks.spotify || 
            formData.socialMediaLinks.youtube || 
            formData.socialMediaLinks.instagram || 
            formData.socialMediaLinks.twitter || 
            formData.socialMediaLinks.other);
  }, [
    formData.firstName,
    formData.lastName,
    formData.reasonForApplying,
    formData.socialMediaLinks.soundcloud,
    formData.socialMediaLinks.spotify,
    formData.socialMediaLinks.youtube,
    formData.socialMediaLinks.instagram,
    formData.socialMediaLinks.twitter,
    formData.socialMediaLinks.other
  ]);

  // Loading state while checking eligibility
  if (checkingEligibility) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Checking eligibility...</p>
        </div>
      </div>
    );
  }

  // Show eligibility result if user can't apply
  if (eligibility && !eligibility.canApply) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-black/40 backdrop-blur-md rounded-xl p-8 border border-white/10 text-center">
          <div className="mb-6">
            {eligibility.reason === 'pending_application' ? (
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            {eligibility.reason === 'pending_application' ? 'Application Pending' : 'Cannot Apply'}
          </h1>
          
          <p className="text-gray-300 mb-6">{eligibility.message}</p>
          
          {eligibility.submittedAt && (
            <p className="text-sm text-gray-400 mb-4">
              Submitted: {formattedSubmittedDate}
            </p>
          )}
          
          {eligibility.canReapplyAt && (
            <p className="text-sm text-gray-400 mb-6">
              Can reapply after: {formattedCanReapplyDate}
            </p>
          )}
          
          <button
            onClick={() => navigate('/profile')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center px-4 py-8"
      style={{
        transform: 'translate3d(0,0,0)',
        willChange: 'transform',
        isolation: 'isolate',
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden'
      }}
    >
      <div className="max-w-2xl w-full contain-layout">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <Trophy className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Become a Creator</h1>
          <p className="text-gray-300 text-lg">
            Join our community of music creators and start hosting tournaments
          </p>
        </div>        {/* Application Form */}
        <div 
          className="rounded-2xl p-8 border border-white/10 contain-layout"
          style={{
            ...cardStyles,
            transform: 'translate3d(0,0,0)',
            willChange: 'transform',
            isolation: 'isolate',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">            {/* Name Fields */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center text-white font-semibold mb-3">
                  <User className="h-5 w-5 mr-2 text-purple-400" />
                  First Name *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Your first name"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  required
                  minLength={2}
                />
                <p className="text-sm text-gray-400 mt-1">Minimum 2 characters</p>
              </div>
              
              <div>
                <label className="flex items-center text-white font-semibold mb-3">
                  <User className="h-5 w-5 mr-2 text-purple-400" />
                  Last Name *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Your last name"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  required
                  minLength={2}
                />
                <p className="text-sm text-gray-400 mt-1">Minimum 2 characters</p>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <ExternalLink className="h-5 w-5 mr-2 text-purple-400" />
                Social Media & Music Links *
              </label>
              <div className="space-y-3">
                <input
                  type="url"
                  name="socialMediaLinks.soundcloud"
                  value={formData.socialMediaLinks.soundcloud}
                  onChange={handleInputChange}
                  placeholder="SoundCloud profile URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <input
                  type="url"
                  name="socialMediaLinks.spotify"
                  value={formData.socialMediaLinks.spotify}
                  onChange={handleInputChange}
                  placeholder="Spotify artist/profile URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <input
                  type="url"
                  name="socialMediaLinks.youtube"
                  value={formData.socialMediaLinks.youtube}
                  onChange={handleInputChange}
                  placeholder="YouTube channel URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <input
                  type="url"
                  name="socialMediaLinks.instagram"
                  value={formData.socialMediaLinks.instagram}
                  onChange={handleInputChange}
                  placeholder="Instagram profile URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <input
                  type="url"
                  name="socialMediaLinks.twitter"
                  value={formData.socialMediaLinks.twitter}
                  onChange={handleInputChange}
                  placeholder="Twitter/X profile URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
                <input
                  type="url"
                  name="socialMediaLinks.other"
                  value={formData.socialMediaLinks.other}
                  onChange={handleInputChange}
                  placeholder="Other music platform or website URL"
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">Provide at least one social media or music platform link</p>
            </div>

            {/* Reason for Applying */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <FileText className="h-5 w-5 mr-2 text-purple-400" />
                Why do you want to become a creator? *
              </label>
              <textarea
                name="reasonForApplying"
                value={formData.reasonForApplying}
                onChange={handleInputChange}
                placeholder="Tell us about your passion for music, your experience with tournaments or events, and what you hope to bring to our community..."
                rows={5}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 resize-none"
                required
                minLength={50}
              />
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-400">Minimum 50 characters</p>
                <p className="text-sm text-gray-400">
                  {characterCount}/1000
                </p>
              </div>
            </div>

            {/* Streamer Questions */}
            <div>
              <label className="flex items-center text-white font-semibold mb-3">
                <Music className="h-5 w-5 mr-2 text-purple-400" />
                Are you a streamer?
              </label>
              <select
                name="isStreamer"
                value={formData.isStreamer}
                onChange={handleInputChange}
                className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
              >
                <option value="">Select an option</option>
                <option value="yes">Yes</option>
                <option value="no">No</option>
              </select>
            </div>

            {/* Featured Streamer Question - Only show if user is a streamer */}
            {formData.isStreamer === 'yes' && (
              <div>
                <label className="flex items-center text-white font-semibold mb-3">
                  <Star className="h-5 w-5 mr-2 text-purple-400" />
                  Would you like to be featured on the website as a streamer?
                </label>
                <select
                  name="wantsFeatured"
                  value={formData.wantsFeatured}
                  onChange={handleInputChange}
                  className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                >
                  <option value="">Select an option</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                </select>
              </div>
            )}

            {/* Streaming Platform and Account - Only show if user wants to be featured */}
            {formData.isStreamer === 'yes' && formData.wantsFeatured === 'yes' && (
              <>
                <div>
                  <label className="flex items-center text-white font-semibold mb-3">
                    <ExternalLink className="h-5 w-5 mr-2 text-purple-400" />
                    Preferred Streaming Platform
                  </label>
                  <select
                    name="streamingPlatform"
                    value={formData.streamingPlatform}
                    onChange={handleInputChange}
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  >
                    <option value="">Select platform</option>
                    <option value="twitch">Twitch</option>
                    <option value="youtube">YouTube</option>
                    <option value="kick">Kick</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center text-white font-semibold mb-3">
                    <User className="h-5 w-5 mr-2 text-purple-400" />
                    Streaming Account Username
                  </label>
                  <input
                    type="text"
                    name="streamingAccount"
                    value={formData.streamingAccount}
                    onChange={handleInputChange}
                    placeholder="Enter your streaming username"
                    className="w-full bg-black/40 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20"
                  />
                  <p className="text-sm text-gray-400 mt-1">Username only (without URL)</p>
                </div>
              </>
            )}

            {/* Submit Button - Memoized to prevent unnecessary re-renders */}
            <SubmitButton 
              isFormValid={isFormValid}
              submitting={submitting}
              onSubmit={handleSubmit}
            />

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-sm text-gray-400">
                We'll review your application within 3-5 business days and notify you via email.
              </p>
            </div>
          </form>
        </div>

        {/* Benefits Section */}
        <div className="mt-8 bg-black/20 backdrop-blur-md rounded-xl p-6 border border-white/10">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Star className="h-6 w-6 mr-2 text-yellow-400" />
            Creator Benefits
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <Music className="h-8 w-8 text-purple-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Host Tournaments</h4>
              <p className="text-sm text-gray-400">Create and manage music competitions</p>
            </div>
            <div className="text-center">
              <Trophy className="h-8 w-8 text-yellow-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Earn Revenue</h4>
              <p className="text-sm text-gray-400">Generate income from entry fees</p>
            </div>
            <div className="text-center">
              <Star className="h-8 w-8 text-pink-400 mx-auto mb-2" />
              <h4 className="font-semibold text-white mb-1">Build Community</h4>
              <p className="text-sm text-gray-400">Connect with talented artists</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default BecomeCreatorPage; 