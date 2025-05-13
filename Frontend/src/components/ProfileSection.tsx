import React from 'react';
import { User, Settings, LogOut } from 'lucide-react';

interface ProfileSectionProps {
  colors: {
    primary: string;
    secondary: string;
  };
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ colors }) => {
  // Mock user data - in a real app this would come from your auth context/state
  const user = {
    name: 'John Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    role: 'Member'
  };

  return (
    <div 
      className="absolute top-4 right-4 z-50 rounded-2xl overflow-hidden backdrop-blur-sm border border-white/10 p-4"
      style={{ 
        background: `linear-gradient(45deg, rgba(${colors.primary}, 0.1), rgba(${colors.secondary}, 0.1))`,
        boxShadow: `0 0 20px rgba(${colors.primary}, 0.2)`
      }}
    >
      <div className="flex items-center gap-3">
        <div className="flex gap-2 mr-4">
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <Settings className="w-4 h-4 text-gray-400" />
          </button>
          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
            <LogOut className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <div className="text-right">
          <h3 className="text-white font-medium">{user.name}</h3>
          <p className="text-sm text-gray-400">{user.role}</p>
        </div>
        <img 
          src={user.avatar} 
          alt={user.name}
          className="w-10 h-10 rounded-full border-2"
          style={{ borderColor: `rgba(${colors.primary}, 0.5)` }}
        />
      </div>
    </div>
  );
};

export default ProfileSection; 