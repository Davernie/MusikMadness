import mongoose, { Document, Schema } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  status: 'draft' | 'active' | 'completed';
  rounds: number;
  tracks: mongoose.Types.ObjectId[];
  startDate?: Date;
  endDate?: Date;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TournamentSchema = new Schema<ITournament>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 1000
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed'],
      default: 'draft'
    },
    rounds: {
      type: Number,
      required: true,
      min: 1
    },
    tracks: [{
      type: Schema.Types.ObjectId,
      ref: 'Track'
    }],
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    coverImage: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITournament>('Tournament', TournamentSchema); 