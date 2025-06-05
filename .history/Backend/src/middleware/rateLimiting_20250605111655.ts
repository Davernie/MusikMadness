import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict rate limiting for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
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
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    error: 'Too many password reset attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down repeated requests (speed throttling)
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 2, // Allow 2 requests per windowMs without delay
  delayMs: 500, // Add 500ms delay per request after delayAfter
  maxDelayMs: 20000, // Maximum delay of 20 seconds
});

// Account creation rate limiting
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 account creations per hour
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
