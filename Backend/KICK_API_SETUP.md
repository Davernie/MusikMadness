# Kick API Setup Guide

## Overview
This guide will help you set up the official Kick API to get live status for Kick streamers. The implementation will fall back to unofficial APIs if the official API is not configured.

## Steps to Set Up Kick API

### 1. Create a Kick Account
- Sign up at https://kick.com if you haven't already
- Enable Two-Factor Authentication (2FA) in your account settings

### 2. Create a Kick Developer App
1. Go to your account settings: https://kick.com/settings/developer
2. Click "Create App" 
3. Fill in the required information:
   - **App Name**: `MusikMadness Live Streams`
   - **Description**: `Live stream status checking for MusikMadness`
   - **Redirect URI**: `http://localhost:5000/auth/kick/callback` (for development)
   - **Scopes**: No specific scopes needed for public livestream data

4. After creating the app, you'll get:
   - **Client ID**: Copy this value
   - **Client Secret**: Copy this value (keep it secure!)

### 3. Configure Environment Variables
Add these to your `.env` file in the Backend folder:

```bash
#Kick API Configuration
KICK_CLIENT_ID=your_actual_client_id_here
KICK_CLIENT_SECRET=your_actual_client_secret_here
```

### 4. Test the API
Run the test script to verify your setup:

```bash
cd Backend
node test-kick-api.js
```

## API Features

### Authentication Flow
- Uses OAuth 2.1 Client Credentials flow
- Automatically manages access tokens
- Tokens are cached and refreshed as needed

### Endpoints Used
1. **OAuth Token**: `https://id.kick.com/oauth/token`
   - Gets App Access Token using client credentials
   
2. **Channels**: `https://api.kick.com/public/v1/channels?slug={channelName}`
   - Gets channel information including live status
   
3. **Livestreams**: `https://api.kick.com/public/v1/livestreams`
   - Gets currently live streams (fallback)

### Fallback Strategy
If the official API fails or is not configured, the service will automatically fall back to:
1. Kick's unofficial v1 API (`https://kick.com/api/v1/channels/{channelName}`)
2. Kick's unofficial v2 API (`https://kick.com/api/v2/channels/{channelName}`)

## Rate Limits
- Official API: Not explicitly documented, but follows standard OAuth practices
- Unofficial API: No official limits, but use responsibly

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check your client ID and secret
2. **403 Forbidden**: Your app may not have the right permissions
3. **404 Not Found**: Channel name might be incorrect
4. **Security Policy Errors**: Unofficial API is blocked, use official API

### Manual Status Override
If APIs are blocked, you can manually set a streamer's status:

```bash
# Set streamer as live
curl -X PUT http://localhost:5000/api/streamers/live-status \
  -H "Content-Type: application/json" \
  -d '{"channelName": "asmongold", "isLive": true, "streamTitle": "Asmongold is live!"}'

# Set streamer as offline  
curl -X PUT http://localhost:5000/api/streamers/live-status \
  -H "Content-Type: application/json" \
  -d '{"channelName": "asmongold", "isLive": false}'
```

## Implementation Details

### KickService Features
- **Official API First**: Tries authenticated official API
- **Automatic Fallback**: Falls back to unofficial APIs if needed
- **Token Management**: Handles OAuth token lifecycle
- **Error Handling**: Graceful degradation when APIs are blocked
- **Comprehensive Logging**: Detailed console output for debugging

### Response Format
```typescript
{
  isLive: boolean;
  streamTitle?: string;
  viewerCount?: number;
  thumbnailUrl?: string;
}
```

## Testing Streamers
The service works with popular Kick streamers like:
- `asmongold` - Asmongold
- `xqcow` - xQc (if he streams on Kick)
- `ninja` - Ninja (if he streams on Kick)
- Any other Kick channel name

## Security Notes
- Keep your `KICK_CLIENT_SECRET` secure and never commit it to version control
- The client secret allows your app to authenticate with Kick's API
- Use environment variables for all sensitive credentials
