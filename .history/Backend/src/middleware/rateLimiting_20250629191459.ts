import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import { Request, Response } from 'express';

const NODE_ENV = process.env.NODE_ENV || 'development';

// General API rate limiting
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 1000 : 100, // Limit for production
  message: {
    error: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply to all requests
export const globalLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: NODE_ENV === 'development' ? 100 : 100, // Production threshold
  delayMs: () => 0, // new behavior
  message: "Too many requests from this IP, please try again after 15 minutes",
});

// IMPROVED: IP-based rate limiting for authentication (prevents DoS attacks)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour (stricter window)
  max: NODE_ENV === 'development' ? 100 : 3, // Reduced from 10 to 3 - prevents email spam
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
  delayAfter: NODE_ENV === 'development' ? 1000 : 2, // Production speed limit
  delayMs: () => 0, // new behavior
  maxDelayMs: NODE_ENV === 'development' ? 0 : 20000, // Production delay
});

// Extra strict rate limiting for password reset
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: NODE_ENV === 'development' ? 50 : 3, // Strict password reset limit
  message: {
    error: 'Too many password reset attempts from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Account creation rate limiting
export const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: NODE_ENV === 'development' ? 100 : 3, // Strict signup limit
  message: {
    error: 'Too many accounts created from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Extra strict rate limiting for email verification (prevents email spam)
export const emailVerificationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: NODE_ENV === 'development' ? 50 : 2, // Only 2 verification emails per IP per hour
  message: {
    error: 'Too many email verification requests from this IP. Please try again later.'
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

// OPTIMIZED: Custom middleware to log suspicious activity (development only)
export const logSuspiciousActivity = (req: Request, res: Response, next: Function) => {
  // Only run in development to reduce production overhead
  if (NODE_ENV === 'development') {
    const path = req.path.toLowerCase();
    const userAgent = req.get('User-Agent') || '';
    
    // Use simple string checks instead of regex for better performance
    const isSuspicious = 
      path.includes('.php') || path.includes('.asp') || path.includes('.jsp') ||
      path.includes('wp-admin') || path.includes('wp-login') || path.includes('phpmyadmin') ||
      path.includes('..') || path.includes('/etc/passwd') || path.includes('/bin/bash') ||
      userAgent.includes('<script') || userAgent.includes('javascript:') || userAgent.includes('vbscript:');

    if (isSuspicious) {
      console.log(`🚨 Suspicious request detected:`, {
        ip: req.ip,
        path: req.path,
        userAgent,
        timestamp: new Date().toISOString()
      });
    }
  }

  next();
};

// OPTIMIZED IP-based Lockout System with Memory Leak Prevention
// Caps Map size and implements efficient cleanup

const MAX_IP_ENTRIES = 10000; // Cap to prevent memory leaks
const ipLockouts = new Map<string, { 
  failedAttempts: number; 
  lockedUntil: number;
  lockoutCount: number;
  lastAttempt: number;
}>();

// OPTIMIZED: Simple middleware to check if IP is currently locked out
export const checkIPLockout = (req: Request, res: Response, next: Function) => {
  const clientIP = req.ip || 'unknown';
  const now = Date.now();
  const lockout = ipLockouts.get(clientIP);
  
  if (lockout && lockout.lockedUntil > now) {
    const remainingMs = lockout.lockedUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    
    // Reduced logging for performance
    if (NODE_ENV === 'development') {
      console.log(`🚫 IP ${clientIP} is locked out for ${remainingMinutes} more minutes`);
    }
    
    return res.status(429).json({
      message: 'Too many failed login attempts. Please try again later.',
      remainingMinutes: remainingMinutes,
      lockedUntil: new Date(lockout.lockedUntil).toISOString()
    });
  }
  
  next();
};

// OPTIMIZED: Memory-efficient cleanup function
const cleanupOldEntries = () => {
  const now = Date.now();
  const sixHoursAgo = now - (6 * 60 * 60 * 1000);
  let removedCount = 0;
  
  for (const [ip, data] of ipLockouts.entries()) {
    // Remove IPs that haven't had activity in 6 hours and aren't currently locked
    if (data.lastAttempt < sixHoursAgo && data.lockedUntil < now) {
      ipLockouts.delete(ip);
      removedCount++;
    }
  }
  
  // If Map is still too large, remove oldest entries by lastAttempt
  if (ipLockouts.size >= MAX_IP_ENTRIES) {
    const entries = Array.from(ipLockouts.entries());
    entries.sort((a, b) => a[1].lastAttempt - b[1].lastAttempt);
    
    const toRemove = Math.min(1000, ipLockouts.size - MAX_IP_ENTRIES + 1000);
    for (let i = 0; i < toRemove; i++) {
      ipLockouts.delete(entries[i][0]);
      removedCount++;
    }
  }
  
  if (NODE_ENV === 'development' && removedCount > 0) {
    console.log(`🧹 Cleaned up ${removedCount} old IP lockout entries. Map size: ${ipLockouts.size}`);
  }
};

// OPTIMIZED: Track authentication failures with memory management
export const trackAuthFailure = (clientIP: string) => {
  const now = Date.now();
  
  // Memory leak prevention: If Map is too large, clean up old entries first
  if (ipLockouts.size >= MAX_IP_ENTRIES) {
    cleanupOldEntries();
  }
  
  // Get or create lockout record
  const lockout = ipLockouts.get(clientIP) || { 
    failedAttempts: 0,
    lockedUntil: 0,
    lockoutCount: 0,
    lastAttempt: 0
  };
  
  // Reset failure count if it's been more than 15 minutes since last failure
  if (now - lockout.lastAttempt > 15 * 60 * 1000) {
    lockout.failedAttempts = 0;
  }
  
  lockout.failedAttempts++;
  lockout.lastAttempt = now;
  
  // Reduced logging for performance
  if (NODE_ENV === 'development') {
    console.log(`📊 IP ${clientIP} failure count: ${lockout.failedAttempts}`);
  }
  
  // Lock IP after 5 failed attempts (allow 5 free attempts, then lockout)
  if (lockout.failedAttempts >= 5) {
    lockout.lockoutCount++;
    
    // Progressive lockout durations: 1min, 5min, 15min, 30min, 1hour, 2hours
    const lockoutMinutes = [1, 5, 15, 30, 60, 120][Math.min(lockout.lockoutCount - 1, 5)];
    lockout.lockedUntil = now + (lockoutMinutes * 60 * 1000);
    
    // Reduced logging for performance
    if (NODE_ENV === 'development') {
      console.log(`🔒 IP ${clientIP} locked out for ${lockoutMinutes} minutes (lockout #${lockout.lockoutCount})`);
    }
    
    // Reset failure count since we're now in lockout mode
    lockout.failedAttempts = 0;
  }
  
  ipLockouts.set(clientIP, lockout);
};

// OPTIMIZED: Reset attempts on successful login with reduced logging
export const resetAuthAttempts = (clientIP: string) => {
  const lockout = ipLockouts.get(clientIP);
  if (lockout) {
    lockout.failedAttempts = 0;
    lockout.lockedUntil = 0;
    lockout.lastAttempt = Date.now();
    
    // Keep lockout count for escalation tracking but reset active lockout
    ipLockouts.set(clientIP, lockout);
    
    if (NODE_ENV === 'development') {
      console.log(`✅ Auth attempts reset for IP ${clientIP}`);
    }
  }
};

// OPTIMIZED: Cleanup old entries periodically with better memory management
setInterval(() => {
  cleanupOldEntries();
}, 30 * 60 * 1000); // Clean every 30 minutes (more frequent)
