import mongoose, { Document, Schema } from 'mongoose';

export interface ISubmission extends Document {
  tournament: mongoose.Schema.Types.ObjectId;
  user: mongoose.Schema.Types.ObjectId;
  songTitle: string;
  songFilePath: string; // Relative path to the stored song file
  originalFileName: string;
  mimetype: string;
  description?: string;
  submittedAt: Date;
}

const SubmissionSchema: Schema = new Schema({
  tournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  songTitle: { type: String, required: true, trim: true },
  songFilePath: { type: String, required: true },
  originalFileName: { type: String, required: true },
  mimetype: { type: String, required: true },
  description: { type: String, trim: true },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index to quickly find a user's submission for a specific tournament
SubmissionSchema.index({ tournament: 1, user: 1 }, { unique: true });

export default mongoose.model<ISubmission>('Submission', SubmissionSchema); 