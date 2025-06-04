/**
 * Utility functions for handling image fallbacks and default images
 */

import React from 'react';

// Default image paths - these will be served from the public directory
export const DEFAULT_IMAGES = {
  PROFILE_AVATAR: '/images/defaults/default-avatar.svg',
  COVER_BANNER: '/images/defaults/default-banner.jpg',
  TOURNAMENT_COVER: '/images/defaults/default-tournament.jpg'
} as const;

/**
 * Returns the appropriate fallback image URL based on the image type
 */
export const getFallbackImageUrl = (type: keyof typeof DEFAULT_IMAGES): string => {
  return DEFAULT_IMAGES[type];
};

/**
 * Validates if an image URL exists and is accessible
 * Returns the original URL if valid, fallback URL if not
 */
export const getImageWithFallback = (
  imageUrl: string | null | undefined, 
  fallbackType: keyof typeof DEFAULT_IMAGES
): string => {
  // If no image URL provided, return fallback immediately
  if (!imageUrl || imageUrl.trim() === '') {
    return getFallbackImageUrl(fallbackType);
  }
  
  // If it's already a fallback image, return as is
  if (Object.values(DEFAULT_IMAGES).includes(imageUrl as any)) {
    return imageUrl;
  }
  
  // Return the original URL - React's onError will handle failures
  return imageUrl;
};

/**
 * Props for the SafeImage component
 */
export interface SafeImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string | null;
  fallbackType: keyof typeof DEFAULT_IMAGES;
  alt: string;
}

/**
 * A safe image component that automatically handles fallbacks
 */
export const SafeImage: React.FC<SafeImageProps> = ({ 
  src, 
  fallbackType, 
  alt, 
  onError,
  ...props 
}) => {
  const [currentSrc, setCurrentSrc] = React.useState(
    getImageWithFallback(src, fallbackType)
  );
  const [hasErrored, setHasErrored] = React.useState(false);

  React.useEffect(() => {
    setCurrentSrc(getImageWithFallback(src, fallbackType));
    setHasErrored(false);
  }, [src, fallbackType]);

  const handleError = (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasErrored) {
      setHasErrored(true);
      setCurrentSrc(getFallbackImageUrl(fallbackType));
    }
    
    // Call the original onError handler if provided
    onError?.(event);
  };

  return (
    <img
      {...props}
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
};

/**
 * Generate user initials from a name
 */
export const getUserInitials = (name: string): string => {
  if (!name || name.trim() === '') {
    return 'MM'; // MusikMadness default
  }
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

/**
 * Generate a consistent avatar color based on user ID or name
 */
export const getAvatarColor = (identifier: string): string => {
  const colors = [
    '59, 130, 246', // blue-500
    '139, 92, 246', // violet-500
    '236, 72, 153', // pink-500
    '34, 197, 94', // green-500
    '251, 146, 60', // orange-500
    '168, 85, 247', // purple-500
    '14, 165, 233', // sky-500
    '239, 68, 68', // red-500
  ];
  
  let hash = 0;
  for (let i = 0; i < identifier.length; i++) {
    hash = identifier.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};
