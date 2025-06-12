import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const userModule = await import('../dist/models/User.js');
const User = userModule.default;

await mongoose.connect(process.env.MONGODB_URI);
console.log('Connected to database');

const users = await User.find().limit(10);
console.log('Existing users:');
users.forEach(u => console.log(`- ${u.email} (${u.username})`));

if (users.length === 0) {
  console.log('No users found in database');
}

await mongoose.connection.close();
console.log('Database connection closed');
