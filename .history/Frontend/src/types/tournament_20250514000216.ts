export interface Tournament {
  id: string;
  title: string;
  description: string;
  type: 'artist' | 'producer' | 'aux';
  coverImage: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  genre: string | string[];
  language: string;
  status: 'Open' | 'In Progress' | 'Completed';
  rules: string[];
  participants: {
    id: string;
    name: string;
    avatar: string;
    songTitle?: string;
    description?: string;
    genre?: string;
    location?: string;
    rank?: number;
  }[];
  organizer: {
    id: string;
    name: string;
    avatar: string;
    bio: string;
  };
  prizes: {
    position: string;
    amount: number;
    extra?: string;
  }[];
}
