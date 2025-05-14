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
    <div className="min-h-screen py-12 bg-gray-900 bg-[radial-gradient(ellipse_at_center,_rgba(0,204,255,0.05)_0%,transparent_70%)]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-300 hover:text-cyan-400 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Tournaments
          </Link>
          
          {/* Clipboard Title Bar */}
          <div className="mt-6 flex justify-center relative">
            <div className="absolute -top-6 w-24 h-12 bg-gradient-to-b from-slate-400 to-slate-600 rounded-t-lg z-10 flex items-center justify-center overflow-hidden shadow-xl">
              <div className="w-16 h-5 bg-slate-300 rounded-sm flex items-center justify-center">
                <div className="w-10 h-2 bg-slate-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Clipboard Body */}
        <div className="relative pt-6 pb-8 bg-gradient-to-b from-slate-200 to-slate-100 rounded-lg shadow-2xl overflow-hidden">
          {/* Clipboard texture overlay */}
          <div className="absolute inset-0 opacity-5 pointer-events-none" 
               style={{backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.1' fill-rule='evenodd'/%3E%3C/svg%3E")`}}>
          </div>
          
          <div className="relative px-8 pt-2">
            <h1 className="text-center font-bold text-3xl text-gray-800 mb-8"
                style={{ 
                  fontFamily: "'Crashbow', 'Impact', sans-serif",
                  letterSpacing: '1px',
                  textShadow: '1px 1px 0 rgba(0,0,0,0.1)'
                }}>
              CREATE NEW TOURNAMENT
            </h1>
            
            {/* Clipboard holes */}
            <div className="absolute left-4 top-20 bottom-8 w-6 flex flex-col justify-between pointer-events-none opacity-70">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-4 h-4 rounded-full bg-gray-300 border-2 border-gray-400 shadow-inner"></div>
              ))}
            </div>
            
            {/* Progress indicator */}
            <div className="mb-8 px-6">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex flex-col items-center group">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transform transition-all
                      ${currentStep >= step 
                        ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-100' 
                        : 'bg-gray-200 text-gray-500 border border-gray-300 scale-90'}
                      ${currentStep === step ? 'ring-4 ring-cyan-300/50' : ''}
                    `}
                    style={currentStep >= step ? {
                      boxShadow: '0 0 15px rgba(56, 189, 248, 0.5)'
                    } : {}}
                    >
                      {step}
                    </div>
                    <div className={`text-sm mt-2 font-medium
                      ${currentStep >= step ? 'text-gray-800' : 'text-gray-500'}`}>
                      {step === 1 ? 'Basic Info' : step === 2 ? 'Rules & Prizes' : 'Review'}
                    </div>
                  </div>
                ))}
              </div>
              <div className="relative mt-4">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="h-1 w-full bg-gray-300 rounded-full"></div>
                </div>
                <div className="relative flex justify-start">
                  <div 
                    className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-in-out" 
                    style={{ width: `${(currentStep - 1) * 50}%` }}
                  ></div>
                </div>
              </div>
            </div>
            
            <div className="ml-8 mr-2">
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="p-1.5 mr-3 rounded-full bg-cyan-500 text-white">
                        <Info className="h-4 w-4" />
                      </div>
                      Tournament Details
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="group">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                          Tournament Title *
                        </label>
                        <input 
                          type="text"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                          placeholder="e.g., Summer Beat Battle 2025"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea 
                          id="description"
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          required
                          rows={4}
                          className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                          placeholder="Describe your tournament, its purpose, and what participants can expect..."
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 appearance-none transition-shadow"
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
                          <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
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
                              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
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
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                            placeholder="e.g., https://images.unsplash.com/..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Step 2: Rules and Prizes */}
                {currentStep === 2 && (
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="p-1.5 mr-3 rounded-full bg-cyan-500 text-white">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                      Rules & Prizes
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Tournament Rules
                        </label>
                        <div className="space-y-3 bg-white/50 rounded-lg border border-gray-300 p-4">
                          {formData.rules.map((rule, index) => (
                            <div key={index} className="flex items-start group animate-slideIn" style={{animationDelay: `${index * 50}ms`}}>
                              <div className="flex-shrink-0 pt-1">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-cyan-100 border border-cyan-300 text-xs font-medium text-cyan-800">
                                  {index + 1}
                                </span>
                              </div>
                              <div className="ml-2 flex-grow">
                                <textarea
                                  value={rule}
                                  onChange={(e) => handleRuleChange(index, e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                                  rows={2}
                                  placeholder={`Rule ${index + 1}`}
                                />
                              </div>
                              <div className="ml-2 flex-shrink-0">
                                <button
                                  type="button"
                                  onClick={() => removeRule(index)}
                                  className="text-red-500 hover:bg-red-50 p-1 rounded-full hover:shadow-sm transition-all opacity-70 hover:opacity-100"
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
                            className="mt-2 inline-flex items-center px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-100 hover:bg-cyan-200 rounded-lg border border-cyan-200 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-4 w-4 mr-1">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Add Rule
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-300">
                        <div className="flex items-start">
                          <div className="flex items-center h-5">
                            <input
                              id="hasPrizePool"
                              name="hasPrizePool"
                              type="checkbox"
                              checked={formData.hasPrizePool}
                              onChange={handleCheckboxChange}
                              className="h-4 w-4 text-cyan-500 border-gray-300 rounded focus:ring-cyan-500"
                            />
                          </div>
                          <div className="ml-3">
                            <label htmlFor="hasPrizePool" className="text-sm font-medium text-gray-700">
                              This tournament has prizes
                            </label>
                          </div>
                        </div>
                      </div>
                      
                      {formData.hasPrizePool && (
                        <div className="space-y-6 pt-4 animate-fadeIn bg-white/50 rounded-lg border border-gray-300 p-4 mt-4">
                          <div>
                            <label htmlFor="prizePool" className="block text-sm font-medium text-gray-700 mb-1">
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
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
                              />
                            </div>
                          </div>
                          
                          <div>
                            <label htmlFor="entryFee" className="block text-sm font-medium text-gray-700 mb-1">
                              Entry Fee ($ per participant, 0 for free entry)
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-medium">$</span>
                              </div>
                              <input
                                type="number"
                                id="entryFee"
                                name="entryFee"
                                value={formData.entryFee}
                                onChange={handleChange}
                                min="0"
                                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-gray-800 transition-shadow"
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
                  <div className="animate-fadeIn">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                      <div className="p-1.5 mr-3 rounded-full bg-cyan-500 text-white">
                        <Trophy className="h-4 w-4" />
                      </div>
                      Review Your Tournament
                    </h2>
                    
                    <div className="space-y-5">
                      <div className="rounded-xl bg-white border border-gray-300 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-3 border-b border-gray-200 pb-2">Tournament Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500 font-medium">Title</p>
                            <p className="text-gray-800 font-semibold">{formData.title || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Genre</p>
                            <p className="text-gray-800 font-semibold">{formData.genre || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Start Date</p>
                            <p className="text-gray-800">{formData.startDate || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">End Date</p>
                            <p className="text-gray-800">{formData.endDate || "Not specified"}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 font-medium">Maximum Participants</p>
                            <p className="text-gray-800">{formData.maxParticipants}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="rounded-xl bg-white border border-gray-300 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-gray-200 pb-2">Description</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{formData.description || "No description provided."}</p>
                      </div>
                      
                      <div className="rounded-xl bg-white border border-gray-300 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-gray-200 pb-2">Rules</h3>
                        {formData.rules.filter(rule => rule.trim()).length > 0 ? (
                          <ol className="list-decimal list-inside text-gray-700 space-y-1 pl-2">
                            {formData.rules.map((rule, index) => (
                              rule.trim() ? <li key={index} className="pl-1">{rule}</li> : null
                            ))}
                          </ol>
                        ) : (
                          <p className="text-gray-500 italic">No rules specified.</p>
                        )}
                      </div>
                      
                      <div className="rounded-xl bg-white border border-gray-300 p-4 shadow-sm">
                        <h3 className="text-lg font-medium text-gray-800 mb-2 border-b border-gray-200 pb-2">Prizes</h3>
                        {formData.hasPrizePool ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500 font-medium">Total Prize Pool</p>
                              <p className="text-gray-800 font-semibold">${formData.prizePool}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 font-medium">Entry Fee</p>
                              <p className="text-gray-800 font-semibold">{formData.entryFee > 0 ? `$${formData.entryFee}` : "Free Entry"}</p>
                            </div>
                          </div>
                        ) : (
                          <p className="text-gray-500 italic">This tournament does not have prizes.</p>
                        )}
                      </div>
                      
                      {!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate ? (
                        <div className="rounded-xl bg-red-50 border border-red-300 p-4 flex">
                          <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
                          <div>
                            <h3 className="text-sm font-medium text-red-800">Missing required information</h3>
                            <p className="text-sm text-red-700 mt-1">Please go back and fill in all required fields.</p>
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
                      className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg border border-gray-300 hover:bg-gray-300 hover:text-gray-800 transition-colors shadow-sm"
                    >
                      Previous
                    </button>
                  )}
                  
                  {currentStep < 3 && (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-colors ml-auto"
                      style={{ boxShadow: '0 0 15px rgba(56, 189, 248, 0.3)' }}
                    >
                      Next
                    </button>
                  )}
                  
                  {currentStep === 3 && (
                    <button
                      type="submit"
                      disabled={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate}
                      className={`inline-flex items-center px-6 py-3 text-white rounded-lg shadow-md ml-auto transition-all
                        ${!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 hover:scale-105'
                        }`}
                      style={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate 
                        ? {} 
                        : { boxShadow: '0 0 20px rgba(56, 189, 248, 0.4)' }
                      }
                    >
                      Create Tournament
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
          
          {/* Subtle corner fold effect */}
          <div className="absolute top-0 right-0 w-0 h-0 border-t-16 border-r-16 border-t-slate-300 border-r-slate-400 shadow-md"></div>
        </div>
      </div>
      
      {/* Add animation keyframes to the global style */}
      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default CreateTournamentPage;