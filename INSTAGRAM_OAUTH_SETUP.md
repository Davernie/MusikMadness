# Instagram OAuth Integration Setup

This document explains how to set up Instagram OAuth integration for MusikMadness.

## Overview

The Instagram OAuth integration allows users to connect their real Instagram accounts instead of manually entering usernames. Users can:

1. Connect their Instagram account via OAuth popup
2. View connected account details (username, account type, media count)
3. Disconnect their Instagram account
4. Access Instagram profile through external link

## Prerequisites

1. Instagram Developer Account
2. Instagram App created in Meta for Developers
3. Basic Display API access

## Setup Instructions

### 1. Create Instagram App

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add Instagram Basic Display product
4. Configure Instagram Basic Display settings

### 2. Configure OAuth Settings

In your Instagram App settings:

1. **Valid OAuth Redirect URIs:**
   - Development: `http://localhost:3000/instagram/callback`
   - Production: `https://yourdomain.com/instagram/callback`

2. **Instagram App Review:**
   - Submit for `instagram_graph_user_profile` permission
   - Submit for `instagram_graph_user_media` permission

### 3. Environment Variables

Update your `.env` file in the Backend directory:

```env
# Instagram OAuth Credentials
INSTAGRAM_CLIENT_ID="your_instagram_client_id"
INSTAGRAM_CLIENT_SECRET="your_instagram_client_secret" 
INSTAGRAM_REDIRECT_URI="http://localhost:3000/instagram/callback"
```

For production, update the redirect URI to your production domain.

### 4. Test OAuth Flow

1. Start your development servers:
   ```bash
   # Backend
   cd Backend && npm run dev
   
   # Frontend  
   cd Frontend && npm start
   ```

2. Navigate to Settings page while logged in
3. Click "Connect Instagram" button
4. Complete OAuth flow in popup window
5. Verify connection shows account details

## API Endpoints

The integration adds these new endpoints:

- `GET /api/users/instagram/auth-url` - Generate OAuth authorization URL
- `POST /api/users/instagram/callback` - Handle OAuth callback
- `DELETE /api/users/instagram/disconnect` - Remove Instagram connection

## File Changes

### Backend
- `src/services/instagramService.ts` - Instagram OAuth service
- `src/models/User.ts` - Updated user model with Instagram data
- `src/routes/user.routes.ts` - New Instagram OAuth routes

### Frontend
- `src/hooks/useInstagramOAuth.ts` - React hook for OAuth management
- `src/pages/InstagramCallback.tsx` - OAuth callback handler
- `src/pages/SettingsPage.tsx` - Updated with Instagram integration
- `src/App.tsx` - Added Instagram callback route
- `src/types.ts` - Updated User interface

## Security Considerations

1. Access tokens are stored securely in the database
2. Tokens have expiration dates and are refreshed automatically
3. OAuth popup prevents third-party access to credentials
4. Users can disconnect their accounts at any time

## Troubleshooting

### Common Issues

1. **"Invalid OAuth Redirect URI"**
   - Ensure redirect URI in Instagram app matches exactly
   - Check for trailing slashes and HTTP vs HTTPS

2. **"App Not Approved"**
   - Submit app for review with required permissions
   - Ensure app meets Instagram's review criteria

3. **Popup Blocked**
   - Users may need to allow popups for your domain
   - Consider fallback redirect flow for mobile devices

### Debug Mode

Enable debug logging by setting `NODE_ENV=development` in your backend `.env` file.

## Production Deployment

1. Update Instagram app settings with production URLs
2. Update environment variables with production values
3. Ensure HTTPS is enabled for OAuth callbacks
4. Test OAuth flow in production environment

For questions or issues, refer to the [Instagram Basic Display API documentation](https://developers.facebook.com/docs/instagram-basic-display-api).
