const mongoose = require('mongoose');
require('dotenv').config();

// Import the User model
const User = require('../dist/models/User').default;

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkUserEmails = async () => {
  try {
    console.log('🔍 Searching for users with ernesto emails...');
    
    // Search for all users with ernesto in the email
    const users = await User.find({
      email: { $regex: /ernesto.*gmail\.com/i }
    }).select('email username createdAt');
    
    console.log(`📊 Found ${users.length} users:`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: "${user.email}"`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Created: ${user.createdAt}`);
      console.log('   ---');
    });
    
    // Also check for the specific variations
    const specificEmails = [
      'ernesto.ortiz0012@gmail.com',
      'ernestoortiz0012@gmail.com'
    ];
    
    console.log('\n🎯 Checking specific email variations:');
    
    for (const email of specificEmails) {
      const user = await User.findOne({ email: email });
      if (user) {
        console.log(`✅ Found user with email: "${email}"`);
        console.log(`   Username: ${user.username}`);
        console.log(`   Actual stored email: "${user.email}"`);
      } else {
        console.log(`❌ No user found with email: "${email}"`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking user emails:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await checkUserEmails();
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
main();
