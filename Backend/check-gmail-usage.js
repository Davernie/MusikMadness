const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Gmail API quotas (as of 2024)
const GMAIL_QUOTAS = {
  // Gmail API quotas
  DAILY_QUOTA: 1000000000, // 1 billion quota units per day
  SEND_EMAIL_COST: 100, // Cost per email sent via API
  DAILY_EMAIL_LIMIT: 500, // Gmail's daily sending limit for regular accounts
  
  // SMTP quotas (what you're currently using)
  SMTP_DAILY_LIMIT: 500, // Gmail SMTP daily limit
  SMTP_HOURLY_LIMIT: 100, // Gmail SMTP hourly limit
};

class GmailUsageTracker {
  constructor() {
    this.logFile = path.join(__dirname, 'email-usage.json');
    this.loadUsageData();
  }

  // Load existing usage data
  loadUsageData() {
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
      console.error('Error loading usage data:', error);
      this.usageData = {
        daily: {},
        hourly: {},
        lastReset: new Date().toISOString().split('T')[0]
      };
    }
  }

  // Save usage data
  saveUsageData() {
    try {
      fs.writeFileSync(this.logFile, JSON.stringify(this.usageData, null, 2));
    } catch (error) {
      console.error('Error saving usage data:', error);
    }
  }

  // Get current date and hour keys
  getCurrentKeys() {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // YYYY-MM-DD
    const hourKey = `${dateKey}-${now.getHours().toString().padStart(2, '0')}`; // YYYY-MM-DD-HH
    return { dateKey, hourKey };
  }

  // Reset daily counters if it's a new day
  resetIfNewDay() {
    const { dateKey } = this.getCurrentKeys();
    if (this.usageData.lastReset !== dateKey) {
      this.usageData.daily = {};
      this.usageData.lastReset = dateKey;
      console.log(`🔄 Reset daily counters for ${dateKey}`);
    }
  }

  // Log an email sent
  logEmailSent(type = 'smtp') {
    this.resetIfNewDay();
    const { dateKey, hourKey } = this.getCurrentKeys();
    
    // Update daily count
    if (!this.usageData.daily[dateKey]) {
      this.usageData.daily[dateKey] = { smtp: 0, api: 0 };
    }
    this.usageData.daily[dateKey][type]++;
    
    // Update hourly count
    if (!this.usageData.hourly[hourKey]) {
      this.usageData.hourly[hourKey] = { smtp: 0, api: 0 };
    }
    this.usageData.hourly[hourKey][type]++;
    
    this.saveUsageData();
  }

  // Get current usage stats
  getCurrentUsage() {
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

  // Check if we can send more emails
  canSendEmail(type = 'smtp') {
    const usage = this.getCurrentUsage();
    
    if (type === 'smtp') {
      const dailyRemaining = GMAIL_QUOTAS.SMTP_DAILY_LIMIT - usage.today.smtp;
      const hourlyRemaining = GMAIL_QUOTAS.SMTP_HOURLY_LIMIT - usage.currentHour.smtp;
      
      return {
        canSend: dailyRemaining > 0 && hourlyRemaining > 0,
        dailyRemaining: Math.max(0, dailyRemaining),
        hourlyRemaining: Math.max(0, hourlyRemaining),
        dailyUsed: usage.today.smtp,
        hourlyUsed: usage.currentHour.smtp
      };
    }
    
    return { canSend: true, dailyRemaining: 999, hourlyRemaining: 999 };
  }

  // Display usage report
  displayUsageReport() {
    const usage = this.getCurrentUsage();
    const smtpStatus = this.canSendEmail('smtp');
    
    console.log('\n📊 GMAIL USAGE REPORT');
    console.log('='.repeat(50));
    console.log(`📅 Date: ${usage.dateKey}`);
    console.log(`🕐 Current Hour: ${usage.hourKey.split('-')[3]}:00`);
    console.log();
    
    // SMTP Usage (what you're currently using)
    console.log('📧 SMTP USAGE (Current Method)');
    console.log('-'.repeat(30));
    console.log(`Daily Used:     ${usage.today.smtp}/${GMAIL_QUOTAS.SMTP_DAILY_LIMIT}`);
    console.log(`Daily Remaining: ${smtpStatus.dailyRemaining}`);
    console.log(`Hourly Used:    ${usage.currentHour.smtp}/${GMAIL_QUOTAS.SMTP_HOURLY_LIMIT}`);
    console.log(`Hourly Remaining: ${smtpStatus.hourlyRemaining}`);
    console.log();
    
    // Status indicators
    const dailyPercentage = (usage.today.smtp / GMAIL_QUOTAS.SMTP_DAILY_LIMIT) * 100;
    const hourlyPercentage = (usage.currentHour.smtp / GMAIL_QUOTAS.SMTP_HOURLY_LIMIT) * 100;
    
    console.log('🚦 STATUS INDICATORS');
    console.log('-'.repeat(20));
    console.log(`Daily Usage:  ${this.getStatusEmoji(dailyPercentage)} ${dailyPercentage.toFixed(1)}%`);
    console.log(`Hourly Usage: ${this.getStatusEmoji(hourlyPercentage)} ${hourlyPercentage.toFixed(1)}%`);
    console.log(`Can Send Now: ${smtpStatus.canSend ? '✅ Yes' : '❌ No'}`);
    console.log();
    
    // Warnings
    if (dailyPercentage > 80) {
      console.log('⚠️  WARNING: Daily limit almost reached!');
    }
    if (hourlyPercentage > 80) {
      console.log('⚠️  WARNING: Hourly limit almost reached!');
    }
    if (!smtpStatus.canSend) {
      console.log('🚫 CRITICAL: Email sending blocked due to limits!');
    }
    
    // Recent usage history
    console.log('\n📈 RECENT DAILY USAGE');
    console.log('-'.repeat(20));
    const recentDays = Object.keys(this.usageData.daily)
      .sort()
      .slice(-7); // Last 7 days
    
    recentDays.forEach(date => {
      const dayUsage = this.usageData.daily[date];
      console.log(`${date}: ${dayUsage.smtp} emails`);
    });
    
    console.log('\n='.repeat(50));
  }

  getStatusEmoji(percentage) {
    if (percentage < 50) return '🟢';
    if (percentage < 80) return '🟡';
    return '🔴';
  }

  // Get Gmail API quota usage (requires OAuth setup)
  async checkGmailAPIQuota() {
    try {
      // This would require OAuth setup for Gmail API
      console.log('\n🔍 GMAIL API QUOTA CHECK');
      console.log('-'.repeat(25));
      console.log('ℹ️  Gmail API quota checking requires OAuth setup.');
      console.log('📝 Current implementation uses SMTP, not Gmail API.');
      console.log('💡 SMTP limits: 500 emails/day, 100 emails/hour');
      console.log();
    } catch (error) {
      console.error('Error checking Gmail API quota:', error);
    }
  }
}

// Enhanced email service wrapper to track usage
class TrackedEmailService {
  constructor() {
    this.tracker = new GmailUsageTracker();
  }

  // Simulate sending an email (for testing)
  async sendEmail(to, subject, content) {
    const status = this.tracker.canSendEmail('smtp');
    
    if (!status.canSend) {
      throw new Error(`Email sending blocked: Daily remaining: ${status.dailyRemaining}, Hourly remaining: ${status.hourlyRemaining}`);
    }
    
    // Log the email (in real implementation, this would be called after successful send)
    this.tracker.logEmailSent('smtp');
    
    console.log(`✅ Email sent to ${to}`);
    console.log(`📊 Remaining today: ${status.dailyRemaining - 1}, this hour: ${status.hourlyRemaining - 1}`);
    
    return true;
  }

  // Get current usage
  getUsage() {
    return this.tracker.getCurrentUsage();
  }

  // Display report
  showReport() {
    this.tracker.displayUsageReport();
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'report';
  
  const tracker = new GmailUsageTracker();
  const emailService = new TrackedEmailService();
  
  switch (command) {
    case 'report':
    case 'status':
      tracker.displayUsageReport();
      await tracker.checkGmailAPIQuota();
      break;
      
    case 'test-send':
      try {
        await emailService.sendEmail('test@example.com', 'Test Subject', 'Test Content');
      } catch (error) {
        console.error('❌ Test send failed:', error.message);
      }
      break;
      
    case 'log-email':
      const type = args[1] || 'smtp';
      tracker.logEmailSent(type);
      console.log(`✅ Logged ${type} email sent`);
      tracker.displayUsageReport();
      break;
      
    case 'reset':
      if (fs.existsSync(tracker.logFile)) {
        fs.unlinkSync(tracker.logFile);
        console.log('🗑️  Usage data reset');
      }
      break;
      
    case 'help':
      console.log('\n📚 GMAIL USAGE TRACKER COMMANDS');
      console.log('='.repeat(35));
      console.log('node check-gmail-usage.js report     - Show usage report');
      console.log('node check-gmail-usage.js test-send  - Test email sending');
      console.log('node check-gmail-usage.js log-email  - Log an email sent');
      console.log('node check-gmail-usage.js reset      - Reset usage data');
      console.log('node check-gmail-usage.js help       - Show this help');
      console.log();
      break;
      
    default:
      console.log('❓ Unknown command. Use "help" for available commands.');
  }
}

// Export for use in other modules
module.exports = {
  GmailUsageTracker,
  TrackedEmailService,
  GMAIL_QUOTAS
};

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
} 