# Post-Fix Cleanup Instructions

## After Google Cloud Console is Fixed

Once the Google OAuth is working (no more "unregistered_origin" error), follow these steps:

### 1. Test the Full Flow
- Try the Google login button
- Verify user data is saved in MongoDB
- Check that JWT tokens are working

### 2. Clean Up Hardcoded Values
Replace the hardcoded Google Client ID in `GoogleLoginButton.tsx` with environment variable:

**In `Frontend/src/components/GoogleLoginButton.tsx`:**
```typescript
// Change this line:
const GOOGLE_CLIENT_ID = "426358192580-codjb0ifkqd4s71b8u0ps9qdqof9shio.apps.googleusercontent.com";

// To this:
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

### 3. Remove Debug Logs (Optional)
Once everything is working, you can remove the extensive console.log statements from:
- `GoogleLoginButton.tsx`
- `AuthContext.tsx`

### 4. Final Verification
- Test with environment variables
- Ensure no hardcoded secrets remain
- Verify both dev and production configs are ready

## Expected Flow After Fix
1. User clicks "Google" button
2. Google popup appears (no more origin error)
3. User selects Google account
4. Frontend receives credential
5. Frontend sends to backend `/api/auth/google`
6. Backend verifies with Google
7. Backend creates/finds user in MongoDB
8. Backend returns JWT token
9. User is logged in successfully

## Troubleshooting
If still having issues after Google Cloud Console fix:
- Clear browser cache
- Try incognito window
- Check browser dev tools console for new errors
- Verify backend is running and accessible
