import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';

export const connectDB = async (): Promise<void> => {
  try {
    // Optimized connection settings for better performance
    await mongoose.connect(MONGODB_URI, {
      // Connection pool settings
      maxPoolSize: 10, // Maximum number of connections in the pool
      minPoolSize: 5,  // Minimum number of connections in the pool
      maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
      
      // Performance settings
      serverSelectionTimeoutMS: 5000, // How long to wait for server selection
      socketTimeoutMS: 45000, // How long a socket stays open
      connectTimeoutMS: 10000, // How long to wait for initial connection
      
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