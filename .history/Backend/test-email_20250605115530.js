const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {
    console.log('Testing email configuration...');
    
    const transporter = nodemailer.createTransporter({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });

    // Test connection
    try {
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
    } catch (error) {
        console.error('❌ SMTP connection failed:', error.message);
        return;
    }

    // Send test email
    try {
        const info = await transporter.sendMail({
            from: `"MusikMadness" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'Test Email - MusikMadness Setup',
            html: `
                <h2>🎵 MusikMadness Email Test</h2>
                <p>If you're reading this, your email configuration is working!</p>
                <p><strong>Configuration:</strong></p>
                <ul>
                    <li>Host: ${process.env.EMAIL_HOST}</li>
                    <li>Port: ${process.env.EMAIL_PORT}</li>
                    <li>User: ${process.env.EMAIL_USER}</li>
                </ul>
                <p>Ready to send verification emails! 🚀</p>
            `
        });
        
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ Failed to send test email:', error.message);
    }
}

testEmail();
