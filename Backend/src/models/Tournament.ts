import mongoose, { Document, Schema } from 'mongoose';

// Define the schema for a single player slot within a matchup
const PlayerInBracketSchema = new Schema({
  participantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  displayName: { type: String, required: true }, // e.g., username, "BYE", "Winner of R1M1"
  score: { type: Number, default: 0 }
}, { _id: false });

// Define the schema for a single matchup in the bracket
const BracketMatchupSchema = new Schema({
  matchupId: { type: String, required: true },       // e.g., "R1M1", "R2M1", unique within the bracket
  roundNumber: { type: Number, required: true },
  player1: { type: PlayerInBracketSchema, required: true },
  player2: { type: PlayerInBracketSchema, required: true },
  winnerParticipantId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  isPlaceholder: { type: Boolean, default: false }, // True if player names are like "Winner of..."
  isBye: { type: Boolean, default: false }          // True if one of the players is a BYE
}, { _id: false });

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
  generatedBracket?: typeof BracketMatchupSchema[];
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
  language: { type: String, default: 'Any Language' },
  generatedBracket: { type: [BracketMatchupSchema], default: undefined }
}, { timestamps: true });

export default mongoose.model<ITournament>('Tournament', TournamentSchema); 