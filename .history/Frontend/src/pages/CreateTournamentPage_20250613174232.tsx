import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Info, Trophy, AlertCircle, Users, ChevronRight, Check, X, Music } from 'lucide-react';
import { getGenreColors } from '../utils/tournamentUtils';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';


const CreateTournamentPage: React.FC = () => {  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  // No longer automatically redirect non-creators
  // Instead, show authentication prompt at submission time
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    type: 'artist' as 'artist' | 'producer',
    startDate: '',
    endDate: '',
    maxParticipants: 50,
    hasPrizePool: false,
    prizePool: 0,
    entryFee: 0,
    rules: [''],
    language: 'Any Language',
    // coverImage: '' // This will be replaced by a File object or null
  });
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  
  const genres = [
    'Any Genre', 'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'
  ];
  
  const languages = [
    'Any Language', 'English', 'Spanish', 'French', 'German', 'Japanese', 'Korean', 'Chinese (Mandarin)', 'Other'
  ];
  
  // Get color scheme based on selected genre, or default to Electronic
  const colors = getGenreColors(formData.genre || 'Electronic');
  
  // Animation state for transitions
  const [animating, setAnimating] = useState(false);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'maxParticipants' || name === 'prizePool' || name === 'entryFee' ? Number(value) : value
    });
  };
  
  const handleCoverImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverImageFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCoverImageFile(null);
      setCoverImagePreview(null);
    }
  };
  
  // Add animation when switching steps
  useEffect(() => {
    setAnimating(true);
    const timer = setTimeout(() => {
      setAnimating(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentStep]);
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  const handleRuleChange = (index: number, value: string) => {
    const updatedRules = [...formData.rules];
    updatedRules[index] = value;
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };
  
  const addRule = () => {
    setFormData({
      ...formData,
      rules: [...formData.rules, '']
    });
  };
  
  const removeRule = (index: number) => {
    const updatedRules = formData.rules.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      rules: updatedRules
    });
  };
  
  const nextStep = () => {
    if (currentStep === 1) {
      if (!formData.title || !formData.genre || !formData.language || !formData.startDate || !formData.endDate || !coverImageFile) {
        alert('Please fill in all required fields in Basic Info, including language and a cover image.');
        return;
      }
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }, 200);
  };
  
  const prevStep = () => {
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }, 200);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.genre || !formData.language || !formData.startDate || !formData.endDate || !coverImageFile) {
      alert('Please fill in all required fields, including a cover image.');
      return;
    }

    const submissionFormData = new FormData();    submissionFormData.append('title', formData.title);
    submissionFormData.append('description', formData.description);
    submissionFormData.append('genre', formData.genre);
    submissionFormData.append('type', formData.type);
    submissionFormData.append('language', formData.language);
    submissionFormData.append('startDate', formData.startDate);
    submissionFormData.append('endDate', formData.endDate);
    submissionFormData.append('maxParticipants', String(formData.maxParticipants));
    submissionFormData.append('entryFee', String(formData.entryFee));
    submissionFormData.append('hasPrizePool', String(formData.hasPrizePool));
    if (formData.hasPrizePool) {
      submissionFormData.append('prizePool', String(formData.prizePool));
    }
    
    formData.rules.forEach((rule) => {
      if (rule.trim() !== '') {
        submissionFormData.append('rules', rule);
      }
    });
    
    if (coverImageFile) {
      submissionFormData.append('tournamentCoverImage', coverImageFile);
    }    console.log('Submitting tournament data with FormData...');    try {
      // Check authentication and creator status at submission time
      if (!token || !user) {
        alert('Please log in to create a tournament.');
        navigate('/login');
        return;
      }

      if (!user.isCreator) {
        alert('You need to become a creator to create tournaments.');
        navigate('/become-creator');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/tournaments`, {
        method: 'POST',
        headers: {
          // 'Content-Type': 'application/json', // DO NOT SET Content-Type when using FormData, browser will set it with boundary
          'Authorization': `Bearer ${token}`,
        },
        body: submissionFormData, // Use FormData directly
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const createdTournament = await response.json();
      console.log('Tournament created successfully:', createdTournament);
      alert('Tournament created successfully!');
      if (createdTournament && createdTournament._id) {
        navigate(`/tournaments/${createdTournament._id}`);
      } else {
        navigate('/tournaments');
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      alert(`Error creating tournament: ${error instanceof Error ? error.message : String(error)}`);
    }
  };
  
  // Step animation classes
  const stepClasses = `transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`;
  
  // Common input styling
  const inputBaseStyle = "block w-full px-4 py-3 rounded-lg bg-gray-800/70 border border-gray-700 focus:ring-2 focus:border-transparent text-white placeholder-gray-500 transition-all duration-200 ease-in-out";
  const focusRingStyle = `focus:ring-cyan-500/70`;
  const inputStyle = `${inputBaseStyle} ${focusRingStyle}`;
  const labelStyle = "block text-sm font-medium text-gray-300 mb-1.5";

  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Background effects */}

      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Tournaments
          </Link>          <h1 
            className="text-4xl font-bold mt-6 tracking-tight leading-none"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              letterSpacing: '2px',
              color: '#ffffff',
              textShadow: '0 0 10px rgba(255, 255, 255, 0.1), 0 0 20px rgba(255, 255, 255, 0.1)'
            }}
          >
            CREATE NEW TOURNAMENT
          </h1>
          <p className="text-gray-300 mt-3 max-w-lg">
            Set up a new competition for musicians to showcase their talent and compete for glory
          </p>
        </div>
        
        {/* Enhanced progress indicators */}
        <div className="mb-10">
          <div className="flex items-center justify-between px-2">            {[
              { step: 1, label: 'Basic Info' },
              { step: 2, label: 'Rules & Prizes' },
              { step: 3, label: 'Review' }
            ].map(({step, label}) => (
              <div key={step} className="flex flex-col items-center">
                <button 
                  onClick={() => step < currentStep && setCurrentStep(step)}
                  disabled={step > currentStep}
                  className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300
                    ${step < currentStep ? 'cursor-pointer' : 'cursor-default'}
                    ${step === currentStep 
                      ? `bg-gradient-to-br from-cyan-500 to-blue-600 text-white ring-2 ring-offset-2 ring-offset-gray-900 ring-cyan-400` 
                      : step < currentStep 
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white'
                        : 'bg-gray-800/70 text-gray-500 border border-gray-700'
                    }
                  `}
                  style={step <= currentStep ? {
                    boxShadow: `0 0 15px rgba(${colors.primary}, 0.3)`
                  } : {}}
                >
                  {step < currentStep ? (
                    <Check className="h-6 w-6" strokeWidth={3} />
                  ) : (
                    <span className="text-lg font-semibold">{step}</span>
                  )}
                  {step === currentStep && (
                    <span className="absolute w-full h-full rounded-full animate-ping bg-cyan-500/30"></span>
                  )}
                </button>
                <div className={`text-sm mt-3 font-medium transition-colors duration-300 
                  ${step === currentStep ? 'text-cyan-400' : step < currentStep ? 'text-green-400' : 'text-gray-500'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-4 h-1.5">
            <div className="absolute inset-0 h-full bg-gray-700/50 rounded-full"></div>
            <div 
              className="absolute inset-y-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
            ></div>
            {/* Progress dots */}
            <div className="absolute inset-y-0 left-0 h-full w-full flex justify-between px-[7%]">
              {[1, 2, 3].map(step => (
                <div 
                  key={step} 
                  className={`w-4 h-4 -mt-1.5 rounded-full transition-all duration-300 transform ${
                    step <= currentStep 
                      ? 'bg-cyan-400 scale-100' 
                      : 'bg-gray-700 scale-75'
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Enhanced main card with settings-style background */}
        <div className="relative overflow-hidden rounded-xl">
          {/* Header gradient */}
          <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
          
          <div className="w-full rounded-2xl bg-black/20 border border-white/5 backdrop-blur-xl overflow-hidden">
            <div className="relative p-8">              {/* Main content */}              <div className="relative space-y-6">
                {/* Show creator signup content for non-authenticated users AND non-creator users */}
                {(!token || !user || !user.isCreator) ? (
                  /* Tournament Creation Preview for Non-Users */
                  <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                      <h2 className="text-3xl font-bold text-white mb-4">Start Your Music Tournament</h2>
                      <p className="text-xl text-gray-300 mb-6">Create engaging music competitions and discover amazing talent</p>
                      
                      {/* Call-to-action */}                      <div className="rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 p-6 mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <Trophy className="h-8 w-8 text-cyan-400 mr-3" />
                          <h3 className="text-xl font-semibold text-cyan-300">Ready to Host a Tournament?</h3>
                        </div>
                        <p className="text-gray-300 mb-6">
                          {(!token || !user) 
                            ? "Join our community of music creators and organizers"
                            : "Upgrade to creator status to start hosting tournaments"
                          }
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                          {(!token || !user) ? (
                            <>
                              <Link 
                                to="/login" 
                                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                              >
                                Login to Create
                              </Link>
                              <Link 
                                to="/register" 
                                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                              >
                                Sign Up Free
                              </Link>
                            </>
                          ) : (
                            <Link 
                              to="/become-creator" 
                              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-400 hover:to-pink-400 text-white font-medium rounded-lg transition-all duration-200 hover:scale-105"
                            >
                              Become a Creator
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Tournament Creation Features */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center mb-4">
                          <Users className="h-6 w-6 text-cyan-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Manage Participants</h3>
                        <p className="text-gray-400 text-sm">Set participant limits, entry fees, and manage registrations with ease</p>
                      </div>

                      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4">
                          <Trophy className="h-6 w-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Prize Pools</h3>
                        <p className="text-gray-400 text-sm">Create exciting competitions with customizable prize pools and rewards</p>
                      </div>

                      <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                        <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center mb-4">
                          <Music className="h-6 w-6 text-pink-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-white mb-2">Genre Flexibility</h3>
                        <p className="text-gray-400 text-sm">Support for all music genres with automated bracket generation</p>
                      </div>
                    </div>

                    {/* Sample Tournament Preview */}
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                        <Info className="h-5 w-5 text-blue-400 mr-2" />
                        Tournament Creation Process
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-300 flex items-center justify-center mx-auto mb-3 text-sm font-bold">1</div>
                          <h4 className="font-medium text-white mb-2">Tournament Details</h4>
                          <p className="text-sm text-gray-400">Set title, genre, dates, and participant limits</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-300 flex items-center justify-center mx-auto mb-3 text-sm font-bold">2</div>
                          <h4 className="font-medium text-white mb-2">Rules & Prizes</h4>
                          <p className="text-sm text-gray-400">Configure competition rules and prize structure</p>
                        </div>
                        <div className="text-center">
                          <div className="w-8 h-8 rounded-full bg-pink-500/20 text-pink-300 flex items-center justify-center mx-auto mb-3 text-sm font-bold">3</div>
                          <h4 className="font-medium text-white mb-2">Launch & Manage</h4>
                          <p className="text-sm text-gray-400">Publish tournament and manage participants</p>
                        </div>
                      </div>
                    </div>

                    {/* Benefits */}
                    <div className="bg-gradient-to-r from-gray-800/40 to-gray-700/40 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                      <h3 className="text-xl font-semibold text-white mb-4">Why Create Tournaments?</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white">Discover New Talent</h4>
                            <p className="text-sm text-gray-400">Find amazing artists in your genre</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white">Build Community</h4>
                            <p className="text-sm text-gray-400">Connect musicians and music lovers</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white">Easy Management</h4>
                            <p className="text-sm text-gray-400">Automated brackets and voting system</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <Check className="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="font-medium text-white">Monetization Options</h4>
                            <p className="text-sm text-gray-400">Optional entry fees and prize pools</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>                ) : (
                  /* Actual Tournament Creation Form for Authenticated Creator Users Only */
                  <>                    <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Step 1: Basic Information */}
                  {currentStep === 1 && (
                    <div className={stepClasses}>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 mr-3">
                          <Info className="h-5 w-5" />
                        </span>
                        Tournament Details
                      </h2>
                      
                      <div className="space-y-8">
                        {/* Input fields */}
                        <div className="space-y-6">                          <div>
                            <label htmlFor="title" className={labelStyle}>Tournament Title <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="title"
                              value={formData.title}
                              onChange={handleChange}
                              className={inputStyle}
                              placeholder="Enter tournament title"
                              required
                            />
                          </div>

                          <div>
                            <label htmlFor="type" className={labelStyle}>Tournament Type <span className="text-red-500">*</span></label>
                            <select
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              className={inputStyle}
                              required
                            >
                              <option value="artist">Artist Tournament</option>
                              <option value="producer">Producer Tournament</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-1.5">
                              Artist tournaments are for vocalists and songwriters. Producer tournaments are for beat makers and instrumentalists.
                            </p>
                          </div>
                          
                          <div>
                            <label htmlFor="genre" className={labelStyle}>Main Genre <span className="text-red-500">*</span></label>
                            <select
                              name="genre"
                              value={formData.genre}
                              onChange={handleChange}
                              className={inputStyle}
                              required
                            >
                              <option value="">Select a genre</option>
                              {genres.map(genre => (
                                <option key={genre} value={genre}>{genre}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="language" className={labelStyle}>Language <span className="text-red-500">*</span></label>
                            <select
                              name="language"
                              value={formData.language}
                              onChange={handleChange}
                              className={inputStyle}
                              required
                            >
                              {languages.map(lang => (
                                <option key={lang} value={lang}>{lang}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="tournamentCoverImage" className={labelStyle}>Tournament Cover Image <span className="text-red-500">*</span></label>
                            <input 
                              type="file" 
                              name="tournamentCoverImage" 
                              id="tournamentCoverImage" 
                              onChange={handleCoverImageChange} 
                              className={`${inputStyle} file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/30 file:text-cyan-300 hover:file:bg-cyan-600/40`} 
                              accept="image/png, image/jpeg, image/webp" 
                              required 
                            />                            {coverImagePreview && (
                              <div className="mt-4">
                                <div className="w-full aspect-[3.5/1] bg-gray-800/40 rounded-lg border border-gray-700 overflow-hidden">
                                  <img src={coverImagePreview} alt="Cover preview" className="w-full h-full object-cover" />
                                </div>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-1.5">Recommended: 1200x400px, JPG/PNG/WEBP, max 2MB.</p>
                          </div>

                          <div>
                            <label htmlFor="description" className={labelStyle}>Description</label>
                            <textarea
                              name="description"
                              value={formData.description}
                              onChange={handleChange}
                              rows={3}
                              className={inputStyle}
                              placeholder="Describe your tournament"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div>
                              <label htmlFor="startDate" className={labelStyle}>Start Date & Time <span className="text-red-500">*</span></label>
                              <input
                                type="datetime-local"
                                name="startDate"
                                value={formData.startDate}
                                onChange={handleChange}
                                className={inputStyle}
                                required
                              />
                            </div>
                            <div>
                              <label htmlFor="endDate" className={labelStyle}>End Date & Time <span className="text-red-500">*</span></label>
                              <input
                                type="datetime-local"
                                name="endDate"
                                value={formData.endDate}
                                onChange={handleChange}
                                className={inputStyle}
                                required
                              />
                            </div>
                          </div>

                          <div>
                            <label htmlFor="maxParticipants" className={labelStyle}>Maximum Participants</label>
                            <input
                              type="number"
                              name="maxParticipants"
                              value={formData.maxParticipants}
                              onChange={handleChange}
                              min="2"
                              max="100"
                              className={inputStyle}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Rules and Prizes */}
                  {currentStep === 2 && (
                    <div className={stepClasses}>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 mr-3">
                          <Trophy className="h-5 w-5" />
                        </span>
                        Rules & Prizes
                      </h2>
                      
                      <div className="space-y-8">
                        <div className="bg-black/30 backdrop-blur-md rounded-xl p-6 border border-gray-800">
                          <label className="block text-sm font-medium text-gray-300 mb-4 flex items-center">
                            <span className="text-cyan-400 mr-2 text-lg">#</span>
                            Tournament Rules
                          </label>
                          <div className="space-y-4">
                            {formData.rules.map((rule, index) => (
                              <div key={index} className="flex items-start group animate-fadeIn" style={{animationDelay: `${index * 50}ms`}}>
                                <div className="flex-shrink-0 pt-1">
                                  <span className="flex items-center justify-center w-7 h-7 rounded-full border border-cyan-500/30 bg-cyan-900/20 text-xs text-cyan-300 font-medium">
                                    {index + 1}
                                  </span>
                                </div>
                                <div className="ml-3 flex-grow">
                                  <textarea
                                    value={rule}
                                    onChange={(e) => handleRuleChange(index, e.target.value)}
                                    className="w-full px-4 py-2.5 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 resize-none"
                                    rows={2}
                                    placeholder={`Rule ${index + 1}`}
                                  />
                                </div>
                                <div className="ml-2 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    type="button"
                                    onClick={() => removeRule(index)}
                                    className="text-red-400 hover:text-red-300 bg-red-900/20 hover:bg-red-900/40 rounded-full p-1.5 transition-colors"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            
                            <button
                              type="button"
                              onClick={addRule}
                              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-cyan-300 bg-cyan-900/30 hover:bg-cyan-800/40 rounded-lg border border-cyan-700/50 transition-all duration-200 hover:scale-105"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-1.5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                              Add Rule
                            </button>
                          </div>
                        </div>
                        
                        <div className="pt-6 border-t border-gray-700/50">
                          <div className="flex items-center">
                            <input
                              id="hasPrizePool"
                              name="hasPrizePool"
                              type="checkbox"
                              checked={formData.hasPrizePool}
                              onChange={handleCheckboxChange}
                              className="h-5 w-5 text-cyan-500 rounded focus:ring-cyan-500 focus:ring-offset-gray-900 focus:ring-offset-1 bg-gray-800 cursor-pointer"
                            />
                            <label htmlFor="hasPrizePool" className="ml-2.5 text-base font-medium text-white cursor-pointer">
                              This tournament has prizes
                            </label>
                          </div>
                        </div>
                        
                        {formData.hasPrizePool && (
                          <div className="space-y-6 pt-4 animate-fadeIn bg-black/30 backdrop-blur-md rounded-xl p-6 border border-gray-800">
                            <h3 className="text-lg font-medium text-cyan-300 mb-4">Prize Details</h3>
                            
                            <div className="group">
                              <label htmlFor="prizePool" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                                Total Prize Pool Amount ($)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <Trophy className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                  type="number"
                                  id="prizePool"
                                  name="prizePool"
                                  value={formData.prizePool}
                                  onChange={handleChange}
                                  min="0"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 hover:border-gray-600/90"
                                />
                              </div>
                            </div>
                            
                            <div className="group">
                              <label htmlFor="entryFee" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                                Entry Fee ($ per participant, 0 for free entry)
                              </label>
                              <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                  <span className="text-gray-400 font-bold text-lg">$</span>
                                </div>
                                <input
                                  type="number"
                                  id="entryFee"
                                  name="entryFee"
                                  value={formData.entryFee}
                                  onChange={handleChange}
                                  min="0"
                                  className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 hover:border-gray-600/90"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Review */}
                  {currentStep === 3 && (
                    <div className={stepClasses}>
                      <h2 className="text-2xl font-bold text-white mb-8 flex items-center">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/20 text-cyan-300 mr-3">
                          <Check className="h-5 w-5" />
                        </span>
                        Review Your Tournament
                      </h2>
                      
                      <div className="space-y-6">
                        {/* Replace the existing tournament information section with this new grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div 
                            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300"
                          >
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-4">
                                <Trophy className="h-5 w-5 text-cyan-400" />
                              </div>
                              <div>
                                <h2 className="text-xl font-crashbow text-white">Tournament Details</h2>
                                <p className="text-sm text-gray-400 mt-1">{formData.title || "Untitled Tournament"}</p>
                              </div>
                            </div>                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Type</span>
                                <span className="text-white">{formData.type === 'artist' ? 'Artist Tournament' : 'Producer Tournament'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Genre</span>
                                <span className="text-white">{formData.genre || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Start Date</span>
                                <span className="text-white">{formData.startDate || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">End Date</span>
                                <span className="text-white">{formData.endDate || "Not specified"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Language</span>
                                <span className="text-white">{formData.language || "Any Language"}</span>
                              </div>
                            </div>
                          </div>

                          <div 
                            className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300"
                          >
                            <div className="flex items-center mb-6">
                              <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mr-4">
                                <Users className="h-5 w-5 text-pink-400" />
                              </div>
                              <div>
                                <h2 className="text-xl font-crashbow text-white">Participation</h2>
                                <p className="text-sm text-gray-400 mt-1">Tournament capacity and fees</p>
                              </div>
                            </div>
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Maximum Participants</span>
                                <span className="text-white">{formData.maxParticipants}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Entry Fee</span>
                                <span className="text-white">{formData.entryFee > 0 ? `$${formData.entryFee}` : "Free Entry"}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-gray-400">Prize Pool</span>
                                <span className="text-white">{formData.hasPrizePool ? `$${formData.prizePool}` : "No prizes"}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl bg-black/30 backdrop-blur-md border border-gray-800 p-5">
                          <h3 className="text-lg font-medium text-cyan-400 mb-4 pb-2 border-b border-gray-800">Description</h3>
                          <p className="text-gray-300 whitespace-pre-wrap">{formData.description || "No description provided."}</p>
                        </div>
                        
                        <div className="rounded-xl bg-black/30 backdrop-blur-md border border-gray-800 p-5">
                          <h3 className="text-lg font-medium text-cyan-400 mb-4 pb-2 border-b border-gray-800">Rules</h3>
                          {formData.rules.filter(rule => rule.trim()).length > 0 ? (
                            <ol className="list-decimal list-inside text-gray-300 space-y-2 pl-2">
                              {formData.rules
                                .filter(rule => rule.trim())
                                .map((rule, index) => (
                                  <li key={index} className="pl-1 bg-gray-800/40 p-2 rounded-lg">{rule}</li>
                                ))
                              }
                            </ol>
                          ) : (
                            <p className="text-gray-500 italic">No rules specified.</p>
                          )}
                        </div>
                        
                        <div className="rounded-xl bg-black/30 backdrop-blur-md border border-gray-800 p-5">
                          <h3 className="text-lg font-medium text-cyan-400 mb-4 pb-2 border-b border-gray-800">Prizes</h3>
                          {formData.hasPrizePool ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                              <div className="p-3 bg-gray-800/40 rounded-lg">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Total Prize Pool</p>
                                <p className="text-white font-medium">${formData.prizePool}</p>
                              </div>
                              <div className="p-3 bg-gray-800/40 rounded-lg">
                                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">Entry Fee</p>
                                <p className="text-white font-medium">{formData.entryFee > 0 ? `$${formData.entryFee}` : "Free Entry"}</p>
                              </div>
                            </div>
                          ) : (
                            <p className="text-gray-400 italic">This tournament does not have prizes.</p>
                          )}
                        </div>
                        
                        {!formData.title || !formData.description || !formData.genre || !formData.type || !formData.language || !formData.startDate || !formData.endDate ? (
                          <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-4 flex">
                            <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                            <div>
                              <h3 className="text-sm font-medium text-red-400">Missing required information</h3>
                              <p className="text-xs text-gray-300 mt-1">Please go back and fill in all required fields marked with *.</p>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-12 flex justify-between items-center">
                    {currentStep > 1 && (
                      <button
                        type="button"
                        onClick={prevStep}
                        className="inline-flex items-center px-5 py-2.5 bg-black/20 text-white rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200 group"
                      >
                        <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
                        Previous Step
                      </button>
                    )}
                    
                    {currentStep < 3 && (
                      <button
                        type="button"
                        onClick={nextStep}
                        className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-400 hover:to-pink-400 text-white font-medium rounded-lg shadow-lg transition-all duration-200 ml-auto hover:scale-105"
                        style={{ boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)' }}
                      >
                        Next Step
                        <ChevronRight className="h-4 w-4 ml-1.5" />
                      </button>
                    )}
                      {currentStep === 3 && (
                      <button
                        type="submit"
                        disabled={!formData.title || !formData.description || !formData.genre || !formData.language || !formData.startDate || !formData.endDate}
                        className={`inline-flex items-center px-6 py-3 font-medium rounded-lg shadow-lg ml-auto transition-all duration-200 ${
                          !formData.title || !formData.description || !formData.genre || !formData.language || !formData.startDate || !formData.endDate
                            ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-pink-500 hover:from-blue-400 hover:to-pink-400 text-white hover:scale-105'
                        }`}
                        style={!formData.title || !formData.description || !formData.genre || !formData.language || !formData.startDate || !formData.endDate 
                          ? {} 
                          : { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' }
                        }
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        {!token || !user 
                          ? 'Login & Create Tournament'
                          : !user.isCreator
                          ? 'Become Creator & Create Tournament'
                          : 'Create Tournament'                        }
                      </button>
                    )}
                  </div>
                </form>
                </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Use Tailwind classes or add styles to the global CSS file instead */}
    </div>
  );
};

export default CreateTournamentPage;