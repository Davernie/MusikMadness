import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Info, Music, Trophy, AlertCircle, Globe, Users, ChevronRight, Check, X, User } from 'lucide-react';
import { getGenreColors } from '../utils/tournamentUtils';
import '../components/NeonGlassCard.css';

const CreateTournamentPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    startDate: '',
    endDate: '',
    maxParticipants: 50,
    hasPrizePool: false,
    prizePool: 0,
    entryFee: 0,
    rules: [''],
    coverImage: ''
  });
  
  const genres = [
    'Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'Classical', 'Country', 'R&B', 'Indie', 'Folk'
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
      [name]: value
    });
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would submit the form data to an API
    console.log('Form submitted with data:', formData);
    // Redirect to newly created tournament or success page
  };
  
  // Card background style with dynamically changing gradient based on genre
  const cardBgStyle = {
    background: `
      linear-gradient(135deg, 
        rgba(${colors.primary}, 0.08) 0%, 
        rgba(${colors.primary}, 0.02) 40%, 
        rgba(${colors.secondary}, 0.03) 80%, 
        rgba(${colors.secondary}, 0.08) 100%)
    `,
    boxShadow: `
      0 20px 40px -15px rgba(0,0,0,0.5),
      0 0 25px -5px rgba(${colors.primary}, 0.2),
      0 0 10px -2px rgba(${colors.primary}, 0.15),
      inset 0 1px 1px rgba(255,255,255,0.05)
    `,
    borderImage: `linear-gradient(to bottom, rgba(${colors.primary}, 0.2), rgba(${colors.secondary}, 0.1)) 1`
  };
  
  // Step animation classes
  const stepClasses = `transition-all duration-300 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`;
  
  return (
    <div className="min-h-screen py-12 relative overflow-hidden">
      {/* Background effects */}

      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mb-10">
          <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
            Back to Tournaments
          </Link>
          <h1 
            className="text-4xl font-bold mt-6 tracking-tight leading-none"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              letterSpacing: '2px',
              color: `rgb(${colors.primary})`,
              textShadow: `0 0 10px rgba(${colors.primary}, 0.1), 0 0 20px rgba(${colors.primary}, 0.1)`
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
          <div className="flex items-center justify-between px-2">
            {[
              { step: 1, label: 'Basic Info', icon: Info },
              { step: 2, label: 'Rules & Prizes', icon: Trophy },
              { step: 3, label: 'Review', icon: Check }
            ].map(({step, label, icon: Icon}) => (
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
        
        {/* Enhanced main card */}
        <div 
          className="rounded-2xl backdrop-blur-sm border border-white/10 p-8 mb-8 relative"
          style={cardBgStyle}
        >
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 rounded-tl-2xl -mt-1 -ml-1" 
               style={{borderColor: `rgba(${colors.primary}, 0.4)`}}></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 rounded-br-2xl -mb-1 -mr-1"
               style={{borderColor: `rgba(${colors.primary}, 0.4)`}}></div>
               
          <form onSubmit={handleSubmit}>
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
                  <div className="group">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                      Tournament Title <span className="text-cyan-500">*</span>
                    </label>
                    <input 
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 placeholder:text-gray-500 hover:border-gray-600/90"
                      placeholder="e.g., Summer Beat Battle 2025"
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                      Description <span className="text-cyan-500">*</span>
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 placeholder:text-gray-500 hover:border-gray-600/90 resize-none"
                      placeholder="Describe your tournament, its purpose, and what participants can expect..."
                    />
                  </div>
                  
                  <div className="group">
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                      Music Genre <span className="text-cyan-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Music className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-10 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 appearance-none hover:border-gray-600/90"
                      >
                        <option value="" className="bg-gray-900 text-gray-400">Select a genre</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre} className="bg-gray-900">{genre}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                        Start Date <span className="text-cyan-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 hover:border-gray-600/90 calendar-input"
                        />
                      </div>
                    </div>
                    
                    <div className="group">
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                        End Date <span className="text-cyan-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 hover:border-gray-600/90 calendar-input"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                      Maximum Participants
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 hover:border-gray-600/90"
                      />
                    </div>
                  </div>
                  
                  <div className="group">
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-1.5 group-focus-within:text-cyan-400 transition-colors">
                      Cover Image URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="url"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-gray-800/70 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-white transition-all duration-200 placeholder:text-gray-500 hover:border-gray-600/90"
                        placeholder="e.g., https://images.unsplash.com/..."
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
                  <div className="rounded-xl bg-black/30 backdrop-blur-md border border-gray-800 p-5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-bl-3xl"></div>
                    <h3 className="text-lg font-medium text-cyan-400 mb-4 pb-2 border-b border-gray-800">Tournament Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                      {[
                        { label: "Title", value: formData.title || "Not specified" },
                        { label: "Genre", value: formData.genre || "Not specified" },
                        { label: "Start Date", value: formData.startDate || "Not specified" },
                        { label: "End Date", value: formData.endDate || "Not specified" },
                        { label: "Maximum Participants", value: formData.maxParticipants }
                      ].map((field, i) => (
                        <div key={i} className="p-3 bg-gray-800/40 rounded-lg">
                          <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">{field.label}</p>
                          <p className="text-white font-medium">{String(field.value)}</p>
                        </div>
                      ))}
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
                  
                  {!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate ? (
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
                  className="inline-flex items-center px-5 py-2.5 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 hover:text-white transition-all duration-200 group"
                >
                  <ArrowLeft className="h-4 w-4 mr-1.5 group-hover:-translate-x-1 transition-transform duration-200" />
                  Previous Step
                </button>
              )}
              
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 text-white font-medium rounded-lg shadow-lg transition-all duration-200 ml-auto hover:scale-105"
                  style={{ boxShadow: '0 0 15px rgba(0, 204, 255, 0.3)' }}
                >
                  Next Step
                  <ChevronRight className="h-4 w-4 ml-1.5" />
                </button>
              )}
              
              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate}
                  className={`inline-flex items-center px-6 py-3 font-medium rounded-lg shadow-lg ml-auto transition-all duration-200 ${
                    !formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white hover:scale-105'
                  }`}
                  style={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate 
                    ? {} 
                    : { boxShadow: '0 0 20px rgba(45, 212, 191, 0.4)' }
                  }
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  Create Tournament
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Global styles for animations and special elements */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .bg-grid-pattern {
          background-image: linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 20px 20px;
        }
        
        .calendar-input::-webkit-calendar-picker-indicator {
          filter: invert(1);
          opacity: 0.5;
          cursor: pointer;
        }
        
        input[type="date"]:required:invalid::-webkit-datetime-edit {
          color: transparent;
        }
        
        input[type="date"]:focus::-webkit-datetime-edit {
          color: white;
        }
      `}</style>
    </div>
  );
};

export default CreateTournamentPage;