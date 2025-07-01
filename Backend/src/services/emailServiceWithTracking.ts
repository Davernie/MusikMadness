import nodemailer from 'nodemailer';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

interface UsageData {
  daily: Record<string, { smtp: number; api: number }>;
  hourly: Record<string, { smtp: number; api: number }>;
  lastReset: string;
}

// Gmail quotas
const GMAIL_QUOTAS = {
  SMTP_DAILY_LIMIT: 500,
  SMTP_HOURLY_LIMIT: 100,
};

class EmailUsageTracker {
  private logFile: string;
  private usageData: UsageData = {
    daily: {},
    hourly: {},
    lastReset: new Date().toISOString().split('T')[0]
  };

  constructor() {
    this.logFile = path.join(__dirname, '../../email-usage.json');
    this.loadUsageData();
  }

  private loadUsageData() {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        this.usageData = JSON.parse(data);
      } else {
        this.usageData = {
          daily: {},
          hourly: {},
          lastReset: new Date().toISOString().split('T')[0]
        };
      }
    } catch (error) {
      console.error('Error loading email usage data:', error);
      this.usageData = {
        daily: {},
        hourly: {},
        lastReset: new Date().toISOString().split('T')[0]
      };
    }
  }

  private saveUsageData() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.usageData, null, 2));
    } catch (error) {
      console.error('Error saving email usage data:', error);
    }
  }

  private getCurrentKeys() {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${dateKey}-${now.getHours().toString().padStart(2, '0')}`;
    return { dateKey, hourKey };
  }

  private resetIfNewDay() {
    const { dateKey } = this.getCurrentKeys();
    if (this.usageData.lastReset !== dateKey) {
      this.usageData.daily = {};
      this.usageData.lastReset = dateKey;
      console.log(`📧 Reset daily email counters for ${dateKey}`);
    }
  }

  public logEmailSent(type: 'smtp' | 'api' = 'smtp') {
    this.resetIfNewDay();
    const { dateKey, hourKey } = this.getCurrentKeys();
    
    if (!this.usageData.daily[dateKey]) {
      this.usageData.daily[dateKey] = { smtp: 0, api: 0 };
    }
    this.usageData.daily[dateKey][type]++;
    
    if (!this.usageData.hourly[hourKey]) {
      this.usageData.hourly[hourKey] = { smtp: 0, api: 0 };
    }
    this.usageData.hourly[hourKey][type]++;
    
    this.saveUsageData();
  }

  public canSendEmail(type: 'smtp' | 'api' = 'smtp') {
    this.resetIfNewDay();
    const { dateKey, hourKey } = this.getCurrentKeys();
    
    const dailyUsage = this.usageData.daily[dateKey] || { smtp: 0, api: 0 };
    const hourlyUsage = this.usageData.hourly[hourKey] || { smtp: 0, api: 0 };
    
    if (type === 'smtp') {
      const dailyRemaining = GMAIL_QUOTAS.SMTP_DAILY_LIMIT - dailyUsage.smtp;
      const hourlyRemaining = GMAIL_QUOTAS.SMTP_HOURLY_LIMIT - hourlyUsage.smtp;
      
      return {
        canSend: dailyRemaining > 0 && hourlyRemaining > 0,
        dailyRemaining: Math.max(0, dailyRemaining),
        hourlyRemaining: Math.max(0, hourlyRemaining),
        dailyUsed: dailyUsage.smtp,
        hourlyUsed: hourlyUsage.smtp
      };
    }
    
    return { canSend: true, dailyRemaining: 999, hourlyRemaining: 999, dailyUsed: 0, hourlyUsed: 0 };
  }

  public getCurrentUsage() {
    this.resetIfNewDay();
    const { dateKey, hourKey } = this.getCurrentKeys();
    
    const dailyUsage = this.usageData.daily[dateKey] || { smtp: 0, api: 0 };
    const hourlyUsage = this.usageData.hourly[hourKey] || { smtp: 0, api: 0 };
    
    return {
      today: dailyUsage,
      currentHour: hourlyUsage,
      dateKey,
      hourKey
    };
  }
}

class EmailServiceWithTracking {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;
  private tracker: EmailUsageTracker;

  constructor() {
    this.tracker = new EmailUsageTracker();
    this.setupTransporter();
  }

  private setupTransporter() {
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
    };

    this.transporter = nodemailer.createTransport(config);
    this.isConfigured = true;

    this.transporter.verify((error) => {
      if (error) {
        console.log('❌ Email service verification failed:', error.message);
        this.isConfigured = false;
      } else {
        console.log('✅ Email service is ready and verified with usage tracking');
      }
    });
  }

  public generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  public async sendVerificationEmail(email: string, username: string, token: string): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      console.log('📧 Email service not configured, skipping verification email');
      return true;
    }

    // Check if we can send email
    const status = this.tracker.canSendEmail('smtp');
    if (!status.canSend) {
      console.log(`❌ Cannot send email - limits reached. Daily: ${status.dailyUsed}/${GMAIL_QUOTAS.SMTP_DAILY_LIMIT}, Hourly: ${status.hourlyUsed}/${GMAIL_QUOTAS.SMTP_HOURLY_LIMIT}`);
      return false;
    }

    try {
      let frontendUrl: string;
      
      if (process.env.NODE_ENV === 'production') {
        frontendUrl = process.env.FRONTEND_URL || 'https://musikmadness.com';
      } else {
        frontendUrl = 'http://localhost:5173';
      }
      
      const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
      
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
      
      // Log the email after successful send
      this.tracker.logEmailSent('smtp');
      
      const newStatus = this.tracker.canSendEmail('smtp');
      console.log(`✅ Verification email sent to ${email}`);
      console.log(`📊 Email limits - Daily: ${newStatus.dailyUsed}/${GMAIL_QUOTAS.SMTP_DAILY_LIMIT}, Hourly: ${newStatus.hourlyUsed}/${GMAIL_QUOTAS.SMTP_HOURLY_LIMIT}`);
      
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

    // Check if we can send email
    const status = this.tracker.canSendEmail('smtp');
    if (!status.canSend) {
      console.log(`❌ Cannot send email - limits reached. Daily: ${status.dailyUsed}/${GMAIL_QUOTAS.SMTP_DAILY_LIMIT}, Hourly: ${status.hourlyUsed}/${GMAIL_QUOTAS.SMTP_HOURLY_LIMIT}`);
      return false;
    }

    try {
      let frontendUrl: string;
      
      if (process.env.NODE_ENV === 'production') {
        frontendUrl = process.env.FRONTEND_URL || 'https://musikmadness.com';
      } else {
        frontendUrl = 'http://localhost:5173';
      }
      
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
      
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
      
      // Log the email after successful send
      this.tracker.logEmailSent('smtp');
      
      const newStatus = this.tracker.canSendEmail('smtp');
      console.log(`✅ Password reset email sent to ${email}`);
      console.log(`📊 Email limits - Daily: ${newStatus.dailyUsed}/${GMAIL_QUOTAS.SMTP_DAILY_LIMIT}, Hourly: ${newStatus.hourlyUsed}/${GMAIL_QUOTAS.SMTP_HOURLY_LIMIT}`);
      
      return true;
    } catch (error) {
      console.error('❌ Failed to send password reset email:', error);
      return false;
    }
  }

  // Method to get current usage stats
  public getUsageStats() {
    return this.tracker.getCurrentUsage();
  }

  // Method to check if we can send emails
  public canSendEmail() {
    return this.tracker.canSendEmail('smtp');
  }
}

export default new EmailServiceWithTracking(); 