import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  content: string;
  author: mongoose.Types.ObjectId;
  tournament?: mongoose.Types.ObjectId;
  matchup?: mongoose.Types.ObjectId;
  track?: mongoose.Types.ObjectId;
  parent?: mongoose.Types.ObjectId;
  likes: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    content: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 1000
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    tournament: {
      type: Schema.Types.ObjectId,
      ref: 'Tournament'
    },
    matchup: {
      type: Schema.Types.ObjectId,
      ref: 'Matchup'
    },
    track: {
      type: Schema.Types.ObjectId,
      ref: 'Track'
    },
    parent: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// A comment must be associated with at least one of: tournament, matchup, track, or parent comment
CommentSchema.pre('validate', function(next) {
  if (!this.tournament && !this.matchup && !this.track && !this.parent) {
    next(new Error('Comment must be associated with a tournament, matchup, track, or parent comment'));
  } else {
    next();
  }
});

export default mongoose.model<IComment>('Comment', CommentSchema); 