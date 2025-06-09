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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 100 : 10, // Increased from 5 to 10 - focuses on IP, not account
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

// SECURITY IMPROVEMENT: IP-based temporary lockout system
// After certain number of failed attempts, IP gets blocked from ALL login attempts
// with increasing lockout durations (1min → 5min → 15min → 1hour → 24hours)
const ipLockoutData = new Map<string, { 
  failedAttempts: number; 
  lockoutUntil: number;
  lockoutLevel: number; // 0=no lockout, 1=1min, 2=5min, 3=15min, 4=1hour, 5=24hour
  lastAttempt: number;
}>();

// Lockout durations in milliseconds
const LOCKOUT_DURATIONS = [
  0,                    // Level 0: No lockout
  1 * 60 * 1000,       // Level 1: 1 minute
  5 * 60 * 1000,       // Level 2: 5 minutes  
  15 * 60 * 1000,      // Level 3: 15 minutes
  60 * 60 * 1000,      // Level 4: 1 hour
  24 * 60 * 60 * 1000  // Level 5: 24 hours
];

const LOCKOUT_NAMES = [
  'No lockout',
  '1 minute',
  '5 minutes', 
  '15 minutes',
  '1 hour',
  '24 hours'
];

// Attempts required to trigger each lockout level
const ATTEMPTS_FOR_LOCKOUT = [
  0,  // Level 0: No lockout
  5,  // Level 1: 5 attempts = 1 minute lockout
  8,  // Level 2: 8 attempts = 5 minute lockout
  12, // Level 3: 12 attempts = 15 minute lockout
  18, // Level 4: 18 attempts = 1 hour lockout
  25  // Level 5: 25 attempts = 24 hour lockout
];

// Middleware to check if IP is currently locked out
export const checkIPLockout = (req: Request, res: Response, next: Function) => {
  const clientIP = req.ip || 'unknown';
  const now = Date.now();
  const ipData = ipLockoutData.get(clientIP);
  
  if (ipData && ipData.lockoutUntil > now) {
    const remainingMs = ipData.lockoutUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    const lockoutName = LOCKOUT_NAMES[ipData.lockoutLevel] || 'extended period';
    
    console.log(`🚫 IP ${clientIP} is locked out for ${remainingMinutes} more minutes (Level ${ipData.lockoutLevel})`);
    
    return res.status(429).json({
      message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`,
      lockoutLevel: ipData.lockoutLevel,
      remainingMinutes: remainingMinutes,
      lockedUntil: new Date(ipData.lockoutUntil).toISOString(),
      error: 'IP_TEMPORARILY_BLOCKED'
    });
  }
  
  next();
};

// Progressive delay that still applies even when not locked out (for lower attempt counts)
export const progressiveAuthDelay = async (req: Request, res: Response, next: Function) => {
  const clientIP = req.ip || 'unknown';
  const ipData = ipLockoutData.get(clientIP);
  
  // Apply small progressive delays for first few attempts (before lockout kicks in)
  if (ipData && ipData.failedAttempts > 0 && ipData.failedAttempts < 5) {
    const delaySeconds = Math.min(Math.pow(2, ipData.failedAttempts - 1), 8); // Max 8 seconds
    const delayMs = delaySeconds * 1000;
    
    console.log(`⏱️  Progressive delay: ${delaySeconds}s for IP ${clientIP} (${ipData.failedAttempts} failed attempts)`);
    
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  next();
};

export const trackAuthFailure = (clientIP: string) => {
  const now = Date.now();
  const current = ipLockoutData.get(clientIP) || { 
    failedAttempts: 0, 
    lockoutUntil: 0,
    lockoutLevel: 0,
    lastAttempt: 0
  };
  
  // If lockout has expired, reset the attempt count partially (gradual forgiveness)
  if (current.lockoutUntil > 0 && now > current.lockoutUntil) {
    current.failedAttempts = Math.max(0, Math.floor(current.failedAttempts / 2));
    current.lockoutUntil = 0;
    current.lockoutLevel = 0;
    console.log(`🔓 Lockout expired for IP ${clientIP}, attempts reduced to ${current.failedAttempts}`);
  }
  
  current.failedAttempts += 1;
  current.lastAttempt = now;
  
  // Determine new lockout level based on failed attempts
  let newLockoutLevel = 0;
  for (let i = ATTEMPTS_FOR_LOCKOUT.length - 1; i >= 1; i--) {
    if (current.failedAttempts >= ATTEMPTS_FOR_LOCKOUT[i]) {
      newLockoutLevel = i;
      break;
    }
  }
  
  // Apply lockout if level increased
  if (newLockoutLevel > current.lockoutLevel) {
    current.lockoutLevel = newLockoutLevel;
    current.lockoutUntil = now + LOCKOUT_DURATIONS[newLockoutLevel];
    
    const lockoutName = LOCKOUT_NAMES[newLockoutLevel];
    console.log(`🔒 IP ${clientIP} LOCKED OUT for ${lockoutName} after ${current.failedAttempts} failed attempts (Level ${newLockoutLevel})`);
  } else if (current.failedAttempts >= 3) {
    console.log(`⚠️  IP ${clientIP} has ${current.failedAttempts} failed attempts (approaching lockout)`);
  }
  
  ipLockoutData.set(clientIP, current);
};

export const resetAuthAttempts = (clientIP: string) => {
  const current = ipLockoutData.get(clientIP);
  if (current) {
    // On successful login, reduce attempts significantly but don't completely reset
    // This prevents immediate re-abuse while allowing gradual recovery
    current.failedAttempts = Math.max(0, current.failedAttempts - 3);
    current.lockoutLevel = 0;
    current.lockoutUntil = 0;
    current.lastAttempt = Date.now();
    
    if (current.failedAttempts === 0) {
      ipLockoutData.delete(clientIP);
      console.log(`✅ Auth attempts fully reset for IP ${clientIP}`);
    } else {
      ipLockoutData.set(clientIP, current);
      console.log(`✅ Auth attempts reduced for IP ${clientIP}: ${current.failedAttempts} remaining`);
    }
  }
};

// Cleanup old entries periodically (prevent memory leaks)
setInterval(() => {
  const now = Date.now();
  const sixHoursAgo = now - (6 * 60 * 60 * 1000);
  
  for (const [ip, data] of ipLockoutData.entries()) {
    // Clean up IPs that haven't had activity in 6 hours and aren't currently locked
    if (data.lastAttempt < sixHoursAgo && data.lockoutUntil < now) {
      ipLockoutData.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean every hour
