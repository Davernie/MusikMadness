const nodemailer = require('nodemailer');
require('dotenv').config();

async function quickTest() {
    console.log('🧪 Quick Email Configuration Test\n');
    
    try {
        // Show configuration (without password)
        console.log('📋 Current Configuration:');
        console.log(`   HOST: ${process.env.EMAIL_HOST}`);
        console.log(`   PORT: ${process.env.EMAIL_PORT}`);
        console.log(`   USER: ${process.env.EMAIL_USER}`);
        console.log(`   FROM: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
        console.log(`   PASS: ${process.env.EMAIL_PASS ? '✅ Set (16 chars)' : '❌ Not set'}\n`);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('❌ Missing email credentials in .env file');
            return;
        }

        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: parseInt(process.env.EMAIL_PORT || '587'),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // Test connection only
        console.log('🔍 Testing SMTP connection...');
        await transporter.verify();
        
        console.log('✅ SMTP Connection: SUCCESS');
        console.log('🎉 Your email configuration is working!');
        console.log('\n📧 Ready to send:');
        console.log('   • Email verification emails');
        console.log('   • Password reset emails');
        console.log(`   • Users will see emails from: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
        
    } catch (error) {
        console.log('❌ SMTP Connection: FAILED');
        console.log('Error:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Troubleshooting:');
            console.log('   1. Check your Gmail App Password (16 characters with spaces)');
            console.log('   2. Ensure 2-Factor Authentication is enabled');
            console.log('   3. Make sure EMAIL_USER is your Gmail address');
        }
    }
    
    process.exit(0);
}

quickTest();
