import { OAuth2Client } from 'google-auth-library';
import User, { IUser } from '../models/User';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('Google OAuth credentials not configured. Google login will be disabled.');
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET);

export interface GoogleUserInfo {
  sub: string; // Google ID
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Verify Google ID token and extract user information
 */
export async function verifyGoogleToken(idToken: string): Promise<GoogleUserInfo> {
  try {
    console.log('🔍 Verifying Google token...');
    console.log('📝 Token length:', idToken.length);
    console.log('🔑 Using Client ID:', GOOGLE_CLIENT_ID);
    console.log('🗝️ Client Secret configured:', !!GOOGLE_CLIENT_SECRET);
    
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log('✅ Token verification successful');
    console.log('📋 Payload received:', {
      sub: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      aud: payload?.aud
    });
    
    if (!payload) {
      throw new Error('Invalid token payload');
    }

    const userInfo = {
      sub: payload.sub,
      email: payload.email!,
      email_verified: payload.email_verified || false,
      name: payload.name!,
      picture: payload.picture!,
      given_name: payload.given_name,
      family_name: payload.family_name
    };

    console.log('👤 Extracted user info:', {
      sub: userInfo.sub,
      email: userInfo.email,
      name: userInfo.name
    });

    return userInfo;
  } catch (error) {
    console.error('❌ Error verifying Google token:', error);
    console.error('🔍 Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error('Invalid Google token');
  }
}

/**
 * Find or create user from Google OAuth data
 */
export async function findOrCreateGoogleUser(googleUserInfo: GoogleUserInfo): Promise<IUser> {
  try {
    // First, try to find user by Google ID
    let user = await User.findOne({ googleId: googleUserInfo.sub });
    
    if (user) {
      // Update user info if it has changed
      let updated = false;
      
      if (user.email !== googleUserInfo.email && googleUserInfo.email_verified) {
        user.email = googleUserInfo.email;
        user.isEmailVerified = true;
        updated = true;
      }
      
      if (user.googleProfilePicture !== googleUserInfo.picture) {
        user.googleProfilePicture = googleUserInfo.picture;
        updated = true;
      }
      
      if (updated) {
        await user.save();
      }
      
      return user;
    }

    // If no user found by Google ID, check if user exists by email
    user = await User.findOne({ email: googleUserInfo.email });
    
    if (user) {
      // Link existing account with Google
      if (user.authProvider === 'local') {
        // User has local account, link it with Google
        user.googleId = googleUserInfo.sub;
        user.googleProfilePicture = googleUserInfo.picture;
        if (googleUserInfo.email_verified) {
          user.isEmailVerified = true;
        }
        await user.save();
        return user;
      } else {
        throw new Error('Account already exists with different provider');
      }
    }

    // Create new user
    const username = await generateUniqueUsername(googleUserInfo.name, googleUserInfo.email);
    
    user = new User({
      username,
      email: googleUserInfo.email,
      googleId: googleUserInfo.sub,
      authProvider: 'google',
      isEmailVerified: googleUserInfo.email_verified,
      googleProfilePicture: googleUserInfo.picture,
      // Google users don't need a password
      password: undefined
    });

    await user.save();
    return user;
    
  } catch (error) {
    console.error('Error in findOrCreateGoogleUser:', error);
    throw error;
  }
}

/**
 * Generate a unique username from Google user info
 */
async function generateUniqueUsername(name: string, email: string): Promise<string> {
  // Start with the name, fallback to email prefix
  let baseUsername = name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove non-alphanumeric characters
    .substring(0, 20); // Limit length

  if (!baseUsername) {
    baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 20);
  }

  if (!baseUsername) {
    baseUsername = 'user';
  }

  let username = baseUsername;
  let counter = 1;

  // Check if username exists and increment if needed
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
    
    // Prevent infinite loop
    if (counter > 1000) {
      username = `${baseUsername}${Date.now()}`;
      break;
    }
  }

  return username;
}

export default {
  verifyGoogleToken,
  findOrCreateGoogleUser
};
