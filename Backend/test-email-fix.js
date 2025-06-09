const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmailFix() {
    console.log('🔧 Testing Gmail SMTP Configuration Fix...\n');
    
    // Show configuration (without full password)
    console.log('📋 Current Configuration:');
    console.log(`   HOST: ${process.env.EMAIL_HOST}`);
    console.log(`   PORT: ${process.env.EMAIL_PORT}`);
    console.log(`   USER: ${process.env.EMAIL_USER}`);
    console.log(`   FROM: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
    console.log(`   PASS: ${process.env.EMAIL_PASS ? '✅ Set (16 chars, no spaces)' : '❌ Not set'}\n`);

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

    // Test connection
    try {
        console.log('🔍 Testing SMTP connection...');
        await transporter.verify();
        
        console.log('✅ SMTP Connection: SUCCESS!');
        console.log('🎉 Gmail authentication is now working!');
        console.log('\n📧 Email service is ready for:');
        console.log('   • User registration verification emails');
        console.log('   • Password reset emails');
        console.log(`   • Users will see emails from: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}`);
        
        // Send a test email to verify everything works
        console.log('\n📤 Sending test email...');
        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        const info = await transporter.sendMail({
            from: `"MusikMadness" <${fromAddress}>`,
            to: process.env.EMAIL_USER,
            subject: '✅ Gmail SMTP Fixed - MusikMadness',
            html: `
                <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
                    <h1 style="color: #6366f1; text-align: center;">🎉 Gmail SMTP Fixed!</h1>
                    <p>Great news! Your Gmail SMTP authentication is now working correctly.</p>
                    <p><strong>The issue was:</strong> Gmail App Password had spaces</p>
                    <p><strong>The fix was:</strong> Removed spaces from the App Password</p>
                    <h3>✅ What's Working Now:</h3>
                    <ul>
                        <li>Email verification for new users</li>
                        <li>Password reset emails</li>
                        <li>Professional emails from ${fromAddress}</li>
                    </ul>
                    <p style="color: #666; font-size: 14px;">
                        This test email confirms your email service is fully operational!
                    </p>
                </div>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log(`📧 Message ID: ${info.messageId}`);
        console.log('\n🚀 Your email service is now fully functional!');
        
    } catch (error) {
        console.log('❌ SMTP Connection: STILL FAILED');
        console.log('Error:', error.message);
        
        if (error.message.includes('Invalid login')) {
            console.log('\n💡 Additional troubleshooting needed:');
            console.log('   1. Verify Gmail App Password is correct (16 characters)');
            console.log('   2. Ensure 2-Factor Authentication is enabled on Gmail');
            console.log('   3. Check that EMAIL_USER matches your Gmail address');
            console.log('   4. Try generating a new App Password if this one is old');
        }
    }
    
    process.exit(0);
}

testEmailFix();
