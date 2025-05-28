export interface Participant {
  id: string;
  username: string;
  profilePictureUrl?: string;
  songTitle?: string;
  description?: string;
  genre?: string;
  location?: string;
  rank?: number;
}

export interface Tournament {
  id: string;
  title: string;
  description: string;
  type: 'artist' | 'producer' | 'aux';
  coverImage: string;
  coverImageUrl?: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  entryFee: number;
  maxParticipants: number;
  genre: string | string[];
  language: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  rules: string[];
  participants: Participant[];
  creator: {
    _id: string;
    id: string;
    name: string;
    username?: string;
    avatar: string;
    profilePictureUrl?: string;
    bio?: string;
  };
  prizes?: {
    position?: string;
    amount: number;
    extra?: string;
  }[];
  generatedBracket?: FrontendBracketMatchup[];
}

export interface FrontendPlayerInBracket {
  participantId: string | null;
  displayName: string;
  score: number;
}

export interface FrontendBracketMatchup {
  matchupId: string;
  roundNumber: number;
  player1: FrontendPlayerInBracket;
  player2: FrontendPlayerInBracket;
  winnerParticipantId: string | null;
  isPlaceholder: boolean;
  isBye: boolean;
}
