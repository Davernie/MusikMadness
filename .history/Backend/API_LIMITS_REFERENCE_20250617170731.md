# API Limits Reference for MusikMadness Live Stream Checking

## Current API Limits (as of June 2025)

### YouTube Data API v3
- **Daily Quota**: 10,000 units per day
- **Cost per live search**: ~100 units
- **Cost per channel info**: ~1 unit
- **Cost per video details**: ~1 unit
- **Maximum live checks per day**: ~100 (safely ~80 to leave room for other calls)
- **Recommended frequency**: Every 10-15 minutes per channel

### Twitch Helix API
- **Rate Limit**: 800 requests per minute
- **Per Client ID**: All requests count toward this limit
- **No daily quota**: Only rate limit concerns
- **Recommended frequency**: Every 2-5 minutes per channel
- **Max concurrent channels**: ~100-200 channels at 2-minute intervals

### Kick API (Unofficial/Official)
- **Rate Limit**: ~60-100 requests per hour per IP
- **Very restrictive**: Aggressive blocking
- **Token expiry**: 24 hours
- **Recommended frequency**: Every 10-20 minutes per channel
- **Max concurrent channels**: ~5-10 channels safely

## Optimal Strategy for 24/7 Operation

### Priority System
1. **High Priority**: Streamers with large audiences
2. **Medium Priority**: Regular streamers
3. **Low Priority**: Rarely live streamers

### Check Frequencies (24/7 Safe)
- **Twitch**: Every 3 minutes (high), 5 minutes (medium), 10 minutes (low)
- **Kick**: Every 15 minutes (high), 30 minutes (medium), 60 minutes (low)
- **YouTube**: Every 20 minutes (high), 45 minutes (medium), 90 minutes (low)

### Fallback Strategies
- **Caching**: Store results to reduce API calls
- **Error handling**: Exponential backoff on errors
- **Quota monitoring**: Track usage and adjust frequency
- **Alternative sources**: RSS feeds for YouTube as backup
