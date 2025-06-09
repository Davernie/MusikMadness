require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('🔍 Gmail SMTP Authentication Test\n');

// Check if credentials are set
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('❌ Email credentials not found in .env file');
  process.exit(1);
}

console.log('📧 Email Configuration:');
console.log('User:', process.env.EMAIL_USER);
console.log('Password Length:', process.env.EMAIL_PASS.length);
console.log('Host:', process.env.EMAIL_HOST);
console.log('Port:', process.env.EMAIL_PORT);
console.log('');

// Validate App Password format
const password = process.env.EMAIL_PASS;
if (password.length !== 16) {
  console.log('⚠️  Warning: Gmail App Password should be exactly 16 characters');
  console.log('   Current length:', password.length);
}

if (!/^[a-z]+$/.test(password)) {
  console.log('⚠️  Warning: Gmail App Password should only contain lowercase letters');
}

// Create transporter
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

console.log('🔌 Testing Gmail SMTP connection...');

transporter.verify((error, success) => {
  if (error) {
    console.log('\n❌ Gmail SMTP Connection Failed:');
    console.log('Error:', error.message);
    console.log('Code:', error.code);
    
    if (error.code === 'EAUTH') {
      console.log('\n🛠️  Fix: Generate a new Gmail App Password:');
      console.log('1. Go to: https://myaccount.google.com/apppasswords');
      console.log('2. Create new password for "Mail"');
      console.log('3. Copy the 16-character password (without spaces)');
      console.log('4. Update EMAIL_PASS in your .env file');
      console.log('5. Restart your server');
    }
  } else {
    console.log('\n✅ Gmail SMTP Connection Successful!');
    console.log('Your email service is ready to send emails.');
    
    // Optional: Send test email
    console.log('\n📧 Sending test email...');
    const testEmail = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'MusikMadness - Email Test Successful',
      html: '<h2>✅ Success!</h2><p>Your Gmail SMTP configuration is working correctly.</p>'
    };
    
    transporter.sendMail(testEmail, (error, info) => {
      if (error) {
        console.log('❌ Test email failed:', error.message);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
      }
    });
  }
});

// Keep script running for async operations
setTimeout(() => {
  console.log('\nTest completed.');
  process.exit(0);
}, 5000);
