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
  language: string;
  status: 'Open' | 'In Progress' | 'Completed';
  rules: string[];
  participants: Participant[];
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
  name: string;
  avatar: string;
  bio: string;
}

export interface Prize {
  position: string;
  amount: number;
  extra?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio?: string;
  location?: string;
  genre?: string;
}