# Twitch API Setup for Live Stream Monitoring

This guide explains how to set up Twitch API credentials to enable automatic live status checking for Twitch streamers.

## Prerequisites

- A Twitch account
- Access to the Twitch Developer Console

## Step 1: Create a Twitch Application

1. Go to the [Twitch Developer Console](https://dev.twitch.tv/console/apps)
2. Click "Register Your Application"
3. Fill in the application details:
   - **Name**: `MusikMadness-LiveStreams` (or any name you prefer)
   - **OAuth Redirect URLs**: `http://localhost:3000` (not used for our API, but required)
   - **Category**: Choose "Application Integration" or "Website Integration"
4. Click "Create"

## Step 2: Get Your Credentials

1. After creating the app, click "Manage" on your application
2. Copy the **Client ID** 
3. Click "New Secret" to generate a **Client Secret**
4. Copy the **Client Secret** (you won't be able to see it again)

## Step 3: Add Credentials to Environment

Add these credentials to your `Backend/.env` file:

```env
# Twitch API Configuration
TWITCH_CLIENT_ID=your_client_id_here
TWITCH_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Restart the Backend Server

After adding the credentials, restart your backend server. You should see:

```
🚀 Starting periodic streamer status updates (every 2 minutes)
✅ Twitch API token obtained successfully
```

## How It Works

1. **Authentication**: The system uses OAuth 2.0 Client Credentials flow to get an access token
2. **Live Status Checking**: Every 2 minutes, the system checks each Twitch streamer's live status
3. **Data Updates**: When a streamer goes live/offline, the database is automatically updated with:
   - Live status (true/false)
   - Stream title
   - Viewer count
   - Thumbnail URL
   - Game category
   - Last status check timestamp

## API Endpoints

Once configured, you can also manually trigger status updates:

- `PUT /api/streamers/update-all-status` - Update all streamers
- `PUT /api/streamers/:id/update-status` - Update specific streamer

## Troubleshooting

### No Status Updates
- Check that `TWITCH_CLIENT_ID` and `TWITCH_CLIENT_SECRET` are set correctly
- Verify the credentials are valid in the Twitch Developer Console
- Check the backend logs for error messages

### Rate Limiting
- Twitch API has rate limits (800 requests per minute)
- With current 2-minute intervals, this supports ~800 streamers
- If you have more streamers, consider increasing the update interval

### Invalid Credentials
- Regenerate the Client Secret in the Twitch Developer Console
- Make sure there are no extra spaces in the environment variables

## Security Notes

- Keep your Client Secret secure and never commit it to version control
- The Client Secret should only be stored in your `.env` file
- Consider using environment-specific secrets for production deployments
