import { EventEmitter } from 'events';

// API Limits Configuration
const API_LIMITS = {
  YOUTUBE: {
    DAILY_QUOTA: 10000,
    LIVE_SEARCH_COST: 100,
    CHANNEL_INFO_COST: 1,
    VIDEO_DETAILS_COST: 1,
    MAX_DAILY_CHECKS: 80, // Safe limit leaving room for other operations
    MIN_CHECK_INTERVAL: 20 * 60 * 1000, // 20 minutes minimum
  },
  TWITCH: {
    RATE_LIMIT_PER_MINUTE: 800,
    RATE_LIMIT_WINDOW: 60 * 1000, // 1 minute
    MIN_CHECK_INTERVAL: 3 * 60 * 1000, // 3 minutes minimum
    SAFE_REQUESTS_PER_MINUTE: 600, // Leave buffer
  },
  KICK: {
    RATE_LIMIT_PER_HOUR: 60,
    RATE_LIMIT_WINDOW: 60 * 60 * 1000, // 1 hour
    MIN_CHECK_INTERVAL: 15 * 60 * 1000, // 15 minutes minimum
    TOKEN_REFRESH_INTERVAL: 23 * 60 * 60 * 1000, // 23 hours (refresh before 24h expiry)
  }
};

// Priority levels for streamers
enum StreamerPriority {
  HIGH = 'high',     // Popular streamers, check frequently
  MEDIUM = 'medium', // Regular streamers
  LOW = 'low'        // Rarely live streamers
}

// Frequency multipliers based on priority
const PRIORITY_MULTIPLIERS = {
  [StreamerPriority.HIGH]: 1,     // Use minimum interval
  [StreamerPriority.MEDIUM]: 2,   // 2x minimum interval
  [StreamerPriority.LOW]: 4       // 4x minimum interval
};

interface ApiUsageStats {
  requests: number;
  windowStart: number;
  lastReset: number;
}

interface StreamerCheckInfo {
  streamerId: string;
  platform: 'youtube' | 'twitch' | 'kick';
  priority: StreamerPriority;
  lastChecked: number;
  nextCheckTime: number;
  checkInterval: number;
  errorCount: number;
  isTemporarilyDisabled: boolean;
}

class ApiLimitsManager extends EventEmitter {
  private youtubeUsage: ApiUsageStats;
  private twitchUsage: ApiUsageStats;
  private kickUsage: ApiUsageStats;
  
  private streamerSchedule: Map<string, StreamerCheckInfo> = new Map();
  private quotaExceeded = {
    youtube: false,
    twitch: false,
    kick: false
  };

  constructor() {
    super();
    
    const now = Date.now();
    this.youtubeUsage = { requests: 0, windowStart: now, lastReset: now };
    this.twitchUsage = { requests: 0, windowStart: now, lastReset: now };
    this.kickUsage = { requests: 0, windowStart: now, lastReset: now };

    // Reset counters periodically
    this.setupResetTimers();
  }

  // Initialize streamer checking schedule
  initializeStreamer(streamerId: string, platform: 'youtube' | 'twitch' | 'kick', priority: StreamerPriority = StreamerPriority.MEDIUM): void {
    const baseInterval = API_LIMITS[platform.toUpperCase() as keyof typeof API_LIMITS].MIN_CHECK_INTERVAL;
    const checkInterval = baseInterval * PRIORITY_MULTIPLIERS[priority];
    
    const checkInfo: StreamerCheckInfo = {
      streamerId,
      platform,
      priority,
      lastChecked: 0,
      nextCheckTime: Date.now() + Math.random() * checkInterval, // Stagger initial checks
      checkInterval,
      errorCount: 0,
      isTemporarilyDisabled: false
    };
    
    this.streamerSchedule.set(streamerId, checkInfo);
    console.log(`📅 Scheduled ${platform} streamer ${streamerId} for ${priority} priority (every ${Math.round(checkInterval / 60000)} minutes)`);
  }

  // Check if we can make an API request for a platform
  canMakeRequest(platform: 'youtube' | 'twitch' | 'kick'): boolean {
    if (this.quotaExceeded[platform]) {
      return false;
    }

    const now = Date.now();
    
    switch (platform) {
      case 'youtube':
        // Check daily quota
        if (this.youtubeUsage.requests >= API_LIMITS.YOUTUBE.MAX_DAILY_CHECKS) {
          this.quotaExceeded.youtube = true;
          this.emit('quotaExceeded', { platform: 'youtube', type: 'daily' });
          return false;
        }
        return true;

      case 'twitch':
        // Check rate limit
        this.resetWindowIfNeeded('twitch', now);
        return this.twitchUsage.requests < API_LIMITS.TWITCH.SAFE_REQUESTS_PER_MINUTE;

      case 'kick':
        // Check rate limit
        this.resetWindowIfNeeded('kick', now);
        return this.kickUsage.requests < API_LIMITS.KICK.RATE_LIMIT_PER_HOUR;

      default:
        return false;
    }
  }

  // Record an API request
  recordRequest(platform: 'youtube' | 'twitch' | 'kick', cost: number = 1): void {
    const usage = this.getUsageStats(platform);
    usage.requests += cost;
    
    console.log(`📊 ${platform.toUpperCase()} API usage: ${usage.requests}/${this.getLimit(platform)}`);
    
    // Warn when approaching limits
    const utilizationPercent = (usage.requests / this.getLimit(platform)) * 100;
    if (utilizationPercent > 80) {
      console.warn(`⚠️ ${platform.toUpperCase()} API usage at ${utilizationPercent.toFixed(1)}%`);
      this.emit('highUsage', { platform, percent: utilizationPercent });
    }
  }

  // Check if a streamer should be checked now
  shouldCheckStreamer(streamerId: string): boolean {
    const checkInfo = this.streamerSchedule.get(streamerId);
    if (!checkInfo) return false;
    
    if (checkInfo.isTemporarilyDisabled) return false;
    
    const now = Date.now();
    return now >= checkInfo.nextCheckTime && this.canMakeRequest(checkInfo.platform);
  }

  // Get streamers that should be checked now
  getStreamersToCheck(): StreamerCheckInfo[] {
    const now = Date.now();
    const streamersToCheck: StreamerCheckInfo[] = [];
    
    for (const [streamerId, checkInfo] of this.streamerSchedule) {
      if (this.shouldCheckStreamer(streamerId)) {
        streamersToCheck.push(checkInfo);
      }
    }
    
    // Sort by priority (high priority first)
    return streamersToCheck.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }

  // Record that a streamer was checked
  recordStreamerCheck(streamerId: string, success: boolean): void {
    const checkInfo = this.streamerSchedule.get(streamerId);
    if (!checkInfo) return;
    
    const now = Date.now();
    checkInfo.lastChecked = now;
    
    if (success) {
      checkInfo.errorCount = 0;
      checkInfo.nextCheckTime = now + checkInfo.checkInterval;
      checkInfo.isTemporarilyDisabled = false;
    } else {
      checkInfo.errorCount++;
      
      // Exponential backoff on errors
      const backoffMultiplier = Math.min(Math.pow(2, checkInfo.errorCount), 8); // Max 8x backoff
      checkInfo.nextCheckTime = now + (checkInfo.checkInterval * backoffMultiplier);
      
      // Temporarily disable if too many errors
      if (checkInfo.errorCount >= 5) {
        checkInfo.isTemporarilyDisabled = true;
        console.warn(`⚠️ Temporarily disabled checking for ${checkInfo.platform} streamer ${streamerId} due to repeated errors`);
        
        // Re-enable after 1 hour
        setTimeout(() => {
          checkInfo.isTemporarilyDisabled = false;
          checkInfo.errorCount = 0;
          console.log(`🔄 Re-enabled checking for ${checkInfo.platform} streamer ${streamerId}`);
        }, 60 * 60 * 1000);
      }
    }
    
    this.recordRequest(checkInfo.platform, checkInfo.platform === 'youtube' ? API_LIMITS.YOUTUBE.LIVE_SEARCH_COST : 1);
  }

  // Get current usage statistics
  getUsageStatistics(): any {
    const now = Date.now();
    
    return {
      youtube: {
        dailyRequests: this.youtubeUsage.requests,
        dailyLimit: API_LIMITS.YOUTUBE.MAX_DAILY_CHECKS,
        quotaExceeded: this.quotaExceeded.youtube,
        utilizationPercent: (this.youtubeUsage.requests / API_LIMITS.YOUTUBE.MAX_DAILY_CHECKS) * 100
      },
      twitch: {
        minuteRequests: this.twitchUsage.requests,
        minuteLimit: API_LIMITS.TWITCH.SAFE_REQUESTS_PER_MINUTE,
        quotaExceeded: this.quotaExceeded.twitch,
        utilizationPercent: (this.twitchUsage.requests / API_LIMITS.TWITCH.SAFE_REQUESTS_PER_MINUTE) * 100
      },
      kick: {
        hourlyRequests: this.kickUsage.requests,
        hourlyLimit: API_LIMITS.KICK.RATE_LIMIT_PER_HOUR,
        quotaExceeded: this.quotaExceeded.kick,
        utilizationPercent: (this.kickUsage.requests / API_LIMITS.KICK.RATE_LIMIT_PER_HOUR) * 100
      },
      totalStreamers: this.streamerSchedule.size,
      activeStreamers: Array.from(this.streamerSchedule.values()).filter(s => !s.isTemporarilyDisabled).length
    };
  }

  private getUsageStats(platform: 'youtube' | 'twitch' | 'kick'): ApiUsageStats {
    switch (platform) {
      case 'youtube': return this.youtubeUsage;
      case 'twitch': return this.twitchUsage;
      case 'kick': return this.kickUsage;
    }
  }

  private getLimit(platform: 'youtube' | 'twitch' | 'kick'): number {
    switch (platform) {
      case 'youtube': return API_LIMITS.YOUTUBE.MAX_DAILY_CHECKS;
      case 'twitch': return API_LIMITS.TWITCH.SAFE_REQUESTS_PER_MINUTE;
      case 'kick': return API_LIMITS.KICK.RATE_LIMIT_PER_HOUR;
    }
  }

  private resetWindowIfNeeded(platform: 'twitch' | 'kick', now: number): void {
    const usage = this.getUsageStats(platform);
    const windowSize = platform === 'twitch' ? API_LIMITS.TWITCH.RATE_LIMIT_WINDOW : API_LIMITS.KICK.RATE_LIMIT_WINDOW;
    
    if (now - usage.windowStart >= windowSize) {
      usage.requests = 0;
      usage.windowStart = now;
    }
  }

  private setupResetTimers(): void {
    // Reset YouTube quota daily at midnight Pacific Time
    const now = new Date();
    const pacificMidnight = new Date(now);
    pacificMidnight.setUTCHours(7, 0, 0, 0); // Pacific Time is UTC-8 (or UTC-7 in summer)
    if (pacificMidnight <= now) {
      pacificMidnight.setUTCDate(pacificMidnight.getUTCDate() + 1);
    }
    
    const msUntilMidnight = pacificMidnight.getTime() - now.getTime();
    setTimeout(() => {
      this.youtubeUsage.requests = 0;
      this.youtubeUsage.lastReset = Date.now();
      this.quotaExceeded.youtube = false;
      console.log('🔄 YouTube API quota reset');
      
      // Set up daily reset
      setInterval(() => {
        this.youtubeUsage.requests = 0;
        this.youtubeUsage.lastReset = Date.now();
        this.quotaExceeded.youtube = false;
        console.log('🔄 YouTube API quota reset');
      }, 24 * 60 * 60 * 1000);
    }, msUntilMidnight);

    // Reset Twitch rate limit every minute
    setInterval(() => {
      this.twitchUsage.requests = 0;
      this.twitchUsage.windowStart = Date.now();
    }, API_LIMITS.TWITCH.RATE_LIMIT_WINDOW);

    // Reset Kick rate limit every hour
    setInterval(() => {
      this.kickUsage.requests = 0;
      this.kickUsage.windowStart = Date.now();
    }, API_LIMITS.KICK.RATE_LIMIT_WINDOW);
  }
}

export default ApiLimitsManager;
export { StreamerPriority };
