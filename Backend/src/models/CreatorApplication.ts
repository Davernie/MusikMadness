import mongoose, { Document, Schema } from 'mongoose';

export interface ICreatorApplication extends Document {
  user: mongoose.Types.ObjectId;
  username: string; // Denormalized for easier admin viewing
  email: string; // Denormalized for easier admin viewing
  
  // Application fields
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
  
  // Application status
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
}

const CreatorApplicationSchema = new Schema<ICreatorApplication>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true // One application per user
    },
    username: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    displayName: {
      type: String,
      required: true,
      maxlength: 50
    },
    bio: {
      type: String,
      required: true,
      maxlength: 1000
    },
    experience: {
      type: String,
      required: true,
      maxlength: 1000
    },
    musicGenres: {
      type: [String],
      required: true,
      validate: {
        validator: function(v: string[]) {
          return v.length > 0 && v.length <= 10;
        },
        message: 'Please select 1-10 music genres'
      }
    },
    musicLinks: {
      soundcloud: { type: String, default: '' },
      spotify: { type: String, default: '' },
      youtube: { type: String, default: '' },
      bandcamp: { type: String, default: '' },
      other: { type: String, default: '' }
    },
    reasonForApplying: {
      type: String,
      required: true,
      maxlength: 1000
    },
    pastTournaments: {
      type: String,
      maxlength: 500,
      default: ''
    },
    estimatedTournamentsPerMonth: {
      type: Number,
      required: true,
      min: 1,
      max: 20
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    reviewNotes: {
      type: String,
      maxlength: 500
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Indexes for efficient querying
CreatorApplicationSchema.index({ user: 1 });
CreatorApplicationSchema.index({ status: 1 });
CreatorApplicationSchema.index({ createdAt: -1 });

const CreatorApplication = mongoose.model<ICreatorApplication>('CreatorApplication', CreatorApplicationSchema);

export default CreatorApplication; 