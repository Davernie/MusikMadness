export interface CreatorApplicationData {
  displayName: string;
  bio: string;
  experience: string;
  musicGenres: string[];
  musicLinks: {
    soundcloud?: string;
    spotify?: string;
    youtube?: string;
    bandcamp?: string;
    other?: string;
  };
  reasonForApplying: string;
  pastTournaments?: string;
  estimatedTournamentsPerMonth: number;
}

export interface CreatorApplication extends CreatorApplicationData {
  _id: string;
  user: string;
  username: string;
  email: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatorEligibilityResponse {
  canApply: boolean;
  reason?: 'pending_application' | 'approved_pending_activation' | 'recently_rejected';
  message: string;
  submittedAt?: string;
  rejectedAt?: string;
  canReapplyAt?: string;
}

export interface CreatorApplicationStatus {
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewNotes?: string;
}

export interface CreatorApplicationResponse {
  message: string;
  applicationId: string;
  status: string;
} 