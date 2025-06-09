console.log('Starting Gmail SMTP test...');

try {
  const nodemailer = require('nodemailer');
  require('dotenv').config();
  
  console.log('Environment variables loaded:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
  console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
  
  const transporter = nodemailer.createTransporter({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  
  console.log('Testing connection...');
  
  transporter.verify((error, success) => {
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('Error code:', error.code);
    } else {
      console.log('✅ Connection successful!');
    }
  });
  
} catch (error) {
  console.log('Script error:', error.message);
}
