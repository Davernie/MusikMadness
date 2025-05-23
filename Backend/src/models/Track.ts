import mongoose, { Document, Schema } from 'mongoose';

export interface ITrack extends Document {
  title: string;
  artist: string;
  album?: string;
  releaseYear?: number;
  genre?: string[];
  spotifyId?: string;
  youtubeId?: string;
  imageUrl?: string;
  addedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema = new Schema<ITrack>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    artist: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200
    },
    album: {
      type: String,
      trim: true,
      maxlength: 200
    },
    releaseYear: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear()
    },
    genre: [{
      type: String,
      trim: true
    }],
    spotifyId: {
      type: String,
      trim: true
    },
    youtubeId: {
      type: String,
      trim: true
    },
    imageUrl: {
      type: String
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    }
  },
  {
    timestamps: true
  }
);

export default mongoose.model<ITrack>('Track', TrackSchema); 