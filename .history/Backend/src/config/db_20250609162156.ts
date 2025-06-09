import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';

export const connectDB = async (): Promise<void> => {
  try {    // OPTIMIZED for MongoDB M0 (Free Tier) - Limited to 100 total connections
    await mongoose.connect(MONGODB_URI, {
      // Connection pool settings - REDUCED for M0 free tier
      maxPoolSize: 5, // Reduced from 10 to stay within M0 limits (100 connections total)
      minPoolSize: 2,  // Reduced from 5 to minimize connection usage
      maxIdleTimeMS: 10000, // Reduced to 10s to free up connections faster
        // Performance settings - OPTIMIZED for M0 free tier
      serverSelectionTimeoutMS: 3000, // Reduced from 5s for faster failure detection
      socketTimeoutMS: 20000, // Reduced from 45s to prevent hanging connections
      connectTimeoutMS: 5000, // Reduced from 10s for faster failure detection
      
      // Performance optimizations
      compressors: 'zstd,zlib,snappy', // Enable compression for better network performance
      readPreference: 'primary', // Read from primary for consistency
      
      // Write concern for performance
      writeConcern: {
        w: 1, // Acknowledge writes to primary only (faster)
        j: false // Don't wait for journal (faster, but less durable)
      }
    });
    
    // Set default query timeout
    mongoose.set('maxTimeMS', 20000);
    
    console.log('MongoDB connected successfully with optimized settings');
    console.log(`Max pool size: ${10} connections`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}; 