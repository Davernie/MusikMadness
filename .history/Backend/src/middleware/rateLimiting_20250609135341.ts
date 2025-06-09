import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

const NODE_ENV = process.env.NODE_ENV || 'development';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 1000 : 100000, // Temporarily disabled for load testing in production
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all requests
export const globalLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: NODE_ENV === 'development' ? 100 : 100000, // Temporarily disabled for load testing
  delayMs: () => 0, // new behavior
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 100 : 5, // Much higher limit in development
  message: {
    error: 'Too many authentication attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Slow down repeated requests (speed throttling)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: NODE_ENV === 'development' ? 1000 : 2, // Much higher threshold in development
  delayMs: () => 0, // new behavior
  maxDelayMs: NODE_ENV === 'development' ? 0 : 20000, // No delay in development
});

// Extra strict rate limiting for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: NODE_ENV === 'development' ? 50 : 3, // Much higher limit in development
  message: {
    error: 'Too many password reset attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account creation rate limiting
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: NODE_ENV === 'development' ? 100 : 3, // Much higher limit in development
  message: {
    error: 'Too many accounts created from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Specific limiter for sensitive actions like login and registration (using slowDown)
export const authDelayLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 5, // allow 5 attempts per 15 minutes, then...
  delayMs: () => 0, // new behavior
  message: "Too many login/registration attempts from this IP, please try again after 15 minutes",
});

// Specific limiter for song uploads
export const songUploadLimiter = slowDown({
  windowMs: 60 * 60 * 1000, // 1 hour
  delayAfter: 10, // allow 10 uploads per hour, then...
  delayMs: () => 0, // new behavior
  message: "Too many song uploads from this IP, please try again after an hour",
});

// Specific limiter for joining tournaments
export const joinTournamentLimiter = slowDown({
  windowMs: 60 * 60 * 1000, // 1 hour
  delayAfter: 20, // allow 20 joins per hour, then...
  delayMs: () => 0, // new behavior
  message: "Too many tournament join attempts from this IP, please try again after an hour",
});

// Specific limiter for voting
export const voteLimiter = slowDown({
  windowMs: 10 * 60 * 1000, // 10 minutes
  delayAfter: 50, // allow 50 votes per 10 minutes, then...
  delayMs: () => 0, // new behavior
  message: "Too many votes from this IP, please try again after 10 minutes",
});

// Limiter for creating tournaments
export const createTournamentLimiter = slowDown({
  windowMs: 60 * 60 * 1000, // 1 hour
  delayAfter: 5, // allow 5 tournament creations per hour
  delayMs: () => 0, // new behavior
  message: "Too many tournaments created from this IP, please try again after an hour.",
});

// Custom middleware to log suspicious activity
export const logSuspiciousActivity = (req: Request, res: Response, next: Function) => {
  const suspiciousPatterns = [
    /\.(php|asp|jsp|cgi)$/i,
    /wp-admin|wp-login|phpmyadmin/i,
    /\.\.|\/etc\/passwd|\/bin\/bash/i,
    /<script|javascript:|vbscript:|onload|onerror/i
  ];

  const path = req.path.toLowerCase();
  const userAgent = req.get('User-Agent') || '';
  const isSuspicious = suspiciousPatterns.some(pattern => 
    pattern.test(path) || pattern.test(userAgent)
  );

  if (isSuspicious) {
    console.log(`🚨 Suspicious request detected:`, {
      ip: req.ip,
      path: req.path,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }

  next();
};
