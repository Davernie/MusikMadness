import { Request } from 'express';

/**
 * Get the base URL for the current request, ensuring HTTPS in production
 * @param req Express Request object
 * @returns Base URL string (e.g., "https://musikmadnessbackend.onrender.com")
 */
export const getBaseUrl = (req: Request): string => {
  const host = req.get('host');
  let protocol = req.protocol;
  
  // Force HTTPS in production or when behind a proxy (like Render.com)
  const isProduction = process.env.NODE_ENV === 'production';
  const isRenderDomain = host?.includes('onrender.com');
  const hasXForwardedProto = req.get('x-forwarded-proto') === 'https';
  
  if (isProduction || isRenderDomain || hasXForwardedProto) {
    protocol = 'https';
  }
  
  return `${protocol}://${host}`;
};

/**
 * Generate a complete URL for a given path
 * @param req Express Request object
 * @param path The path to append (e.g., "/api/users/123/profile-picture")
 * @returns Complete URL with proper protocol
 */
export const getFullUrl = (req: Request, path: string): string => {
  const baseUrl = getBaseUrl(req);
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
};

/**
 * Generate profile picture URL for a user
 * @param req Express Request object
 * @param userId User ID
 * @returns Profile picture URL or null if no profile picture
 */
export const getProfilePictureUrl = (req: Request, userId: string, hasProfilePicture: boolean): string | null => {
  if (!hasProfilePicture) return null;
  return getFullUrl(req, `/api/users/${userId}/profile-picture`);
};

/**
 * Generate cover image URL for a user
 * @param req Express Request object
 * @param userId User ID
 * @returns Cover image URL or null if no cover image
 */
export const getCoverImageUrl = (req: Request, userId: string, hasCoverImage: boolean): string | null => {
  if (!hasCoverImage) return null;
  return getFullUrl(req, `/api/users/${userId}/cover-image`);
};

/**
 * Generate tournament cover image URL
 * @param req Express Request object
 * @param tournamentId Tournament ID
 * @returns Tournament cover image URL or null if no cover image
 */
export const getTournamentCoverImageUrl = (req: Request, tournamentId: string, hasCoverImage: boolean): string | null => {
  if (!hasCoverImage) return null;
  return getFullUrl(req, `/api/tournaments/${tournamentId}/cover-image`);
};
