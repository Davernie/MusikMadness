export interface ProfileData {
  id: string;
  name: string;
  username: string;
  bio: string;
  avatar: string;
  coverImage: string;
  genres: string[];
  location: string;
  website: string;
  isCreator: boolean;
  socials: {
    [key: string]: string;
  };
  stats?: {
    tournamentsEntered: number;
    tournamentsWon: number;
    tournamentsCreated: number;
    followers: number;
  };
}