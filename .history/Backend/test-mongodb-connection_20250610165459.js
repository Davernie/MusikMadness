const mongoose = require('mongoose');
require('dotenv').config();

console.log('Starting MongoDB connection test...');
console.log('Environment variables loaded');

const testConnection = async () => {
  try {
    console.log('About to connect to MongoDB...');
    
    const mongoURI = process.env.MONGODB_URI;
    console.log('MongoDB URI exists:', mongoURI ? 'Yes' : 'No');
    console.log('MongoDB URI (sanitized):', mongoURI ? mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@') : 'Not found');
    
    if (!mongoURI) {
      console.log('No MONGODB_URI found in environment variables.');
      console.log('Trying default connection...');
      await mongoose.connect('mongodb://localhost:27017/musikmadness');
    } else {
      await mongoose.connect(mongoURI);
    }
    
    console.log('✅ MongoDB connected successfully!');
    
    // Test basic operations
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check tournaments specifically
    const tournamentsCollection = db.collection('tournaments');
    const count = await tournamentsCollection.countDocuments();
    console.log(`Found ${count} tournaments in database`);
    
    if (count > 0) {
      const sample = await tournamentsCollection.findOne({});
      console.log('Sample tournament status:', sample?.status);
    }
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Full error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
    process.exit(0);
  }
};

testConnection();
