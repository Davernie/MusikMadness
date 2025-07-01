# Gmail Usage Tracking System

This system tracks your Gmail SMTP usage to help you stay within the 500 emails/day and 100 emails/hour limits.

## 📊 Quick Usage Check

### Windows (Easiest)
```bash
# From project root
check-gmail-usage.bat
```

### Cross-Platform
```bash
# From project root
node Backend/check-gmail-usage.js report
```

## 🛠️ Available Commands

### 1. Check Current Usage (Default)
```bash
node Backend/check-gmail-usage.js report
# or
node Backend/check-gmail-usage.js status
```

**Output includes:**
- Daily emails sent vs 500 limit
- Hourly emails sent vs 100 limit
- Percentage usage with color indicators
- 7-day usage history
- Whether you can send emails now

### 2. Log an Email Manually
```bash
node Backend/check-gmail-usage.js log-email
```
Use this if you sent emails outside the application.

### 3. Test Email Sending
```bash
node Backend/check-gmail-usage.js test-send
```
Simulates sending an email and updates counters.

### 4. Reset Usage Data
```bash
node Backend/check-gmail-usage.js reset
```
Clears all tracking data (use carefully).

### 5. Show Help
```bash
node Backend/check-gmail-usage.js help
```

## 📈 Understanding the Report

### Status Indicators
- 🟢 **Green (0-49%)**: Safe usage level
- 🟡 **Yellow (50-79%)**: Moderate usage, monitor closely
- 🔴 **Red (80-100%)**: High usage, approach limits carefully

### Sample Report
```
📊 GMAIL USAGE REPORT
==================================================
📅 Date: 2025-07-01
🕐 Current Hour: 14:00

📧 SMTP USAGE (Current Method)
------------------------------
Daily Used:     45/500
Daily Remaining: 455
Hourly Used:    3/100
Hourly Remaining: 97

🚦 STATUS INDICATORS
--------------------
Daily Usage:  🟢 9.0%
Hourly Usage: 🟢 3.0%
Can Send Now: ✅ Yes

📈 RECENT DAILY USAGE
--------------------
2025-06-25: 23 emails
2025-06-26: 67 emails
2025-06-27: 12 emails
2025-06-28: 89 emails
2025-06-29: 156 emails
2025-06-30: 34 emails
2025-07-01: 45 emails
```

## 🔧 Integration with Your Application

### Option 1: Use Enhanced Email Service (Recommended)
Replace your current email service import:

```typescript
// OLD
import emailService from '../services/emailService';

// NEW
import emailService from '../services/emailServiceWithTracking';
```

This automatically tracks all emails sent through your application.

### Option 2: Manual Tracking
If you prefer to keep your current email service, manually log emails:

```typescript
import { GmailUsageTracker } from '../check-gmail-usage.js';

const tracker = new GmailUsageTracker();

// After successfully sending an email
tracker.logEmailSent('smtp');

// Check if you can send before attempting
const status = tracker.canSendEmail('smtp');
if (!status.canSend) {
  console.log('Cannot send email - limits reached');
  return false;
}
```

## 📁 Data Storage

Usage data is stored in:
- **Script version**: `Backend/email-usage.json`
- **Service version**: `Backend/src/email-usage.json`

The file contains:
```json
{
  "daily": {
    "2025-07-01": { "smtp": 45, "api": 0 }
  },
  "hourly": {
    "2025-07-01-14": { "smtp": 3, "api": 0 }
  },
  "lastReset": "2025-07-01"
}
```

## ⚠️ Gmail Limits

### SMTP Limits (Current Method)
- **Daily**: 500 emails per day
- **Hourly**: 100 emails per hour
- **Monthly**: ~15,000 emails

### When Limits Are Reached
- **Hourly limit**: Wait until next hour
- **Daily limit**: Wait until next day (resets at midnight PST)
- **Temporary blocks**: Can last 1-24 hours

## 🚨 Warnings and Alerts

The system will warn you when:
- Daily usage > 80% (400+ emails)
- Hourly usage > 80% (80+ emails)
- Limits are reached (blocks sending)

## 📊 Production Monitoring

### Set Up Alerts
Consider setting up monitoring alerts when:
1. Daily usage > 90% (450+ emails)
2. Multiple hours with >80 emails
3. Consistent high usage patterns

### Best Practices
1. **Monitor regularly**: Check usage 2-3 times daily
2. **Batch processing**: Group emails when possible
3. **Alternative services**: Consider SendGrid/Mailgun for high volume
4. **User verification**: Implement email verification to reduce bounces

## 🔄 Automatic Reset

The system automatically:
- Resets daily counters at midnight
- Cleans up old hourly data (keeps 24 hours)
- Maintains 7 days of daily history

## 🆘 Troubleshooting

### "Cannot send email - limits reached"
1. Check current usage: `node Backend/check-gmail-usage.js report`
2. Wait for reset time or use alternative service
3. Verify data accuracy with `reset` command if needed

### Missing usage data
- The system starts tracking from first use
- Historical data before implementation won't be available
- Use `log-email` to manually add missed emails

### Inaccurate counts
- Verify all email sending goes through tracked service
- Check for multiple applications using same Gmail account
- Consider external email clients/apps

## 🔮 Future Enhancements

Potential additions:
- Gmail API integration for real quota checking
- Slack/Discord notifications for high usage
- Web dashboard for usage visualization
- Integration with monitoring services (DataDog, etc.)
- Automatic failover to backup email services

## 📞 Support

If you encounter issues:
1. Check the logs in your application
2. Verify Gmail credentials are working
3. Test with `node Backend/check-gmail-usage.js test-send`
4. Reset data if corrupted: `node Backend/check-gmail-usage.js reset` 