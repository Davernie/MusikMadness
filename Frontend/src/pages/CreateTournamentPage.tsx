import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Info, Music, Trophy, AlertCircle, Globe, Users } from 'lucide-react';
import { getGenreColors } from '../utils/tournamentUtils';

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
  
  const cardGlowStyles = {
    boxShadow: `
      0 0 20px 2px rgba(${colors.primary}, 0.2),
      0 0 30px 4px rgba(${colors.primary}, 0.2),
      0 0 40px 6px rgba(${colors.primary}, 0.1)
    `,
    background: `rgba(${colors.primary}, 0.05)`,
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
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
    setCurrentStep(currentStep + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo(0, 0);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would submit the form data to an API
    console.log('Form submitted with data:', formData);
    // Redirect to newly created tournament or success page
  };
  
  return (
    <div className="bg-gray-900 min-h-screen py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tournaments
          </Link>
          <h1 
            className="text-3xl font-bold mt-4"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              letterSpacing: '2px',
              color: `rgb(${colors.primary})`,
              textShadow: `0 0 10px rgba(${colors.primary}, 0.5), 0 0 20px rgba(${colors.primary}, 0.3)`
            }}
          >
            CREATE NEW TOURNAMENT
          </h1>
          <p className="text-gray-300 mt-2">
            Set up a new competition for musicians to showcase their talent
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-sm ${
                  currentStep >= step 
                    ? `bg-cyan-500/80 text-white shadow-lg` 
                    : 'bg-gray-800/50 text-gray-400 border border-white/10'
                }`}
                style={currentStep >= step ? {
                  boxShadow: '0 0 15px rgba(0, 204, 255, 0.6)'
                } : {}}
                >
                  {step}
                </div>
                <div className="text-xs mt-2 text-gray-400">
                  {step === 1 ? 'Basic Info' : step === 2 ? 'Rules & Prizes' : 'Review'}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="h-0.5 w-full bg-gray-700"></div>
            </div>
            <div className="relative flex justify-between">
              <div className={`h-0.5 ${currentStep >= 2 ? 'bg-cyan-500' : 'bg-gray-700'}`} style={{ width: '50%' }}></div>
              <div className={`h-0.5 ${currentStep >= 3 ? 'bg-cyan-500' : 'bg-gray-700'}`} style={{ width: '50%' }}></div>
            </div>
          </div>
        </div>
        
        <div 
          className="rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 p-6 mb-8"
          style={cardGlowStyles}
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Tournament Details</h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                      Tournament Title *
                    </label>
                    <input 
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                      placeholder="e.g., Summer Beat Battle 2025"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">
                      Description *
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                      placeholder="Describe your tournament, its purpose, and what participants can expect..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">
                      Music Genre *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Music className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        id="genre"
                        name="genre"
                        value={formData.genre}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white appearance-none"
                      >
                        <option value="">Select a genre</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">
                        Start Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">
                        End Date *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Calendar className="h-5 w-5 text-gray-400" />
                        </div>
                        <input 
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          required
                          className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1">
                      Maximum Participants
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Users className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="number"
                        id="maxParticipants"
                        name="maxParticipants"
                        value={formData.maxParticipants}
                        onChange={handleChange}
                        min="1"
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-1">
                      Cover Image URL
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <input 
                        type="url"
                        id="coverImage"
                        name="coverImage"
                        value={formData.coverImage}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                        placeholder="e.g., https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Rules and Prizes */}
            {currentStep === 2 && (
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Rules & Prizes</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Tournament Rules
                    </label>
                    <div className="space-y-3">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-start">
                          <div className="flex-shrink-0 pt-1">
                            <span className="flex items-center justify-center w-6 h-6 rounded-full border border-white/20 text-xs text-gray-300">
                              {index + 1}
                            </span>
                          </div>
                          <div className="ml-2 flex-grow">
                            <textarea
                              value={rule}
                              onChange={(e) => handleRuleChange(index, e.target.value)}
                              className="w-full px-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                              rows={2}
                              placeholder={`Rule ${index + 1}`}
                            />
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => removeRule(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-5 w-5">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addRule}
                        className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-cyan-400 bg-gray-800/70 hover:bg-gray-700 rounded-lg border border-white/10 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-1">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add Rule
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="hasPrizePool"
                          name="hasPrizePool"
                          type="checkbox"
                          checked={formData.hasPrizePool}
                          onChange={handleCheckboxChange}
                          className="h-4 w-4 text-cyan-500 border-white/10 rounded focus:ring-cyan-400 bg-gray-800/70 checked:bg-cyan-500"
                        />
                      </div>
                      <div className="ml-3">
                        <label htmlFor="hasPrizePool" className="text-sm font-medium text-gray-300">
                          This tournament has prizes
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {formData.hasPrizePool && (
                    <div className="space-y-6 pt-4 animate-fadeIn">
                      <div>
                        <label htmlFor="prizePool" className="block text-sm font-medium text-gray-300 mb-1">
                          Total Prize Pool Amount ($)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Trophy className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="number"
                            id="prizePool"
                            name="prizePool"
                            value={formData.prizePool}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="entryFee" className="block text-sm font-medium text-gray-300 mb-1">
                          Entry Fee ($ per participant, 0 for free entry)
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-400 font-bold">$</span>
                          </div>
                          <input
                            type="number"
                            id="entryFee"
                            name="entryFee"
                            value={formData.entryFee}
                            onChange={handleChange}
                            min="0"
                            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-white/10 rounded-lg shadow-sm focus:ring-cyan-500 focus:border-cyan-500 text-white"
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
              <div>
                <h2 className="text-xl font-bold text-white mb-6">Review Your Tournament</h2>
                
                <div className="space-y-6">
                  <div className="rounded-xl bg-gray-800/50 border border-white/10 p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Tournament Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Title</p>
                        <p className="text-white">{formData.title || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Genre</p>
                        <p className="text-white">{formData.genre || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Start Date</p>
                        <p className="text-white">{formData.startDate || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">End Date</p>
                        <p className="text-white">{formData.endDate || "Not specified"}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Maximum Participants</p>
                        <p className="text-white">{formData.maxParticipants}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-xl bg-gray-800/50 border border-white/10 p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Description</h3>
                    <p className="text-gray-300 whitespace-pre-wrap">{formData.description || "No description provided."}</p>
                  </div>
                  
                  <div className="rounded-xl bg-gray-800/50 border border-white/10 p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Rules</h3>
                    {formData.rules.length > 0 ? (
                      <ul className="list-decimal list-inside text-gray-300 space-y-1">
                        {formData.rules.map((rule, index) => (
                          <li key={index}>{rule || `Rule ${index + 1} (empty)`}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-400">No rules specified.</p>
                    )}
                  </div>
                  
                  <div className="rounded-xl bg-gray-800/50 border border-white/10 p-4">
                    <h3 className="text-lg font-medium text-white mb-2">Prizes</h3>
                    {formData.hasPrizePool ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Total Prize Pool</p>
                          <p className="text-white">${formData.prizePool}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Entry Fee</p>
                          <p className="text-white">{formData.entryFee > 0 ? `$${formData.entryFee}` : "Free Entry"}</p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-400">This tournament does not have prizes.</p>
                    )}
                  </div>
                  
                  {!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate ? (
                    <div className="rounded-xl bg-red-900/20 border border-red-500/30 p-4 flex">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-red-400">Missing required information</h3>
                        <p className="text-xs text-gray-300 mt-1">Please go back and fill in all required fields.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            
            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 bg-gray-800/70 text-gray-300 rounded-lg border border-white/10 hover:bg-gray-700 transition-colors"
                >
                  Previous
                </button>
              )}
              
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg shadow-lg transition-colors ml-auto"
                  style={{ boxShadow: '0 0 15px rgba(0, 204, 255, 0.3)' }}
                >
                  Next
                </button>
              )}
              
              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate}
                  className={`inline-flex items-center px-6 py-3 text-white rounded-lg shadow-lg ml-auto transition-colors ${
                    !formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-cyan-600 hover:bg-cyan-700'
                  }`}
                  style={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate 
                    ? {} 
                    : { boxShadow: '0 0 20px rgba(0, 204, 255, 0.4)' }
                  }
                >
                  Create Tournament
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTournamentPage;