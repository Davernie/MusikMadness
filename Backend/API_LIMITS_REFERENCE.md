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

### Check Frequencies (24/7 Safe with Priority System)
- **YouTube**: 
  - High Priority: Every 20 minutes
  - Medium Priority: Every 40 minutes  
  - Low Priority: Every 80 minutes
- **Twitch**: 
  - High Priority: Every 3 minutes
  - Medium Priority: Every 6 minutes
  - Low Priority: Every 12 minutes
- **Kick**: 
  - High Priority: Every 15 minutes
  - Medium Priority: Every 30 minutes
  - Low Priority: Every 60 minutes

### Current Implementation Features
- **Smart scheduling**: API limits manager distributes checks over time
- **Priority system**: Featured streamers checked more frequently
- **Automatic backoff**: Exponential delay on errors
- **Quota monitoring**: Real-time usage tracking
- **Safety margins**: 20-25% buffer on all limits
- **Error recovery**: Temporary disabling and re-enabling
- **Reset handling**: Automatic quota reset detection
