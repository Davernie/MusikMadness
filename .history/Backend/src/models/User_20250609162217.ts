import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  profilePicture?: {
    data: Buffer;
    contentType: string;
  };
  coverImage?: {
    data: Buffer;
    contentType: string;
  };
  bio?: string;
  location?: string;
  website?: string;
  genres?: string[];  socials?: {
    soundcloud?: string;
    instagram?: string;
    twitter?: string;
    spotify?: string;
  };
  stats?: {
    tournamentsEntered?: number;
    tournamentsWon?: number;
    tournamentsCreated?: number;
    followers?: number;
  };
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<this>;
  resetLoginAttempts(): Promise<this>;
  isLocked: boolean;
  
  // Virtual properties added by controller
  profilePictureUrl?: string;
  coverImageUrl?: string;
  isCreator: boolean;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
}

const UserSchema = new Schema<IUser>(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30
    },    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 8 // Increased minimum password length
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    emailVerificationToken: {
      type: String
    },
    emailVerificationExpires: {
      type: Date
    },
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    loginAttempts: {
      type: Number,
      default: 0
    },
    lockUntil: {
      type: Date
    },
    profilePicture: {
      data: Buffer,
      contentType: String
    },
    coverImage: {
      data: Buffer,
      contentType: String
    },
    bio: {
      type: String,
      maxlength: 500,
      default: ''
    },
    location: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    genres: {
      type: [String],
      default: []
    },    socials: {
      soundcloud: {
        type: String,
        default: ''
      },
      instagram: {
        type: String,
        default: ''
      },
      twitter: {
        type: String,
        default: ''
      },
      spotify: {
        type: String,
        default: ''
      }
    },
    stats: {
      tournamentsEntered: {
        type: Number,
        default: 0
      },
      tournamentsWon: {
        type: Number,
        default: 0
      },
      tournamentsCreated: {
        type: Number,
        default: 0
      },
      followers: {
        type: Number,
        default: 0
      }
    },
    isCreator: {
      type: Boolean,
      default: false
    },
    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  },
  {
    timestamps: true
  }
);

// CRITICAL PERFORMANCE INDEXES
// Index for username lookups (login, profiles)  
UserSchema.index({ username: 1 });

// Index for email lookups (login, registration)
UserSchema.index({ email: 1 });

// Index for case-insensitive username searches
UserSchema.index({ username: 'text' });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
    try {
    // OPTIMIZED: Reduced from 12 to 10 for better performance under M0 free tier load
    // Security: Still very secure (1024 rounds), Performance: ~40% faster
    const salt = await bcrypt.genSalt(10); // Reduced from 12 to 10 for M0 optimization
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Virtual property to check if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Instance methods for handling login attempts
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil.getTime() < Date.now()) {
    return this.updateOne({
      $set: {
        loginAttempts: 1
      },
      $unset: {
        lockUntil: 1
      }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // If we have reached max attempts and haven't locked the account, lock it
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 }; // Lock for 15 minutes
  }
  
  return this.updateOne(updates);
};

UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      loginAttempts: 1,
      lockUntil: 1
    }
  });
};

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 