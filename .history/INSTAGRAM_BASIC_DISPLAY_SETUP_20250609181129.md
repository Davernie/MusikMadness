# Instagram Basic Display API Setup Guide

## Current Issue
Your Meta for Developers app has "Instagram Business API" but needs "Instagram Basic Display" for personal Instagram account authentication.

## Step-by-Step Setup

### 1. Access Your Meta for Developers App
1. Go to [developers.facebook.com](https://developers.facebook.com)
2. Navigate to "My Apps"
3. Select your existing app (App ID: 1461444585210988)

### 2. Add Instagram Basic Display Product
1. In your app dashboard, look for "Add Product" section
2. Find "Instagram Basic Display" and click "Set Up"
3. If you don't see it, click "Show All" to reveal all available products

### 3. Configure Instagram Basic Display
Once you've added the product:

1. **OAuth Redirect URIs**: Add these URIs:
   - `http://localhost:5173/instagram/callback` (development)
   - `https://musikmadness.com/instagram/callback` (production)

2. **Deauthorize Callback URL**: (Optional)
   - `http://localhost:5000/api/users/instagram/deauthorize` (development)
   - `https://musikmadnessbackend.onrender.com/api/users/instagram/deauthorize` (production)

3. **Data Deletion Request URL**: (Optional)
   - `http://localhost:5000/api/users/instagram/data-deletion` (development)
   - `https://musikmadnessbackend.onrender.com/api/users/instagram/data-deletion` (production)

### 4. Get Your Instagram Basic Display Credentials
After setting up Instagram Basic Display:

1. Go to "Instagram Basic Display" → "Basic Display"
2. Note down:
   - **Instagram App ID**: (This should be the same as your current INSTAGRAM_CLIENT_ID)
   - **Instagram App Secret**: (This should be the same as your current INSTAGRAM_CLIENT_SECRET)

### 5. Add Instagram Testers
1. In "Instagram Basic Display" section, go to "Roles" → "Roles"
2. Click "Add Instagram Testers"
3. Enter the Instagram username you want to test with (your Instagram account)
4. Click "Submit"

### 6. Accept Tester Invitation
1. Go to your Instagram app on mobile or web
2. Go to Settings → Privacy → Website Permissions
3. Look for "Tester Invites" and accept the invitation from your app

### 7. Update Environment Variables (if needed)
Your current credentials should work, but verify in your `.env` file:

```env
INSTAGRAM_CLIENT_ID="1461444585210988"
INSTAGRAM_CLIENT_SECRET="75c39a7d076f620279469efef5f76264"
INSTAGRAM_REDIRECT_URI="http://localhost:5173/instagram/callback"
```

## Testing Steps

### 1. Test the OAuth URL Generation
Start your backend server and check that the Instagram auth URL is generated correctly:

```bash
curl http://localhost:5000/api/users/instagram/auth-url
```

Expected response:
```json
{
  "authUrl": "https://api.instagram.com/oauth/authorize?client_id=1461444585210988&redirect_uri=http%3A%2F%2Flocalhost%3A5173%2Finstagram%2Fcallback&scope=user_profile%2Cuser_media&response_type=code&state=..."
}
```

### 2. Test the Complete OAuth Flow
1. Start both backend (`npm start`) and frontend (`npm run dev`)
2. Go to http://localhost:5173/settings
3. Click "Connect Instagram"
4. You should be redirected to Instagram login
5. After logging in, Instagram should redirect back to your app

## Troubleshooting

### "Invalid platform app" Error
- This means your app doesn't have Instagram Basic Display product added
- Follow steps 2-3 above to add the correct product

### "Application does not have permission for this action" Error
- Your app needs to be in "Development" mode to test with personal accounts
- Make sure you've added yourself as an Instagram Tester (steps 5-6)

### "redirect_uri_mismatch" Error
- Check that your redirect URI exactly matches what's configured in Meta for Developers
- Make sure there are no trailing slashes or typos

### "Invalid client_id" Error
- Double-check your Instagram App ID in the Meta for Developers console
- Ensure INSTAGRAM_CLIENT_ID in .env matches exactly

## Important Notes

1. **Development vs Production**: Instagram Basic Display requires different approval processes for production use
2. **Rate Limits**: Basic Display has rate limits - be mindful during testing
3. **Token Expiration**: Long-lived tokens expire after 60 days and need refreshing
4. **App Review**: For production, you'll need to submit your app for review

## Current Credentials Status
✅ Instagram Client ID: Configured  
✅ Instagram Client Secret: Configured  
✅ Redirect URI: Correctly pointing to frontend  
🔄 Instagram Basic Display Product: Needs to be added  
🔄 Instagram Tester: Needs to be added  

## Next Steps
1. Add Instagram Basic Display product to your Meta app
2. Add yourself as an Instagram tester
3. Accept the tester invitation on Instagram
4. Test the OAuth flow in your application
