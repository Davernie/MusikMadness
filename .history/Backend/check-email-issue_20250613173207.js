require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User.js').default;

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || process.env.DATABASE_URL);
    console.log('Connected to database');
    
    // Check for the specific user with dots
    const userWithDots = await User.findOne({ email: 'ernesto.ortiz0012@gmail.com' });
    console.log('User with dots:', userWithDots ? { email: userWithDots.email, username: userWithDots.username } : 'Not found');
    
    // Check for the user without dots
    const userWithoutDots = await User.findOne({ email: 'ernestoortiz0012@gmail.com' });
    console.log('User without dots:', userWithoutDots ? { email: userWithoutDots.email, username: userWithoutDots.username } : 'Not found');
    
    // Search for any user with ernesto or ortiz in email
    const similarUsers = await User.find({ email: { $regex: 'ernesto.*ortiz', $options: 'i' } });
    console.log('Similar users:', similarUsers.map(u => ({ email: u.email, username: u.username })));
    
    // Also check for any patterns where dots might be removed
    const usersWithoutDots = await User.find({ email: { $regex: '^[^.]*@gmail\\.com$' } }).limit(5);
    console.log('Sample Gmail users without dots:', usersWithoutDots.map(u => u.email));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

checkUser();
