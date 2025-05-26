import mongoose, { Document, Schema } from 'mongoose';

export interface ITournament extends Document {
  name: string;
  game: string;
  startDate: Date;
  endDate: Date;
  maxPlayers: number;
  description?: string;
  creator: mongoose.Schema.Types.ObjectId; // Assuming you have a User model
  participants: mongoose.Schema.Types.ObjectId[];
  status: 'upcoming' | 'ongoing' | 'completed';
  coverImage?: {
    data: Buffer;
    contentType: string;
  };
  rules?: string[];
  language?: string;
}

const TournamentSchema: Schema = new Schema({
  name: { type: String, required: true },
  game: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  maxPlayers: { type: Number, required: true },
  description: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed'], default: 'upcoming' },
  coverImage: {
    data: Buffer,
    contentType: String
  },
  rules: [{ type: String }],
  language: { type: String, default: 'Any Language' }
}, { timestamps: true });

export default mongoose.model<ITournament>('Tournament', TournamentSchema); 