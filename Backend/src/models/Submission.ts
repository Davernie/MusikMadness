import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  tournament: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  songTitle: string;
  songFilePath: string; // Deprecated: Keep for backward compatibility
  r2Key?: string; // R2 object key for the song file
  r2Url?: string; // Public URL for the song file in R2
  originalFileName: string;
  mimetype: string;
  description?: string;
  submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songTitle: { type: String, required: true, trim: true },
  songFilePath: { type: String }, // Keep for backward compatibility, no longer required
  r2Key: { type: String }, // R2 object key - optional for backward compatibility
  r2Url: { type: String }, // Public R2 URL - optional for backward compatibility
  originalFileName: { type: String, required: true },
  mimetype: { type: String, required: true },
  description: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index to quickly find a user's submission for a specific tournament
SubmissionSchema.index({ tournament: 1, user: 1 }, { unique: true });

// Index for efficient R2 key lookups
SubmissionSchema.index({ r2Key: 1 });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema); 