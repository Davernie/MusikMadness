import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

const NODE_ENV = process.env.NODE_ENV || 'development';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 1000 : 100, // Much higher limit in development
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
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

// Slow down repeated requests (speed throttling)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: NODE_ENV === 'development' ? 1000 : 2, // Much higher threshold in development
  delayMs: NODE_ENV === 'development' ? 0 : 500, // No delay in development
  maxDelayMs: NODE_ENV === 'development' ? 0 : 20000, // No delay in development
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
