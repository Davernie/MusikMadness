# SoundCloud Rate Limiting - Implementation Guide

## Overview
This document explains the SoundCloud play rate limits and how MusikMadness handles them gracefully.

## SoundCloud API Limits

### ✅ **Metadata Requests: UNLIMITED**
- Fetching track information, artwork, titles, etc.
- No restrictions on `/resolve` endpoint calls
- Used during submission creation and display

### ⚠️ **Play Requests: 15,000 per 24 hours**
- Applies to actual audio streaming
- Shared across your entire application
- 24-hour rolling window from first play

## Rate Limit Impact

### **What counts toward the limit:**
- Users clicking play on SoundCloud tracks
- SoundCloud widget auto-play (if enabled)
- Any audio streaming from SoundCloud

### **What does NOT count:**
- Displaying track metadata
- Showing thumbnails/artwork
- Loading SoundCloud widgets (without playing)
- Fetching track information during submission

## Implementation Details

### **1. Rate Limit Manager**
Location: `Backend/src/utils/soundcloudRateLimit.ts`

Features:
- Tracks current rate limit status
- Handles 429 responses from SoundCloud API
- Provides graceful fallback messaging
- Automatic reset when time window expires

### **2. Error Handling**
Location: `Backend/src/controllers/tournamentController.ts`

When rate limited:
- Returns track metadata with `rateLimited: true` flag
- Includes user-friendly message with reset time
- Allows UI to display appropriate warnings

### **3. Status Endpoint**
Endpoint: `GET /api/tournaments/soundcloud/status`

Returns:
```json
{
  "isRateLimited": false,
  "playsRemaining": 14750,
  "resetTime": null,
  "message": "SoundCloud is available"
}
```

## Usage Estimates

### **Tournament Size Guidelines:**
- **Small tournaments** (50-100 users): ~250-500 plays = ✅ Safe
- **Medium tournaments** (200-500 users): ~1,000-2,500 plays = ⚠️ Monitor  
- **Large tournaments** (500+ users): ~2,500+ plays = ⚠️ Risk of limit

### **Peak Usage Scenarios:**
- **Voting periods**: High play activity as users compare tracks
- **Viral tournaments**: Sudden traffic spikes
- **Multiple concurrent tournaments**: Combined play counts

## Monitoring & Alerts

### **Check Rate Limit Status:**
```bash
curl https://your-domain.com/api/tournaments/soundcloud/status
```

### **Response when limited:**
```json
{
  "isRateLimited": true,
  "playsRemaining": 0,
  "resetTime": "2025-06-08T10:30:00.000Z",
  "message": "SoundCloud play limit reached. Try again after 6/8/2025, 10:30:00 AM"
}
```

### **Log Monitoring:**
Watch for these log messages:
- `🚨 SoundCloud rate limit reached`
- `🚨 SoundCloud rate limited, returning fallback response`
- `✅ SoundCloud rate limit reset`

## User Experience

### **When NOT rate limited:**
- SoundCloud tracks play normally
- Full functionality available
- No restrictions or warnings

### **When rate limited:**
- Tracks still display with metadata
- Play buttons may show rate limit warning
- Users can still view/vote based on information
- SoundCloud widgets may still work (they have separate limits)

## Mitigation Strategies

### **Immediate Actions:**
1. **Monitor usage** during peak tournament periods
2. **Stagger tournament launches** to spread play activity
3. **Encourage off-peak participation** when possible

### **Long-term Solutions:**
1. **Multiple SoundCloud apps** (different client IDs = separate limits)
2. **Caching strategies** for frequently played tracks
3. **Analytics integration** to predict and prevent limit hits
4. **Premium SoundCloud API** (if available) for higher limits

## Configuration

### **Required Environment Variable:**
```env
SOUNDCLOUD_CLIENT_ID=your_soundcloud_client_id_here
```

### **Getting a SoundCloud Client ID:**
1. Go to https://soundcloud.com/you/apps
2. Create a new app with your tournament platform details
3. Copy the Client ID to your `.env` file
4. Restart your backend server

## Testing Rate Limits

### **Simulate Rate Limit (Development Only):**
```javascript
// Temporarily modify soundcloudRateLimit.ts for testing
this.isLimitReached = true;
this.playsRemaining = 0;
this.resetTime = new Date(Date.now() + 3600000); // 1 hour from now
```

### **Verify Handling:**
1. Check status endpoint returns `isRateLimited: true`
2. Verify tournament stream URLs include `rateLimited: true`
3. Confirm UI shows appropriate messaging

## Troubleshooting

### **Rate limit not updating:**
- Check SoundCloud API responses in logs
- Verify error handling is catching 429 status codes
- Ensure rate limit manager is singleton instance

### **False rate limit warnings:**
- Check system clock synchronization
- Verify reset time parsing from SoundCloud responses
- Monitor for network timeouts being misinterpreted

### **Unexpected limit hits:**
- Review tournament participant counts
- Check for automated/bot traffic
- Monitor concurrent tournament activity

## Future Enhancements

### **Planned Improvements:**
1. **Predictive analytics** to estimate daily usage
2. **User notifications** when approaching limits
3. **Admin dashboard** for real-time monitoring
4. **Automatic failover** to alternative audio sources
5. **Play count analytics** per tournament

---

**Last Updated:** June 7, 2025  
**Status:** Implemented and Active
