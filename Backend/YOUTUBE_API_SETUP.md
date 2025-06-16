# YouTube Data API v3 Setup Guide

This guide will walk you through setting up the YouTube Data API v3 to enable live stream detection for your application.

## Prerequisites
- Google account
- Access to Google Cloud Console

## Step-by-Step Setup

### 1. Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account

### 2. Create or Select a Project
1. Click on the project dropdown at the top of the page
2. Either:
   - **Create New Project**: Click "New Project", enter a name (e.g., "MusikMadness-YouTube"), and click "Create"
   - **Select Existing Project**: Choose an existing project if you have one

### 3. Enable YouTube Data API v3
1. In the left sidebar, go to **"APIs & Services" > "Library"**
2. Search for "YouTube Data API v3"
3. Click on "YouTube Data API v3" from the results
4. Click the **"Enable"** button
5. Wait for the API to be enabled (this may take a few moments)

### 4. Create API Credentials
1. Go to **"APIs & Services" > "Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"API key"**
4. A new API key will be generated - **copy this key immediately**
5. (Optional but recommended) Click "RESTRICT KEY" to add restrictions:
   - **Application restrictions**: Choose "HTTP referrers" or "IP addresses" based on your deployment
   - **API restrictions**: Select "Restrict key" and choose "YouTube Data API v3"

### 5. Configure Your Environment
1. Open your `Backend/.env` file
2. Replace `YOUR_YOUTUBE_API_KEY` with your actual API key:
   ```
   YOUTUBE_API_KEY=AIzaSyC1234567890abcdefghijklmnopqrstuvwxyz
   ```

### 6. Test Your Setup
Run the test script to verify your API key works:
```bash
cd Backend
node test-youtube-api.js
```

## API Limitations & Important Notes

### Quota Limits
- **Daily Quota**: 10,000 units per day (free tier)
- **Live stream search**: ~100 units per request
- **Channel info**: ~1 unit per request
- **Video details**: ~1 unit per request

### Live Stream Detection Challenges
YouTube live stream detection is more complex than Twitch/Kick:

1. **No Direct Live Status Endpoint**: Unlike Twitch, YouTube doesn't have a simple "is channel live" endpoint
2. **Search-Based Detection**: We use the search API with `eventType=live` parameter
3. **Quota Consumption**: Each live check uses significant quota
4. **Rate Limiting**: YouTube has strict rate limits

### Best Practices
1. **Cache Results**: Don't check the same channel too frequently
2. **Batch Requests**: Group multiple channel checks when possible
3. **Handle Failures Gracefully**: YouTube API can be unreliable
4. **Monitor Quota Usage**: Check your quota usage in Google Cloud Console

## Troubleshooting

### Common Issues

#### 1. "API key not valid" Error
- Verify your API key is correct in `.env`
- Check if YouTube Data API v3 is enabled
- Ensure API key restrictions allow your application

#### 2. "Quota exceeded" Error
- You've hit the daily 10,000 unit limit
- Wait until the next day (resets at midnight Pacific Time)
- Consider implementing caching to reduce API calls

#### 3. "Access forbidden" Error
- Check API key restrictions
- Verify the YouTube Data API v3 is enabled
- Ensure you're using the correct project

#### 4. No Live Streams Found
- YouTube live detection is not 100% reliable
- Some channels may not appear in live search results
- Consider implementing fallback methods (RSS feeds, etc.)

### Monitoring Usage
1. Go to **"APIs & Services" > "Dashboard"** in Google Cloud Console
2. Click on "YouTube Data API v3"
3. View your quota usage and request statistics

## Alternative Methods

If the YouTube Data API doesn't work well for live detection, consider these alternatives:

### 1. RSS Feed Method
YouTube provides RSS feeds that can indicate recent uploads:
```
https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID
```

### 2. YouTube Channel Page Scraping
- Parse the channel page HTML (be careful of rate limits)
- Look for live indicators in the page

### 3. Third-Party Services
- Use services like Social Blade API
- YouTube Analytics API (requires OAuth)

## Security Considerations

1. **Keep API Key Secret**: Never commit your API key to version control
2. **Use Restrictions**: Always restrict your API key to specific APIs and domains
3. **Rotate Keys**: Periodically rotate your API keys
4. **Monitor Usage**: Watch for unexpected API usage

## Cost Considerations

- Free tier: 10,000 units/day
- Paid tier: $0.10 per 100 units after free quota
- Live stream checking can consume quota quickly
- Consider implementing smart caching strategies

## Next Steps

After setting up your API key:

1. Test the connection with `node test-youtube-api.js`
2. Add YouTube streamers to your database using the seed script
3. Monitor the live status updates in your application logs
4. Adjust the check frequency based on your quota usage

For more information, visit the [YouTube Data API documentation](https://developers.google.com/youtube/v3).
