# Google OAuth Setup Guide for MusikMadness

This guide will help you set up Google OAuth authentication for your MusikMadness application.

## Prerequisites

- A Google account
- Access to Google Cloud Console

## Step 1: Google Cloud Console Setup

### 1.1 Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top of the page
3. Click "New Project"
4. Enter a project name (e.g., "MusikMadness OAuth")
5. Click "Create"

### 1.2 Enable Google APIs

1. In the Google Cloud Console, navigate to "APIs & Services" → "Library"
2. Search for "Google+ API" or "Google Identity"
3. Click on "Google+ API" and click "Enable"
4. Also enable "Google Identity Services API" if available

### 1.3 Create OAuth 2.0 Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth 2.0 Client ID"
3. If prompted, configure the OAuth consent screen first:
   - Choose "External" for user type
   - Fill in the application name: "MusikMadness"
   - Add your support email
   - Add your domain (for production)
   - Click "Save and Continue"
4. For Application type, select "Web application"
5. Give it a name (e.g., "MusikMadness Web Client")

### 1.4 Configure Authorized Origins and Redirect URIs

**For Development:**
- Authorized JavaScript origins:
  - `http://localhost:3000`
  - `http://localhost:5173`
  - `http://127.0.0.1:3000`
  - `http://127.0.0.1:5173`

**For Production:**
- Authorized JavaScript origins:
  - `https://yourdomain.com`
  - `https://www.yourdomain.com`

**Note:** You typically don't need redirect URIs for the Google Sign-In JavaScript API, but if required, use your domain URLs.

6. Click "Create"
7. Copy the **Client ID** - you'll need this for your environment variables

## Step 2: Configure Your Application

### 2.1 Backend Configuration

1. Open `Backend/.env`
2. Replace the placeholder values:

```env
GOOGLE_CLIENT_ID="your_actual_client_id_here"
GOOGLE_CLIENT_SECRET="your_actual_client_secret_here"
```

### 2.2 Frontend Configuration

1. Open `Frontend/.env`
2. Replace the placeholder value:

```env
VITE_GOOGLE_CLIENT_ID="your_actual_client_id_here"
```

**Important:** Only use the Client ID in the frontend, never the Client Secret!

## Step 3: Test the Integration

### 3.1 Start Your Servers

```bash
# Backend
cd Backend
npm run dev

# Frontend (in another terminal)
cd Frontend
npm run dev
```

### 3.2 Test Google Login

1. Navigate to your application in the browser
2. Look for the "Sign in with Google" button
3. Click it and complete the Google OAuth flow
4. Verify that:
   - User is created in your database
   - JWT token is generated
   - User information is correctly stored

## Step 4: Using Google Login in Your Components

### Basic Usage

```tsx
import React from 'react';
import GoogleLoginButton from './components/GoogleLoginButton';
import authService from './services/authService';

const MyLoginComponent: React.FC = () => {
  const handleGoogleSuccess = (user: any, token: string) => {
    console.log('User logged in:', user);
    // Redirect to dashboard or update app state
  };

  const handleGoogleError = (error: string) => {
    console.error('Login failed:', error);
    // Show error message to user
  };

  return (
    <div>
      <GoogleLoginButton
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />
    </div>
  );
};
```

### Using the Auth Service

```tsx
import authService from './services/authService';

// Check if user is authenticated
const isLoggedIn = authService.isAuthenticated();

// Get current user data
const user = await authService.getCurrentUser();

// Logout
authService.logout();
```

## Step 5: Production Deployment

### 5.1 Update OAuth Settings

1. Go back to Google Cloud Console → Credentials
2. Edit your OAuth 2.0 Client ID
3. Add your production domain to authorized origins:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

### 5.2 Update Environment Variables

Update your production environment variables with the same Google Client ID and Secret.

### 5.3 Verify Domain Ownership

For production use, Google may require you to verify domain ownership in the OAuth consent screen configuration.

## Troubleshooting

### Common Issues

1. **"Sign-in failed" error:**
   - Check that your Client ID is correct
   - Verify that your domain is added to authorized origins
   - Make sure the Google+ API is enabled

2. **"Unauthorized" errors:**
   - Ensure your backend Google Client Secret is correct
   - Check that the token is being sent properly to your backend

3. **CORS errors:**
   - Make sure your frontend URL is in the authorized origins
   - Check your backend CORS configuration

4. **Token verification fails:**
   - Verify that both frontend and backend are using the same Client ID
   - Check that your Google Cloud project has the necessary APIs enabled

### Debug Tips

1. Check browser console for JavaScript errors
2. Check backend logs for authentication errors
3. Verify that environment variables are loaded correctly
4. Test the Google Token verification manually in your backend

## Security Considerations

1. **Never expose Client Secret:** Only use it in your backend environment
2. **Use HTTPS in production:** Google OAuth requires HTTPS for production domains
3. **Validate tokens on backend:** Always verify Google tokens server-side
4. **Store tokens securely:** Use secure storage methods for JWT tokens
5. **Regular key rotation:** Consider rotating your OAuth credentials periodically

## Database Schema

Your User model now includes these additional fields:

```typescript
{
  googleId?: string;           // Google's unique user ID
  authProvider?: 'local' | 'google';  // How the user authenticated
  googleProfilePicture?: string;      // URL to Google profile picture
  // ... other existing fields
}
```

## API Endpoints

Your application now has these additional endpoints:

- `POST /api/auth/google` - Google OAuth login

The endpoint accepts:
```json
{
  "idToken": "google_id_token_here"
}
```

And returns:
```json
{
  "message": "Google login successful",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "email@example.com",
    "authProvider": "google",
    // ... other user fields
  }
}
```
