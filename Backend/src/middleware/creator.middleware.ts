import { Request, Response, NextFunction } from 'express';

export interface AuthenticatedRequest extends Request {
  user?: { // Assuming your auth middleware adds 'user' to the request
    userId: string;
    isCreator?: boolean;
    // include other user properties that your auth middleware might add
  };
}

export const isCreator = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isCreator) {
    return res.status(403).json({ message: 'Access denied. Creator privileges required.' });
  }
  next();
}; 