import nodemailer from 'nodemailer';
import crypto from 'crypto';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.setupTransporter();
  }
  private setupTransporter() {
    // Check if email credentials are provided
    const emailHost = process.env.EMAIL_HOST;
    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;

    if (!emailHost || !emailUser || !emailPass) {
      console.log('⚠️  Email service not configured. Email verification will be skipped.');
      return;
    }

    const config: EmailConfig = {
      host: emailHost,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    };this.transporter = nodemailer.createTransport(config);
    this.isConfigured = true;
    
    // Verify connection configuration
    this.transporter.verify((error) => {
      if (error) {
        console.log('❌ Email service verification failed:', error);
        this.isConfigured = false;
      } else {
        console.log('✅ Email service is ready');
      }
    });
  }

  public generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
  public async sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('📧 Email service not configured, skipping verification email');
      return true; // Return true to not block user registration
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
        const mailOptions = {
        from: `"MusikMadness" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Verify Your MusikMadness Account',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #6366f1; text-align: center;">Welcome to MusikMadness! 🎵</h1>
            <p>Hi ${username},</p>
            <p>Thanks for signing up! Please verify your email address to complete your registration.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 12px;">
              If the button doesn't work, copy and paste this link: ${verificationUrl}
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send verification email:', error);
      return false;
    }
  }
  public async sendPasswordResetEmail(email: string, username: string, token: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('📧 Email service not configured, skipping password reset email');
      return false;
    }

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
        const mailOptions = {
        from: `"MusikMadness" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Reset Your MusikMadness Password',
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <h1 style="color: #6366f1; text-align: center;">Password Reset Request 🔐</h1>
            <p>Hi ${username},</p>
            <p>You requested to reset your password. Click the button below to set a new password:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>
            <p style="color: #666; font-size: 12px;">
              If the button doesn't work, copy and paste this link: ${resetUrl}
            </p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Password reset email sent to ${email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }
}

export default new EmailService();
