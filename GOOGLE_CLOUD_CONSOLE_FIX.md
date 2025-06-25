# Google Cloud Console Fix for "unregistered_origin" Error

## Current Issue
The Google OAuth login is failing with error: `The given origin is not allowed for the given client ID.`

**Your Google Client ID:** `426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`
**Your Development URL:** `http://localhost:5173`

## Steps to Fix

### 1. Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're logged in with the same Google account that created the OAuth Client ID
3. Select your project (the one containing your OAuth credentials)

### 2. Navigate to OAuth Credentials
1. Go to **APIs & Services** → **Credentials**
2. Find your OAuth 2.0 Client ID: `426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`
3. Click on it to edit

### 3. Add Authorized JavaScript Origins
In the **Authorized JavaScript origins** section, add these URLs:
- `http://localhost:5173`
- `http://127.0.0.1:5173`
- `http://localhost:3000` (optional, for other dev servers)

**Important:** 
- Use `http://` (not `https://`) for localhost
- Don't include trailing slashes
- The port must match exactly (5173 for Vite dev server)

### 4. Save and Wait
1. Click **Save**
2. **Wait 5-10 minutes** for the changes to propagate (can take up to 1 hour)
3. Clear your browser cache or try in an incognito window

### 5. Test Again
1. Refresh your frontend app at `http://localhost:5173`
2. Try the Google login button again
3. The "unregistered_origin" error should be resolved

## Alternative Solution (If Still Not Working)

If the above doesn't work, create a new OAuth Client ID specifically for development:

1. In Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name it "MusikMadness Development"
5. Add Authorized JavaScript origins:
   - `http://localhost:5173`
   - `http://127.0.0.1:5173`
6. Leave Authorized redirect URIs empty (not needed for our implementation)
7. Click **Create**
8. Copy the new Client ID and update your `.env` files

## Current Configuration Status
- ✅ Backend `.env` has correct `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`
- ✅ Frontend `.env` has correct `VITE_GOOGLE_CLIENT_ID`
- ✅ Google login component is properly implemented
- ✅ Backend API endpoint is working
- ❌ **Google Cloud Console needs origin configuration**

## Next Steps After Fix
1. Test the full Google login flow
2. Verify user data is saved to MongoDB
3. Remove hardcoded Client ID from `GoogleLoginButton.tsx` and restore environment variable usage
4. Test with both environment variable and ensure everything works end-to-end
