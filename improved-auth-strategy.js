// IMPROVED AUTHENTICATION SECURITY STRATEGY
// Fixes Account Enumeration + DoS vulnerability

// 1. IP-Based Rate Limiting (Primary Defense)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per IP (not per account!)
  skipSuccessfulRequests: true,
  message: {
    error: 'Too many authentication attempts from this IP. Please try again later.'
  }
});

// 2. Progressive Delay Middleware
const attemptCounts = new Map(); // In production, use Redis

export const progressiveDelay = (req, res, next) => {
  const clientIP = req.ip;
  const attempts = attemptCounts.get(clientIP) || 0;
  
  if (attempts > 0) {
    // Progressive delay: 1s, 2s, 4s, 8s, 16s (max 32s)
    const delayMs = Math.min(Math.pow(2, attempts - 1) * 1000, 32000);
    console.log(`⏱️  Delaying request from ${clientIP} by ${delayMs}ms (attempt ${attempts})`);
    
    setTimeout(() => next(), delayMs);
  } else {
    next();
  }
};

// 3. Improved Login Controller (Prevents Enumeration)
export const login = async (req, res) => {
  const { email, password } = req.body;
  const clientIP = req.ip;
  
  try {
    const user = await User.findOne({ email });
    
    // CRITICAL: Always check password even if user doesn't exist
    // This prevents timing attacks and account enumeration
    let isValidLogin = false;
    
    if (user) {
      isValidLogin = await user.comparePassword(password);
      
      if (isValidLogin && user.isEmailVerified) {
        // SUCCESS: Reset attempt counter and log in
        attemptCounts.delete(clientIP);
        
        // Log successful login
        console.log(`✅ Successful login: ${email} from ${clientIP}`);
        
        // Generate token and return success
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
        
        return res.json({
          message: 'Login successful',
          token,
          user: { /* user data */ }
        });
      }
    } else {
      // Still hash a password to prevent timing attacks
      await bcrypt.compare(password, '$2b$10$dummy.hash.to.prevent.timing.attacks');
    }
    
    // FAILURE: Increment attempt counter for this IP
    const currentAttempts = attemptCounts.get(clientIP) || 0;
    attemptCounts.set(clientIP, currentAttempts + 1);
    
    // IMPORTANT: Always return the same error message
    // Never reveal whether email exists or password is wrong
    return res.status(400).json({ 
      message: 'Invalid credentials' 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// 4. User Notification System (Optional but recommended)
const notifyUserOfSuspiciousActivity = async (email, clientIP) => {
  // Send email to user about failed login attempts
  // This helps users know if someone is trying to access their account
  console.log(`📧 Notifying ${email} of suspicious activity from ${clientIP}`);
  
  // Email content: "Someone tried to log into your account from IP X.X.X.X"
  // Include: "If this was you, ignore this message. If not, consider changing your password."
};

// 5. Cleanup old attempt counters (prevent memory leaks)
setInterval(() => {
  // In production, use Redis with TTL instead
  attemptCounts.clear();
}, 15 * 60 * 1000); // Clear every 15 minutes
