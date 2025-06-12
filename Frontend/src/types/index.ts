export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  genre?: string;
  website?: string;
  socials?: {
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
  };
}

// Export specific types from their respective files
export * from './profile';
export * from './tournament'; 