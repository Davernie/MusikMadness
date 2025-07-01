import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Gmail quotas
const GMAIL_QUOTAS = {
  SMTP_DAILY_LIMIT: 500,
  SMTP_HOURLY_LIMIT: 100,
};

interface UsageData {
  daily: Record<string, { smtp: number; api: number }>;
  hourly: Record<string, { smtp: number; api: number }>;
  lastReset: string;
}

class EmailUsageAPI {
  private logFile: string;

  constructor() {
    this.logFile = path.join(__dirname, '../../email-usage.json');
  }

  private loadUsageData(): UsageData {
    try {
      if (fs.existsSync(this.logFile)) {
        const data = fs.readFileSync(this.logFile, 'utf8');
        return JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading email usage data:', error);
    }
    
    return {
      daily: {},
      hourly: {},
      lastReset: new Date().toISOString().split('T')[0]
    };
  }

  private getCurrentKeys() {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0];
    const hourKey = `${dateKey}-${now.getHours().toString().padStart(2, '0')}`;
    return { dateKey, hourKey };
  }

  public getCurrentUsage() {
    const usageData = this.loadUsageData();
    const { dateKey, hourKey } = this.getCurrentKeys();
    
    const dailyUsage = usageData.daily[dateKey] || { smtp: 0, api: 0 };
    const hourlyUsage = usageData.hourly[hourKey] || { smtp: 0, api: 0 };
    
    const dailyRemaining = GMAIL_QUOTAS.SMTP_DAILY_LIMIT - dailyUsage.smtp;
    const hourlyRemaining = GMAIL_QUOTAS.SMTP_HOURLY_LIMIT - hourlyUsage.smtp;
    
    const dailyPercentage = (dailyUsage.smtp / GMAIL_QUOTAS.SMTP_DAILY_LIMIT) * 100;
    const hourlyPercentage = (hourlyUsage.smtp / GMAIL_QUOTAS.SMTP_HOURLY_LIMIT) * 100;
    
    return {
      date: dateKey,
      hour: hourKey.split('-')[3],
      daily: {
        used: dailyUsage.smtp,
        limit: GMAIL_QUOTAS.SMTP_DAILY_LIMIT,
        remaining: Math.max(0, dailyRemaining),
        percentage: dailyPercentage
      },
      hourly: {
        used: hourlyUsage.smtp,
        limit: GMAIL_QUOTAS.SMTP_HOURLY_LIMIT,
        remaining: Math.max(0, hourlyRemaining),
        percentage: hourlyPercentage
      },
      canSend: dailyRemaining > 0 && hourlyRemaining > 0,
      status: this.getStatus(dailyPercentage, hourlyPercentage),
      recentDays: this.getRecentDays(usageData)
    };
  }

  private getStatus(dailyPercentage: number, hourlyPercentage: number) {
    const maxPercentage = Math.max(dailyPercentage, hourlyPercentage);
    
    if (maxPercentage < 50) return { level: 'safe', color: 'green', emoji: '🟢' };
    if (maxPercentage < 80) return { level: 'moderate', color: 'yellow', emoji: '🟡' };
    return { level: 'high', color: 'red', emoji: '🔴' };
  }

  private getRecentDays(usageData: UsageData) {
    return Object.keys(usageData.daily)
      .sort()
      .slice(-7)
      .map(date => ({
        date,
        emails: usageData.daily[date].smtp
      }));
  }
}

const emailUsageAPI = new EmailUsageAPI();

// GET /api/email-usage - Get current email usage stats
router.get('/', (req, res) => {
  try {
    const usage = emailUsageAPI.getCurrentUsage();
    res.json({
      success: true,
      data: usage
    });
  } catch (error) {
    console.error('Error getting email usage:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get email usage stats'
    });
  }
});

// GET /api/email-usage/summary - Get simplified usage summary
router.get('/summary', (req, res) => {
  try {
    const usage = emailUsageAPI.getCurrentUsage();
    res.json({
      success: true,
      data: {
        canSend: usage.canSend,
        dailyUsed: usage.daily.used,
        dailyLimit: usage.daily.limit,
        dailyRemaining: usage.daily.remaining,
        hourlyUsed: usage.hourly.used,
        hourlyLimit: usage.hourly.limit,
        hourlyRemaining: usage.hourly.remaining,
        status: usage.status.level
      }
    });
  } catch (error) {
    console.error('Error getting email usage summary:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get email usage summary'
    });
  }
});

export default router; 