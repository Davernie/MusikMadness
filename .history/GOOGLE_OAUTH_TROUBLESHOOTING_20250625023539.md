# Google OAuth "unregistered_origin" Troubleshooting Guide

## Issue
Still getting "The given origin is not allowed for the given client ID" even after adding origin to Google Cloud Console.

## Common Causes & Solutions

### 1. **Propagation Delay**
- Google Cloud Console changes can take up to **1 hour** to propagate
- Try waiting 10-15 more minutes if you just made the change
- Clear browser cache completely or try incognito mode

### 2. **Incorrect Origin Format**
Check that you added the EXACT origin format in Google Cloud Console:

**❌ WRONG:**
- `localhost:5173`
- `http://localhost:5173/`
- `https://localhost:5173`

**✅ CORRECT:**
- `http://localhost:5173`

### 3. **Wrong Google Cloud Project**
- Make sure you're editing the OAuth Client ID in the **correct Google Cloud project**
- Verify the Client ID in the console matches: `426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`

### 4. **OAuth Client Type**
- Ensure your OAuth Client ID is of type **"Web application"**
- Not "Desktop application" or "Mobile application"

### 5. **Browser Cache/Cookies**
- Clear all browser data for `accounts.google.com`
- Try in a completely different browser
- Try incognito/private mode

### 6. **Multiple OAuth Clients**
- Check if you have multiple OAuth Client IDs
- Make sure you're editing the one that matches your `.env` file

## Debug Steps

### Step 1: Verify Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to **APIs & Services** → **Credentials**
3. Find OAuth Client ID: `426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`
4. Click on it to view details
5. **Take a screenshot** of the "Authorized JavaScript origins" section
6. Verify it shows:
   ```
   http://localhost:5173
   ```

### Step 2: Test with Debug Page
1. Open `google-oauth-debug.html` in your browser at `http://localhost:5173`
2. Click "Test Google OAuth" button
3. Check console for detailed error messages

### Step 3: Check API Enablement
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" or "Google Identity"
3. Make sure it's **ENABLED**

### Step 4: Try Different Port
Temporarily change your Vite dev server to port 3000:
```bash
cd Frontend
npm run dev -- --port 3000
```
Then add `http://localhost:3000` to authorized origins.

## Alternative Solution: Create New OAuth Client

If the above doesn't work, create a fresh OAuth Client ID:

1. Go to Google Cloud Console → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Choose **Web application**
4. Name: "MusikMadness Local Development"
5. **Authorized JavaScript origins:**
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://127.0.0.1:5173`
6. Leave **Authorized redirect URIs** empty
7. Click **Create**
8. Copy the new Client ID
9. Update your `.env` files with the new Client ID

## Current Debugging Status

**Your Configuration:**
- Client ID: `426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`
- Origin: `http://localhost:5173`
- Error: "unregistered_origin"

**Next Steps:**
1. ✅ Verify exact origin format in Google Cloud Console
2. ⏳ Wait additional time for propagation (if recently changed)
3. 🧹 Clear browser cache completely
4. 🔍 Use debug page to get more detailed error info
5. 🆕 Create new OAuth Client ID if all else fails

## Expected Timeline
- **If propagation issue:** 5-60 minutes
- **If configuration issue:** Fix immediately
- **If need new OAuth client:** 5 minutes to create + test
