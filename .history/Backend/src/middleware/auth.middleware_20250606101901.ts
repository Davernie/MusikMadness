import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User'; // Import User model

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_here';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        isCreator?: boolean; // Add isCreator and other fields you might need
        // email?: string; // Example: if other middleware/routes need it
      };
    }
  }
}

export const auth = async (req: Request, res: Response, next: NextFunction) => { // Made async
  try {
    // Enhanced logging for debugging
    console.log('🔍 Auth middleware - Request URL:', req.url);
    console.log('🔍 Auth middleware - Authorization header:', req.header('Authorization') ? 'Present' : 'Missing');
    console.log('🔍 Auth middleware - Origin:', req.header('Origin'));
    
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('❌ Auth middleware - No token found');
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    
    // Fetch user from DB to get all details, including isCreator
    const userFromDb = await User.findById(decoded.userId).select('isCreator'); // Select only necessary fields

    if (!userFromDb) {
      return res.status(401).json({ message: 'User not found, token invalid' });
    }
    
    // Add user to request
    req.user = {
      userId: decoded.userId,
      isCreator: userFromDb.isCreator
      // you can add other fields from userFromDb if needed by other parts of your app
    };
    
    next();
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
}; 