const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('🔍 Gmail SMTP Authentication Troubleshooter\n');

// Check environment variables
console.log('📋 Environment Variables Check:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);
console.log('EMAIL_SECURE:', process.env.EMAIL_SECURE);
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('');

// Validate Gmail App Password format
function validateAppPassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is empty or not set' };
  }
  
  // Gmail App Passwords are 16 characters long
  if (password.length !== 16) {
    return { valid: false, message: `Password length is ${password.length}, should be 16 characters` };
  }
  
  // Should only contain lowercase letters
  if (!/^[a-z]+$/.test(password)) {
    return { valid: false, message: 'Password should only contain lowercase letters (a-z)' };
  }
  
  return { valid: true, message: 'Password format looks correct' };
}

// Check password format
const passwordCheck = validateAppPassword(process.env.EMAIL_PASS);
console.log('🔐 Gmail App Password Validation:');
console.log(`Status: ${passwordCheck.valid ? '✅' : '❌'} ${passwordCheck.message}`);
console.log('');

// Create transporter with detailed logging
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true, // Enable debug logging
  logger: true // Enable detailed logging
});

console.log('🔌 Testing Gmail SMTP Connection...\n');

// Test connection
transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Gmail SMTP Connection Failed:');
    console.log('Error Code:', error.code);
    console.log('Error Message:', error.message);
    console.log('');
    
    // Provide specific troubleshooting steps
    console.log('🛠️  Troubleshooting Steps:');
    
    if (error.code === 'EAUTH') {
      console.log('1. ⚠️  Authentication Failed - Check these:');
      console.log('   • Make sure 2-Factor Authentication is ENABLED on your Gmail account');
      console.log('   • Generate a NEW App Password at: https://myaccount.google.com/apppasswords');
      console.log('   • Copy the App Password WITHOUT spaces (should be 16 lowercase letters)');
      console.log('   • Update your .env file with the new password');
      console.log('');
      
      console.log('2. 📧 Gmail Account Requirements:');
      console.log('   • Account must have 2FA enabled');
      console.log('   • "Less secure app access" should be DISABLED (use App Passwords instead)');
      console.log('   • Account should not be suspended or restricted');
      console.log('');
      
      console.log('3. 🔑 How to Generate New App Password:');
      console.log('   • Go to: https://myaccount.google.com/security');
      console.log('   • Click "2-Step Verification"');
      console.log('   • Scroll down to "App passwords"');
      console.log('   • Select "Mail" and generate password');
      console.log('   • Copy the 16-character password (remove spaces!)');
    }
    
    if (error.code === 'ECONNECTION') {
      console.log('1. 🌐 Network Connection Issues:');
      console.log('   • Check your internet connection');
      console.log('   • Verify firewall is not blocking port 587');
      console.log('   • Try using port 465 with secure: true');
    }
    
    console.log('');
    console.log('4. 🔄 After fixing, restart your server and try again');
    
  } else {
    console.log('✅ Gmail SMTP Connection Successful!');
    console.log('Your email service is properly configured and ready to use.');
    console.log('');
    
    // Optional: Send a test email
    console.log('📧 Would you like to send a test email? (Update the script to enable this)');
  }
  
  console.log('\n📊 Connection Details:');
  console.log('Host: smtp.gmail.com');
  console.log('Port: 587');
  console.log('Security: STARTTLS');
  console.log('Authentication: App Password');
});

// Optional test email function (uncomment to use)
/*
function sendTestEmail() {
  const testEmail = {
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_USER, // Send to yourself
    subject: 'MusikMadness Gmail SMTP Test',
    text: 'This is a test email to verify Gmail SMTP configuration is working correctly!',
    html: '<h2>✅ Gmail SMTP Test Successful!</h2><p>Your email service is working correctly.</p>'
  };
  
  transporter.sendMail(testEmail, (error, info) => {
    if (error) {
      console.log('❌ Test email failed:', error);
    } else {
      console.log('✅ Test email sent successfully:', info.messageId);
    }
  });
}
*/
