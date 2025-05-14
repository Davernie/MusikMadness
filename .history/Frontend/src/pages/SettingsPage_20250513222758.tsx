import React, { useState } from 'react';
import { Bell, Lock, User, Palette, Volume2, Globe, Moon, Sun, Settings, ShieldCheck, CreditCard, HelpCircle, KeyRound } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

interface SettingsTab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const SettingsPage: React.FC = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [language, setLanguage] = useState('en');
  const [volume, setVolume] = useState(80);
  
  const tabs: SettingsTab[] = [
    { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'preferences', label: 'Preferences', icon: <Settings className="w-5 h-5" /> },
    { id: 'security', label: 'Security', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
    { id: 'audio', label: 'Audio Settings', icon: <Volume2 className="w-5 h-5" /> },
    { id: 'language', label: 'Language', icon: <Globe className="w-5 h-5" /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette className="w-5 h-5" /> }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-blue-500 to-pink-500 bg-clip-text text-transparent">
          Settings
        </h1>

        {/* Profile Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/5">
          <div className="flex items-center mb-4">
            <User className="w-6 h-6 mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold">Profile Settings</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Display Name</label>
              <input
                type="text"
                className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your display name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300">Bio</label>
              <textarea
                className="mt-1 block w-full bg-gray-700/50 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Tell us about yourself"
              />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/5">
          <div className="flex items-center mb-4">
            <Bell className="w-6 h-6 mr-2 text-pink-400" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Email Notifications</span>
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
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Push Notifications</span>
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

        {/* Appearance Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/5">
          <div className="flex items-center mb-4">
            <Palette className="w-6 h-6 mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold">Appearance</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">Theme</span>
              <button
                onClick={toggleTheme}
                className="bg-gray-700/50 hover:bg-gray-600/50 rounded-md px-4 py-2 flex items-center space-x-2 transition-colors"
              >
                {isDarkMode ? (
                  <>
                    <Moon className="w-4 h-4" />
                    <span>Dark</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Light</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Audio Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/5">
          <div className="flex items-center mb-4">
            <Volume2 className="w-6 h-6 mr-2 text-pink-400" />
            <h2 className="text-xl font-semibold">Audio</h2>
          </div>
          <div className="space-y-4">
            <div>
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

        {/* Language Section */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-6 mb-6 border border-white/5">
          <div className="flex items-center mb-4">
            <Globe className="w-6 h-6 mr-2 text-blue-400" />
            <h2 className="text-xl font-semibold">Language</h2>
          </div>
          <div className="space-y-4">
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

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-gradient-to-r from-blue-500/80 to-pink-500/80 hover:from-blue-500 hover:to-pink-500 px-6 py-2 rounded-md font-medium transition-all duration-300">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
