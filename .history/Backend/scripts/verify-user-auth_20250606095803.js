const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const uri = process.env.MONGODB_URI || 'mongodb+srv://EOrtiz:IAyZU0gl4e6d99Xw@musikmadness.08btomx.mongodb.net/?retryWrites=true&w=majority&appName=MusikMadness';
const dbName = process.env.DB_NAME || 'test';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

const verifyUserAuth = async () => {
  const client = new MongoClient(uri);
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    console.log('✅ Connected to MongoDB');
    
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    
    // Check if our hardcoded user exists
    const creatorId = new ObjectId('6841818a6a43d9d7302da134');
    const creator = await usersCollection.findOne({ _id: creatorId });
    
    if (!creator) {
      console.error('❌ Creator account not found!');
      return;
    }
    
    console.log('✅ Creator account found:');
    console.log('  - ID:', creator._id.toString());
    console.log('  - Username:', creator.username);
    console.log('  - Email:', creator.email);
    console.log('  - Email Verified:', creator.isEmailVerified);
    console.log('  - Account Locked:', creator.isLocked || false);
    
    // Generate a token for this user
    const token = jwt.sign(
      { userId: creator._id.toString() },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    console.log('\n🔑 Generated JWT Token:');
    console.log(token);
    
    // Verify the token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('\n✅ Token verification successful:');
      console.log('  - User ID:', decoded.userId);
    } catch (error) {
      console.error('❌ Token verification failed:', error.message);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
};

verifyUserAuth();
