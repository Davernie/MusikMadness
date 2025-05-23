import mongoose, { Document, Schema } from 'mongoose';

export interface IMatchup extends Document {
  tournament: mongoose.Types.ObjectId;
  round: number;
  order: number;
  track1: mongoose.Types.ObjectId;
  track2: mongoose.Types.ObjectId;
  votes: {
    track1: number;
    track2: number;
  };
  winner?: mongoose.Types.ObjectId;
  startDate?: Date;
  endDate?: Date;
  status: 'pending' | 'active' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const MatchupSchema = new Schema<IMatchup>(
  {
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament',
      required: true
    },
    round: {
      type: Number,
      required: true,
      min: 1
    },
    order: {
      type: Number,
      required: true,
      min: 1
    },
    track1: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    track2: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    },
    votes: {
      track1: {
        type: Number,
        default: 0
      },
      track2: {
        type: Number,
        default: 0
      }
    },
    winner: {
      type: Schema.Types.ObjectId,
      ref: 'Track'
    },
    startDate: {
      type: Date
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'completed'],
      default: 'pending'
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IMatchup>('Matchup', MatchupSchema); 