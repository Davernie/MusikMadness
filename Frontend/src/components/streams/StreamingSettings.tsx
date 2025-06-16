import React, { useState, useEffect } from 'react';
import { Radio, Settings, Save, Loader, Eye, EyeOff } from 'lucide-react';
import streamingService from '../../services/streamingService';
import { StreamerUser, UpdateStreamingSettingsData } from '../../types/streams';

interface StreamingSettingsProps {
  user?: StreamerUser;
  onUpdate?: (updatedUser: StreamerUser) => void;
}

const StreamingSettings: React.FC<StreamingSettingsProps> = ({ user, onUpdate }) => {
  const [isStreamer, setIsStreamer] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [streamTitle, setStreamTitle] = useState('');
  const [streamDescription, setStreamDescription] = useState('');
  const [preferredPlatform, setPreferredPlatform] = useState<'twitch' | 'youtube' | 'kick'>('youtube');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [streamingSchedule, setStreamingSchedule] = useState('');
  const [streamCategories, setStreamCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [viewerCount, setViewerCount] = useState(0);
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [liveLoading, setLiveLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Initialize form with user data
  useEffect(() => {
    if (user?.streaming) {
      const streaming = user.streaming;
      setIsStreamer(streaming.isStreamer);
      setIsLive(streaming.isLive);
      setStreamTitle(streaming.streamTitle || '');
      setStreamDescription(streaming.streamDescription || '');
      setPreferredPlatform(streaming.preferredPlatform);
      setThumbnailUrl(streaming.thumbnailUrl || '');
      setStreamingSchedule(streaming.streamingSchedule || '');
      setStreamCategories(streaming.streamCategories || []);
      setViewerCount(streaming.viewerCount || 0);
    }
  }, [user]);

  // Show message temporarily
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Save streaming settings
  const handleSaveSettings = async () => {
    try {
      setSaveLoading(true);
      
      const data: UpdateStreamingSettingsData = {
        isStreamer,
        streamTitle,
        streamDescription,
        preferredPlatform,
        thumbnailUrl,
        streamingSchedule,
        streamCategories
      };

      const result = await streamingService.updateStreamingSettings(data);
      showMessage('success', result.message);
      
      if (onUpdate) {
        onUpdate(result.user);
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to save settings');
    } finally {
      setSaveLoading(false);
    }
  };

  // Toggle live status
  const handleToggleLive = async () => {
    try {
      setLiveLoading(true);
      
      const result = await streamingService.updateLiveStatus({
        isLive: !isLive,
        streamTitle: streamTitle || undefined,
        viewerCount: isLive ? 0 : viewerCount
      });

      setIsLive(!isLive);
      showMessage('success', result.message);
      
      if (onUpdate && user) {
        const updatedUser = { ...user };
        if (updatedUser.streaming) {
          updatedUser.streaming.isLive = !isLive;
          if (!isLive) {
            updatedUser.streaming.streamStartedAt = result.streamStartedAt;
          } else {
            updatedUser.streaming.lastStreamedAt = result.lastStreamedAt;
          }
        }
        onUpdate(updatedUser);
      }
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to update live status');
    } finally {
      setLiveLoading(false);
    }
  };

  // Add category
  const handleAddCategory = () => {
    if (newCategory.trim() && !streamCategories.includes(newCategory.trim())) {
      setStreamCategories([...streamCategories, newCategory.trim()]);
      setNewCategory('');
    }
  };

  // Remove category
  const handleRemoveCategory = (category: string) => {
    setStreamCategories(streamCategories.filter(c => c !== category));
  };

  const platformColors = {
    twitch: 'from-purple-500 to-purple-600',
    youtube: 'from-red-500 to-red-600',
    kick: 'from-green-500 to-green-600'
  };

  return (
    <div className="bg-black/40 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/5 p-6">
      <div className="flex items-center mb-6">
        <Settings className="w-6 h-6 text-purple-400 mr-3" />
        <h2 className="text-xl font-bold text-white">Streaming Settings</h2>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`mb-4 p-3 rounded-lg ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/20 text-green-400'
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {message.text}
        </div>
      )}

      {/* Streamer Toggle */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isStreamer}
            onChange={(e) => setIsStreamer(e.target.checked)}
            className="sr-only peer"
          />
          <div className="relative w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
          <span className="ml-3 text-white font-medium">Enable Streamer Mode</span>
        </label>
        <p className="text-gray-400 text-sm mt-1">
          Enabling this will make you visible on the Live Streams page
        </p>
      </div>

      {isStreamer && (
        <div className="space-y-6">
          {/* Live Status Toggle */}
          <div className="bg-black/20 rounded-lg p-4 border border-white/5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${isLive ? 'bg-red-500 animate-pulse' : 'bg-gray-500'}`}></div>
                <span className="text-white font-medium">
                  {isLive ? 'Currently Live' : 'Offline'}
                </span>
              </div>
              <button
                onClick={handleToggleLive}
                disabled={liveLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                  isLive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                } disabled:opacity-50`}
              >
                {liveLoading ? (
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                ) : isLive ? (
                  <EyeOff className="w-4 h-4 mr-2" />
                ) : (
                  <Eye className="w-4 h-4 mr-2" />
                )}
                {isLive ? 'Go Offline' : 'Go Live'}
              </button>
            </div>
            
            {isLive && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Current Viewer Count
                </label>
                <input
                  type="number"
                  min="0"
                  value={viewerCount}
                  onChange={(e) => setViewerCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                  placeholder="0"
                />
              </div>
            )}
          </div>

          {/* Platform Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Preferred Platform
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['twitch', 'youtube', 'kick'] as const).map((platform) => (
                <button
                  key={platform}
                  onClick={() => setPreferredPlatform(platform)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    preferredPlatform === platform
                      ? `bg-gradient-to-r ${platformColors[platform]} border-white/20`
                      : 'bg-black/20 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="text-white font-medium capitalize">{platform}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Stream Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stream Title
            </label>
            <input
              type="text"
              value={streamTitle}
              onChange={(e) => setStreamTitle(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="What are you streaming today?"
              maxLength={200}
            />
          </div>

          {/* Stream Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Stream Description
            </label>
            <textarea
              value={streamDescription}
              onChange={(e) => setStreamDescription(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Tell viewers what your stream is about..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Thumbnail URL (optional)
            </label>
            <input
              type="url"
              value={thumbnailUrl}
              onChange={(e) => setThumbnailUrl(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="https://example.com/thumbnail.jpg"
            />
          </div>

          {/* Streaming Schedule */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Streaming Schedule
            </label>
            <input
              type="text"
              value={streamingSchedule}
              onChange={(e) => setStreamingSchedule(e.target.value)}
              className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
              placeholder="e.g., Mon-Fri 8PM EST, Weekends 2PM EST"
              maxLength={300}
            />
          </div>

          {/* Stream Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stream Categories
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {streamCategories.map((category) => (
                <span
                  key={category}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm flex items-center"
                >
                  {category}
                  <button
                    onClick={() => handleRemoveCategory(category)}
                    className="ml-2 text-purple-300 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white focus:outline-none focus:border-purple-500"
                placeholder="Add a category (e.g., Hip-Hop, Electronic, etc.)"
              />
              <button
                onClick={handleAddCategory}
                className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleSaveSettings}
              disabled={saveLoading}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium rounded-lg transition-all flex items-center justify-center disabled:opacity-50"
            >
              {saveLoading ? (
                <Loader className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Save className="w-5 h-5 mr-2" />
              )}
              Save Streaming Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingSettings; 