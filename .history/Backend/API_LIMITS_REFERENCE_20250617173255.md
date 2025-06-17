# API Limits Reference for MusikMadness Live Stream Checking

## Current API Limits (as of June 2025)

### YouTube Data API v3
- **Daily Quota**: 10,000 units per day
- **Cost per live search**: ~100 units
- **Cost per channel info**: ~1 unit
- **Cost per video details**: ~1 unit
- **Maximum live checks per day**: 80 (safe limit with buffer)
- **Minimum check interval**: 20 minutes
- **Quota reset**: Daily at midnight Pacific Time

### Twitch Helix API
- **Rate Limit**: 800 requests per minute
- **Safe limit**: 600 requests per minute (25% buffer)
- **Per Client ID**: All requests count toward this limit
- **No daily quota**: Only rate limit concerns
- **Minimum check interval**: 3 minutes
- **Max concurrent channels**: ~200 channels with smart scheduling

### Kick API (Official OAuth 2.1)
- **Rate Limit**: ~60 requests per hour
- **Very restrictive**: May block despite following limits
- **Token expiry**: 24 hours (refresh at 23 hours)
- **Minimum check interval**: 15 minutes
- **Max concurrent channels**: 2-3 channels safely

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
