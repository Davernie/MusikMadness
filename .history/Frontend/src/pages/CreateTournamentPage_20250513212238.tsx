import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowLeft, Info, Music, Trophy, AlertCircle, Globe, Users, ChevronRight, ChevronLeft, ListChecks, Award, PlusCircle, XCircle } from 'lucide-react';
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

  // Animation for step content
  const stepContentClass = "transition-opacity duration-500 ease-in-out";
  
  return (
    <div className="min-h-screen py-12 bg-gray-900 bg-opacity-95 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700/20 via-transparent to-transparent">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link to="/tournaments" className="inline-flex items-center text-sm text-gray-400 hover:text-cyan-400 transition-colors group">
            <ArrowLeft className="h-4 w-4 mr-1.5 transform transition-transform group-hover:-translate-x-0.5" />
            Back to Tournaments
          </Link>
          <h1 
            className="text-4xl font-bold mt-4 tracking-wider"
            style={{ 
              fontFamily: "'Crashbow', 'Impact', sans-serif",
              color: `rgb(${colors.primary})`,
              textShadow: `0 0 8px rgba(${colors.primary}, 0.6), 0 0 16px rgba(${colors.primary}, 0.4), 1px 1px 2px rgba(0,0,0,0.5)`
            }}
          >
            CREATE NEW TOURNAMENT
          </h1>
          <p className="text-gray-300 mt-2 text-base">
            Set up a new competition for musicians to showcase their talent. Follow the steps below.
          </p>
        </div>
        
        {/* Progress indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {[
              { step: 1, label: 'Basic Info', icon: <Info size={18}/> }, 
              { step: 2, label: 'Rules & Prizes', icon: <ListChecks size={18}/> }, 
              { step: 3, label: 'Review', icon: <Award size={18}/> }
            ].map(({step, label, icon}) => (
              <div key={step} className="flex flex-col items-center text-center w-1/3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300
                  ${currentStep >= step 
                    ? `bg-cyan-500/90 border-cyan-400 text-white shadow-lg shadow-cyan-500/30` 
                    : `bg-gray-800 border-gray-700 text-gray-500`
                }`}
                >
                  {icon}
                </div>
                <div className={`text-xs mt-2 font-medium transition-colors duration-300 ${currentStep >= step ? 'text-cyan-400' : 'text-gray-500'}`}>
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="relative mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${((currentStep -1) / 2) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <div 
          className="rounded-2xl overflow-hidden backdrop-blur-md border border-white/10 p-6 sm:p-8 mb-8 shadow-2xl"
          style={{
            background: `rgba(${colors.primary}, 0.03)`, // Softer background
            boxShadow: `
              0 0 25px 3px rgba(${colors.primary}, 0.15),
              0 0 35px 5px rgba(${colors.primary}, 0.1),
              0 0 45px 7px rgba(${colors.primary}, 0.05)
            `,
          }}
        >
          <form onSubmit={handleSubmit}>
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className={stepContentClass}>
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <Info className="h-6 w-6 mr-3 text-cyan-400" />
                  Tournament Details
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Tournament Title *
                    </label>
                    <input 
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                      placeholder="e.g., Summer Beat Battle 2025"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Description *
                    </label>
                    <textarea 
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                      placeholder="Describe your tournament, its purpose, and what participants can expect..."
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1.5">
                      Music Genre *
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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white appearance-none transition-all"
                      >
                        <option value="" className="text-gray-500">Select a genre</option>
                        {genres.map((genre) => (
                          <option key={genre} value={genre} className="bg-gray-800 text-white">{genre}</option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <ChevronRight className="h-5 w-5 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1.5">
                        Start Date *
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
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1.5">
                        End Date *
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
                          className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-300 mb-1.5">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="coverImage" className="block text-sm font-medium text-gray-300 mb-1.5">
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
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                        placeholder="e.g., https://images.unsplash.com/..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 2: Rules and Prizes */}
            {currentStep === 2 && (
              <div className={stepContentClass}>
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <ListChecks className="h-6 w-6 mr-3 text-cyan-400" />
                  Rules & Prizes
                </h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tournament Rules
                    </label>
                    <div className="space-y-3 p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg">
                      {formData.rules.map((rule, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <span className="flex-shrink-0 mt-1.5 flex items-center justify-center w-6 h-6 rounded-full border-2 border-cyan-500/70 text-xs text-cyan-300 font-semibold">
                            {index + 1}
                          </span>
                          <textarea
                            value={rule}
                            onChange={(e) => handleRuleChange(index, e.target.value)}
                            className="flex-grow px-3 py-2 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 text-white placeholder-gray-500 transition-all"
                            rows={2}
                            placeholder={`Rule ${index + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeRule(index)}
                            className="flex-shrink-0 mt-1 text-red-500 hover:text-red-400 p-1 rounded-full hover:bg-red-500/10 transition-colors"
                          >
                            <XCircle size={20} />
                          </button>
                        </div>
                      ))}
                      
                      <button
                        type="button"
                        onClick={addRule}
                        className="mt-2 inline-flex items-center px-3.5 py-1.5 text-sm font-medium text-cyan-300 bg-cyan-600/20 hover:bg-cyan-600/40 rounded-lg border border-cyan-500/50 transition-colors"
                      >
                        <PlusCircle size={16} className="mr-1.5" />
                        Add Rule
                      </button>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-700/50">
                    <div className="flex items-center">
                      <input
                        id="hasPrizePool"
                        name="hasPrizePool"
                        type="checkbox"
                        checked={formData.hasPrizePool}
                        onChange={handleCheckboxChange}
                        className="h-4 w-4 text-cyan-500 border-gray-600 rounded focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 bg-gray-700 checked:bg-cyan-500 checked:border-cyan-500"
                      />
                      <label htmlFor="hasPrizePool" className="ml-3 text-sm font-medium text-gray-300">
                        This tournament has prizes
                      </label>
                    </div>
                  </div>
                  
                  {formData.hasPrizePool && (
                    <div className={`space-y-6 pt-4 ${stepContentClass} p-4 bg-gray-800/30 border border-gray-700/50 rounded-lg`}>
                      <div>
                        <label htmlFor="prizePool" className="block text-sm font-medium text-gray-300 mb-1.5">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="entryFee" className="block text-sm font-medium text-gray-300 mb-1.5">
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
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-800/60 border-2 border-gray-700/80 rounded-lg shadow-sm focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-white transition-all"
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
              <div className={stepContentClass}>
                <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
                  <Award className="h-6 w-6 mr-3 text-cyan-400" />
                  Review Your Tournament
                </h2>
                
                <div className="space-y-5">
                  {[
                    { title: "Tournament Information", fields: [
                      { label: "Title", value: formData.title || "Not specified" },
                      { label: "Genre", value: formData.genre || "Not specified" },
                      { label: "Start Date", value: formData.startDate || "Not specified" },
                      { label: "End Date", value: formData.endDate || "Not specified" },
                      { label: "Max Participants", value: formData.maxParticipants },
                    ]},
                    { title: "Description", content: formData.description || "No description provided." },
                    { title: "Rules", rules: formData.rules },
                    { title: "Prizes", prizeInfo: formData.hasPrizePool ? [
                      { label: "Total Prize Pool", value: `$${formData.prizePool}` },
                      { label: "Entry Fee", value: formData.entryFee > 0 ? `$${formData.entryFee}` : "Free Entry" },
                    ] : "This tournament does not have prizes." },
                  ].map((section, idx) => (
                    <div key={idx} className="rounded-xl bg-gray-800/40 border border-gray-700/60 p-4 shadow-md">
                      <h3 className="text-lg font-medium text-cyan-400 mb-2.5 border-b border-gray-700 pb-2">{section.title}</h3>
                      {section.fields && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          {section.fields.map(field => (
                            <div key={field.label}>
                              <p className="text-gray-400">{field.label}</p>
                              <p className="text-white font-medium">{String(field.value)}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      {section.content && <p className="text-gray-300 whitespace-pre-wrap text-sm">{section.content}</p>}
                      {section.rules && (
                        formData.rules.filter(r => r.trim()).length > 0 ? (
                          <ul className="list-decimal list-inside text-gray-300 space-y-1.5 text-sm pl-2">
                            {formData.rules.filter(r => r.trim()).map((rule, index) => (
                              <li key={index}>{rule}</li>
                            ))}
                          </ul>
                        ) : <p className="text-gray-400 italic text-sm">No rules specified.</p>
                      )}
                      {section.prizeInfo && typeof section.prizeInfo === 'string' && <p className="text-gray-400 italic text-sm">{section.prizeInfo}</p>}
                      {section.prizeInfo && Array.isArray(section.prizeInfo) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                          {section.prizeInfo.map(info => (
                            <div key={info.label}>
                              <p className="text-gray-400">{info.label}</p>
                              <p className="text-white font-medium">{info.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate ? (
                    <div className="rounded-xl bg-red-900/30 border border-red-500/50 p-4 flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-400 mr-2.5 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-semibold text-red-300">Missing required information</h3>
                        <p className="text-xs text-red-400/80 mt-1">Please go back and fill in all required fields marked with *.</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            )}
            
            <div className="mt-10 flex justify-between items-center">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-4 py-2 bg-gray-700/70 text-gray-300 rounded-lg border border-gray-600 hover:bg-gray-600/90 hover:text-white transition-all duration-150 shadow-md hover:shadow-lg"
                >
                  <ChevronLeft size={18} className="mr-1.5" />
                  Previous
                </button>
              ) : <div></div> /* Placeholder for alignment */}
              
              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-cyan-500/40 transition-all duration-150 transform hover:scale-105"
                >
                  Next
                  <ChevronRight size={18} className="ml-1.5" />
                </button>
              )}
              
              {currentStep === 3 && (
                <button
                  type="submit"
                  disabled={!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate}
                  className={`inline-flex items-center px-6 py-3 text-white font-semibold rounded-lg shadow-lg transition-all duration-150 transform hover:scale-105
                    ${!formData.title || !formData.description || !formData.genre || !formData.startDate || !formData.endDate
                      ? 'bg-gray-600 cursor-not-allowed opacity-70'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-emerald-500/40'
                    }`}
                >
                  <Trophy size={18} className="mr-2" />
                  Create Tournament
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
      <style jsx global>{`
        /* Custom scrollbar for webkit browsers */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: #1f2937; /* gray-800 */
        }
        ::-webkit-scrollbar-thumb {
          background: #374151; /* gray-700 */
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4b5563; /* gray-600 */
        }
        /* Custom styles for date input placeholder */
        input[type="date"]:required:invalid::-webkit-datetime-edit {
            color: transparent;
        }
        input[type="date"]:focus::-webkit-datetime-edit {
            color: white !important;
        }
         input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(0.8) brightness(100%) sepia(20%) saturate(10000%) hue-rotate(180deg);
            cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default CreateTournamentPage;