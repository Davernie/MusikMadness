import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/musikmadness';

export const connectDB = async (): Promise<void> => {
  try {
    // OPTIMIZED for MongoDB M2/M5 (Flex Tier) - Up to 200 total connections
    await mongoose.connect(MONGODB_URI, {
      // Connection pool settings - OPTIMIZED for M2/M5 Flex tier
      maxPoolSize: 25, // Increased for Flex tier (200 connections available)
      minPoolSize: 5,  // Maintain baseline connections
      maxIdleTimeMS: 30000, // Increased to 30s for better connection reuse
      
      // Performance settings - OPTIMIZED for M2/M5 dedicated resources
      serverSelectionTimeoutMS: 8000, // Increased for better reliability
      socketTimeoutMS: 45000, // Increased for complex queries
      connectTimeoutMS: 10000, // Balanced timeout for connection establishment
      
      // Performance optimizations for Flex tier
      compressors: 'zstd,zlib,snappy', // Enable compression for better network performance
      readPreference: 'primary', // Read from primary for consistency
      
      // Write concern optimized for Flex tier
      writeConcern: {
        w: 1, // Acknowledge writes to primary only (faster)
        j: true // Enable journaling for data safety (Flex can handle this)
      },
      
      // Additional optimizations for Flex tier
      retryWrites: true, // Retry failed writes
      retryReads: true,  // Retry failed reads
    });
    
    // Set default query timeout - OPTIMIZED for Flex tier
    mongoose.set('maxTimeMS', 25000); // Increased to 25s for complex operations
    
    // Connection monitoring for Flex tier
    mongoose.connection.on('connected', () => {
      console.log('✅ MongoDB connected successfully with M2/M5 Flex Tier optimized settings');
      console.log(`📊 Connection pool: Max=25, Min=5 (optimized for Flex tier)`);
      console.log('🔧 Features: Dedicated resources, 200 connection limit, improved performance');
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected - attempting reconnection...');
    });
    
    console.log('🚀 Connecting to MongoDB with M2/M5 Flex Tier optimizations...');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    console.error('💡 Ensure your MongoDB Atlas M2/M5 cluster is running and accessible');
    process.exit(1);
  }
};