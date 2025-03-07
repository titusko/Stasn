
import { Request, Response, NextFunction } from 'express';
import { expressjwt } from 'express-jwt';
import { config } from '@/config';

// Add user to request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        isAdmin: boolean;
        [key: string]: any;
      };
    }
  }
}

// JWT authentication middleware
export const authenticateUser = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
});

// Admin check middleware
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};
