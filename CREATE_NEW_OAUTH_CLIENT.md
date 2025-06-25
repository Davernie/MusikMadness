# Create New Google OAuth Client ID for Local Development

## The Problem
Your current OAuth Client ID (`426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com`) seems to have persistent configuration issues with `http://localhost:5173` despite adding it to authorized origins.

## Solution: Create New OAuth Client ID

### Step 1: Go to Google Cloud Console
1. Open [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**

### Step 2: Create New OAuth 2.0 Client ID
1. Click **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
2. Choose **Web application**
3. **Name**: `MusikMadness Local Development`
4. **Authorized JavaScript origins**:
   - `http://localhost:5173`
   - `http://localhost:3000`
   - `http://127.0.0.1:5173`
5. **Authorized redirect URIs**: Leave empty (not needed for our implementation)
6. Click **Create**

### Step 3: Update Environment Variables
1. Copy the new Client ID from the popup
2. Update `Frontend/.env`:
   ```
   VITE_GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
   ```
3. Update `Backend/.env`:
   ```
   GOOGLE_CLIENT_ID=YOUR_NEW_CLIENT_ID_HERE
   GOOGLE_CLIENT_SECRET=YOUR_EXISTING_SECRET
   ```

### Step 4: Update Code
1. In `GoogleLoginButton.tsx`, change:
   ```typescript
   // From hardcoded:
   const GOOGLE_CLIENT_ID = "426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com";
   
   // To environment variable:
   const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
   ```

### Step 5: Test
1. Restart both frontend and backend
2. Test Google login
3. Should work immediately with new Client ID

## Why This Will Work
- **Fresh OAuth Client** = No cached configuration issues
- **Proper origin setup** from the start
- **Clean slate** for testing

## Alternative: Keep Current Client ID
If you want to keep using the current Client ID, try:
1. **Remove and re-add** `http://localhost:5173` in Google Cloud Console
2. Wait 1 hour for full propagation
3. Clear all browser data for `accounts.google.com`
4. Test in incognito mode

But creating a new OAuth Client ID is faster and more reliable for development.
