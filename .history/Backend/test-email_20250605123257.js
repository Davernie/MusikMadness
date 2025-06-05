const nodemailer = require('nodemailer');
require('dotenv').config();

async function testEmail() {    console.log('Testing email configuration...');
    
    const transporter = nodemailer.createTransport({
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
    }    // Send test email
    try {
        const fromAddress = process.env.EMAIL_FROM || process.env.EMAIL_USER;
        const info = await transporter.sendMail({
            from: `"MusikMadness" <${fromAddress}>`,
            to: process.env.EMAIL_USER, // Send to yourself for testing
            subject: 'Test Email - MusikMadness Setup',
            html: `
                <h2>🎵 MusikMadness Email Test</h2>
                <p>If you're reading this, your email configuration is working!</p>
                <p><strong>Configuration:</strong></p>
                <ul>
                    <li>SMTP Host: ${process.env.EMAIL_HOST}</li>
                    <li>SMTP Port: ${process.env.EMAIL_PORT}</li>
                    <li>SMTP User: ${process.env.EMAIL_USER}</li>
                    <li>From Address: ${fromAddress}</li>
                </ul>
                <p><strong>Email Routing:</strong></p>
                ${process.env.EMAIL_FROM ? 
                    `<p>✅ Using Cloudflare Email Routing<br>
                     📧 Users will see emails from: <strong>${process.env.EMAIL_FROM}</strong><br>
                     🔧 SMTP sending via: <strong>${process.env.EMAIL_USER}</strong></p>` :
                    `<p>📧 Using direct Gmail sending</p>`
                }
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
