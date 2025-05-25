export interface Socials {
  soundcloud?: string;
  instagram?: string;
  twitter?: string;
  spotify?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  avatar?: string; // Keeping for backwards compatibility
  coverImageUrl?: string;
  bio?: string;
  location?: string;
  website?: string;
  genre?: string;
  socials?: Socials;
  isCreator?: boolean;
}
