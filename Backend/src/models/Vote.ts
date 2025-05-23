import mongoose, { Document, Schema } from 'mongoose';

export interface IVote extends Document {
  user: mongoose.Types.ObjectId;
  matchup: mongoose.Types.ObjectId;
  track: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const VoteSchema = new Schema<IVote>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    matchup: {
      type: Schema.Types.ObjectId,
      ref: 'Matchup',
      required: true
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: 'Track',
      required: true
    }
  },
  {
    timestamps: true
  }
);

// Ensure a user can only vote once per matchup
VoteSchema.index({ user: 1, matchup: 1 }, { unique: true });

export default mongoose.model<IVote>('Vote', VoteSchema); 