/**
 * SoundCloud Rate Limit Utilities
 * Handles the 15,000 plays/24h limit for SoundCloud API
 */

interface RateLimitInfo {
  playsRemaining: number;
  resetTime: Date | null;
  isLimitReached: boolean;
}

class SoundCloudRateLimitManager {
  private static instance: SoundCloudRateLimitManager;
  private playsRemaining: number = 15000; // Default assumption
  private resetTime: Date | null = null;
  private isLimitReached: boolean = false;

  static getInstance(): SoundCloudRateLimitManager {
    if (!SoundCloudRateLimitManager.instance) {
      SoundCloudRateLimitManager.instance = new SoundCloudRateLimitManager();
    }
    return SoundCloudRateLimitManager.instance;
  }

  /**
   * Update rate limit info from SoundCloud API response headers
   */
  updateFromApiResponse(error: any): void {
    if (error?.response?.status === 429) {
      const errorData = error.response.data;
      
      if (errorData?.errors?.[0]?.meta?.rate_limit?.group === 'plays') {
        this.isLimitReached = true;
        this.playsRemaining = errorData.errors[0].meta.remaining_requests || 0;
        
        // Parse reset time
        const resetTimeStr = errorData.errors[0].meta.reset_time;
        if (resetTimeStr) {
          this.resetTime = new Date(resetTimeStr);
        }
        
        console.warn('🚨 SoundCloud play rate limit reached:', {
          playsRemaining: this.playsRemaining,
          resetTime: this.resetTime
        });
      }
    }
  }

  /**
   * Check if we're currently rate limited
   */
  isCurrentlyLimited(): boolean {
    // If we have a reset time and it's passed, reset the limit
    if (this.resetTime && new Date() > this.resetTime) {
      this.resetLimit();
      return false;
    }
    
    return this.isLimitReached;
  }

  /**
   * Get current rate limit status
   */
  getStatus(): RateLimitInfo {
    return {
      playsRemaining: this.playsRemaining,
      resetTime: this.resetTime,
      isLimitReached: this.isCurrentlyLimited()
    };
  }

  /**
   * Reset the rate limit (called when time window expires)
   */
  private resetLimit(): void {
    this.isLimitReached = false;
    this.playsRemaining = 15000;
    this.resetTime = null;
    console.log('✅ SoundCloud rate limit reset');
  }

  /**
   * Decrement play count (for tracking usage)
   */
  decrementPlays(): void {
    if (this.playsRemaining > 0) {
      this.playsRemaining--;
    }
  }
}

/**
 * Handle SoundCloud rate limit errors gracefully
 */
export const handleSoundCloudRateLimit = (error: any): {
  isRateLimited: boolean;
  message: string;
  resetTime?: Date;
} => {
  const rateLimitManager = SoundCloudRateLimitManager.getInstance();
  
  if (error?.response?.status === 429) {
    rateLimitManager.updateFromApiResponse(error);
    const status = rateLimitManager.getStatus();
    
    return {
      isRateLimited: true,
      message: `SoundCloud play limit reached. Try again ${
        status.resetTime ? `after ${status.resetTime.toLocaleString()}` : 'later'
      }`,
      resetTime: status.resetTime || undefined
    };
  }
  
  return {
    isRateLimited: false,
    message: 'Unknown SoundCloud error'
  };
};

/**
 * Check if SoundCloud is currently rate limited
 */
export const isSoundCloudRateLimited = (): boolean => {
  const rateLimitManager = SoundCloudRateLimitManager.getInstance();
  return rateLimitManager.isCurrentlyLimited();
};

/**
 * Get current SoundCloud rate limit status
 */
export const getSoundCloudRateStatus = (): RateLimitInfo => {
  const rateLimitManager = SoundCloudRateLimitManager.getInstance();
  return rateLimitManager.getStatus();
};

export default SoundCloudRateLimitManager;
