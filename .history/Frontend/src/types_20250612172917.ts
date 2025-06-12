export interface Tournament {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  type: 'artist' | 'producer' | 'aux';
  genre: string | string[];
  language: string;  status: 'Open' | 'In Progress' | 'Completed';
  rules: string[];
  participants?: Participant[];
  organizer: Organizer;
  prizes: Prize[];
}

export interface Participant {
  id: string;
  username: string;
  profilePictureUrl: string;
  rank?: number;
}

export interface Organizer {
  id: string;
  displayName: string;
  avatar: string;
  bio: string;
  socials?: {
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
  };
  website?: string;
  location?: string;
}

export interface Prize {
  position: string;
  amount: number;
  extra?: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: string;
  bio?: string;
  location?: string;
  genre?: string;
  website?: string;
  profilePictureUrl?: string;
  coverImageUrl?: string;
  socials?: {
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
    spotify?: string;
    youtube?: string;
  };
  instagramConnected?: {
    id: string;
    username: string;
    accessToken: string;
    tokenExpires: Date;
    accountType: string;
    mediaCount: number;
    connectedAt: Date;
  };
}