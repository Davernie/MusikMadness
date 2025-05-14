import React, { useState } from 'react';
import { Bell, Lock, User, Volume2, Globe, Settings, ShieldCheck, Headphones, Monitor } from 'lucide-react';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [volume, setVolume] = useState(80);
  

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <div className="relative p-8 rounded-xl overflow-hidden backdrop-blur-lg border border-white/10 bg-gradient-to-br from-white/10 to-white/5">
              {/* Glassmorphic glow effects */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-pink-500/10" />
              <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-blue-500/20 blur-3xl" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-pink-500/20 blur-3xl" />
              
              {/* Content */}
              <div className="relative space-y-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-24 h-24 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <button className="px-4 py-2 bg-white/10 hover:bg-white/20 transition-colors rounded-lg text-sm font-medium">
                      Change Avatar
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Display Name</label>
                  <input
                    type="text"
                    className="mt-1 block w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    placeholder="Your display name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300">Bio</label>
                  <textarea
                    className="mt-1 block w-full bg-black/20 border border-white/10 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
                    rows={3}
                    placeholder="Tell us about yourself"
                  />
                </div>

                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-6 py-2 rounded-lg font-medium transition-all duration-300 backdrop-blur-sm">
                    Update Profile
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Notification Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Tournament Updates</span>
                  <span className="text-sm text-gray-400">Get notified about tournament status changes</span>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    emailNotifications ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">New Messages</span>
                  <span className="text-sm text-gray-400">Receive notifications for new messages</span>
                </div>
                <button
                  onClick={() => setPushNotifications(!pushNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    pushNotifications ? 'bg-blue-500' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Audio Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <label className="block text-sm font-medium text-gray-300 mb-2">Player Volume</label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-right text-sm text-gray-400 mt-1">{volume}%</div>
              </div>
            </div>
          </div>
        );
      case 'language':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Language Settings</h2>
            <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
              </select>
            </div>
          </div>
        );      case 'billing':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Billing & Payments</h2>
            <div className="space-y-4">
              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Payment Methods</h3>
                <div className="flex items-center justify-between p-4 bg-gray-800/40 rounded-lg mb-4">
                  <div className="flex items-center">
                    <div className="w-12 h-8 bg-white rounded-md flex items-center justify-center mr-4">
                      <svg className="w-8 h-8 text-blue-600" viewBox="0 0 48 48" fill="none">
                        <path d="M44 11H4V37H44V11Z" fill="#E1E1E1"/>
                        <path d="M19 24C19 20.134 22.134 17 26 17C29.866 17 33 20.134 33 24C33 27.866 29.866 31 26 31C22.134 31 19 27.866 19 24Z" fill="#FFA726"/>
                        <path d="M25 24C25 22.343 26.343 21 28 21C29.657 21 31 22.343 31 24C31 25.657 29.657 27 28 27C26.343 27 25 25.657 25 24Z" fill="#FF9800"/>
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">Mastercard ending in 4242</p>
                      <p className="text-sm text-gray-400">Expires 12/25</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-white transition-colors">
                    Edit
                  </button>
                </div>
                <button className="w-full bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 px-6 py-2 rounded-lg font-medium transition-all duration-300">
                  Add Payment Method
                </button>
              </div>

              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Subscription</h3>
                <div className="bg-gray-800/40 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-white font-medium">Pro Plan</p>
                      <p className="text-sm text-gray-400">Billed monthly</p>
                    </div>
                    <span className="text-white font-bold">$9.99/mo</span>
                  </div>
                  <div className="flex space-x-4">
                    <button className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 px-4 py-2 rounded-lg text-white transition-colors">
                      Change Plan
                    </button>
                    <button className="flex-1 bg-red-500/20 hover:bg-red-500/30 px-4 py-2 rounded-lg text-red-400 transition-colors">
                      Cancel
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-bold text-white mb-4">Billing History</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-gray-800/40 rounded-lg">
                    <div>
                      <p className="text-white">April 2025</p>
                      <p className="text-sm text-gray-400">Pro Plan Monthly</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      Download
                    </button>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-gray-800/40 rounded-lg">
                    <div>
                      <p className="text-white">March 2025</p>
                      <p className="text-sm text-gray-400">Pro Plan Monthly</p>
                    </div>
                    <button className="text-blue-400 hover:text-blue-300 transition-colors">
                      Download
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Security Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <label className="block text-sm font-medium text-gray-300">Current Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Confirm new password"
                  />
                </div>
                <div className="pt-4">
                  <button className="w-full bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-6 py-2 rounded-md font-medium transition-all duration-300">
                    Update Password
                  </button>
                </div>
              </div>
              <div className="p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-white">Two-Factor Authentication</span>
                    <span className="text-sm text-gray-400">Add an extra layer of security</span>
                  </div>
                  <button className="bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-4 py-2 rounded-md font-medium transition-all duration-300">
                    Enable
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      case 'preferences':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">User Preferences</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Private Profile</span>
                  <span className="text-sm text-gray-400">Only registered users can view your profile</span>
                </div>
                <button
                  onClick={() => {}}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-gray-600"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg backdrop-blur-sm">
                <div>
                  <span className="block text-white">Show Tournament History</span>
                  <span className="text-sm text-gray-400">Display your past tournament participation</span>
                </div>
                <button
                  onClick={() => {}}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 bg-blue-500"
                >
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4">
      <div className="w-full max-w-[1400px] mt-[-100px] rounded-2xl bg-black/20 border border-white/5 backdrop-blur-xl overflow-hidden">
        {/* Header */}
        <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500"></div>
        
        <div className="py-8 px-6">
          {/* Title section */}
          <div className="mb-8">
            <h1 className="text-4xl font-crashbow text-white tracking-wider mb-2">Settings</h1>
            <p className="text-gray-400">Customize your MusikMadness experience</p>
          </div>

          {/* Settings grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">            {/* Profile Settings */}
            <div 
              onClick={() => setActiveTab('profile')}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center mr-4">
                  <User className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Profile</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your account information</p>
                </div>
              </div>
              {/* Profile settings content */}
              <div className="space-y-4">
                {/* Form fields would go here */}
              </div>
            </div>            {/* Notification Settings */}
            <div 
              onClick={() => setActiveTab('notifications')} 
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-pink-500/10 flex items-center justify-center mr-4">
                  <Bell className="h-5 w-5 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Notifications</h2>
                  <p className="text-sm text-gray-400 mt-1">Configure your notification preferences</p>
                </div>
              </div>
              {/* Notification settings content */}
              <div className="space-y-4">
                {/* Toggle switches would go here */}
              </div>
            </div>            {/* Audio Settings */}
            <div 
              onClick={() => setActiveTab('audio')}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center mr-4">
                  <Headphones className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Audio</h2>
                  <p className="text-sm text-gray-400 mt-1">Customize your sound settings</p>
                </div>
              </div>
              {/* Audio settings content */}
              <div className="space-y-4">
                {/* Audio controls would go here */}
              </div>
            </div>            {/* Billing Settings */}
            <div 
              onClick={() => setActiveTab('billing')}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-4">
                  <svg className="h-5 w-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Billing & Payments</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your payment methods and subscriptions</p>
                </div>
              </div>
              {/* Theme settings content */}
              <div className="space-y-4">
                {/* Theme options would go here */}
              </div>
            </div>            {/* Security Settings */}
            <div 
              onClick={() => setActiveTab('security')}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center mr-4">
                  <Lock className="h-5 w-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Security</h2>
                  <p className="text-sm text-gray-400 mt-1">Manage your security settings</p>
                </div>
              </div>
              {/* Security settings content */}
              <div className="space-y-4">
                {/* Security options would go here */}
              </div>
            </div>            {/* Display Settings */}
            <div 
              onClick={() => setActiveTab('preferences')}
              className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-gray-800/50 transition-colors duration-300 cursor-pointer"
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center mr-4">
                  <Monitor className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-crashbow text-white">Display</h2>
                  <p className="text-sm text-gray-400 mt-1">Adjust your display preferences</p>
                </div>
              </div>
              {/* Display settings content */}
              <div className="space-y-4">
                {/* Display options would go here */}
              </div>
            </div>          </div>

          {/* Content section */}
          <div className="mt-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
