import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// Cloudflare R2 configuration
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL; // Optional: Custom domain for R2
const NODE_ENV = process.env.NODE_ENV || 'development';

// Check if R2 is configured
export const isR2Configured = !!(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET_NAME);

let r2Client: S3Client | null = null;

if (isR2Configured) {
  try {
    // Create S3 client configured for Cloudflare R2
    r2Client = new S3Client({
      region: 'auto', // R2 uses 'auto' for region
      endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID!,
        secretAccessKey: R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true, // Required for R2
    });
    
    if (NODE_ENV === 'development') {
      console.log('✅ R2 client initialized for development');
    }
  } catch (error) {
    console.error('❌ Failed to initialize R2 client:', error);
    r2Client = null;
  }
} else {
  if (NODE_ENV === 'development') {
    console.warn('⚠️  R2 not configured - using local file storage');
    console.warn('   Add R2 environment variables to enable cloud storage');
  }
}

export { r2Client };

export const R2_CONFIG = {
  bucketName: R2_BUCKET_NAME || '',
  publicUrl: R2_PUBLIC_URL || (R2_ACCOUNT_ID ? `https://pub-${R2_ACCOUNT_ID}.r2.dev` : ''),
  accountId: R2_ACCOUNT_ID || '',
  isConfigured: isR2Configured,
  isDevelopment: NODE_ENV === 'development',
};

// Helper function to generate file URL
export const getR2FileUrl = (key: string): string => {
  if (!isR2Configured) {
    throw new Error('R2 is not configured - cannot generate R2 URLs');
  }
  
  if (R2_PUBLIC_URL) {
    return `${R2_PUBLIC_URL}/${key}`;
  }
  // Use default R2 public URL format
  return `https://pub-${R2_ACCOUNT_ID}.r2.dev/${key}`;
};

// Helper function to generate file key for songs
export const generateSongKey = (tournamentId: string, userId: string, originalFilename: string): string => {
  const timestamp = Date.now();
  const extension = originalFilename.split('.').pop() || 'mp3';
  const sanitizedFilename = originalFilename
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_') // Replace multiple underscores with single
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
    
  // Add environment prefix for development
  const envPrefix = NODE_ENV === 'development' ? 'dev/' : '';
  
  return `${envPrefix}songs/${tournamentId}/${userId}/${timestamp}-${sanitizedFilename}.${extension}`;
};

// Helper function to get localhost-friendly URLs for development
export const getLocalHostFriendlyUrl = (r2Url: string, localBaseUrl: string): string => {
  if (NODE_ENV === 'development' && localBaseUrl.includes('localhost')) {
    // For development, we might want to proxy through the local server
    // This can be useful for CORS and debugging
    return r2Url; // Return R2 URL directly for now
  }
  return r2Url;
};

// Development helper to log R2 status
export const logR2Status = () => {
  if (NODE_ENV === 'development') {
    console.log('\n📦 R2 Storage Status:');
    console.log(`   Configured: ${isR2Configured ? '✅ Yes' : '❌ No'}`);
    if (isR2Configured) {
      console.log(`   Bucket: ${R2_BUCKET_NAME}`);
      console.log(`   Account: ${R2_ACCOUNT_ID}`);
      console.log(`   Public URL: ${R2_CONFIG.publicUrl || 'Default R2 domain'}`);
    } else {
      console.log('   📝 To enable R2: Add R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME to .env');
    }
    console.log('');
  }
}; 