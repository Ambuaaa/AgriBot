import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config/app.config';
import logger from '../utils/logger';
import { AppError } from './error.middleware';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role?: string;
      }
    }
  }
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'Not authorized to access this route');
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    next(new AppError(401, 'Not authorized to access this route'));
  }
};

export class AuthMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      req.user = { userId: decoded.userId };
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  static requireRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !req.user.role) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Insufficient permissions' });
      }

      next();
    };
  }

  static refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.headers.authorization?.split(' ')[1];
      if (!refreshToken) {
        return res.status(401).json({ message: 'Refresh token required' });
      }

      const decoded = jwt.verify(refreshToken, config.jwtSecret) as { userId: string };
      const signOptions: SignOptions = { expiresIn: parseInt(config.jwtExpiresIn) || '24h' };
      const newToken = jwt.sign({ userId: decoded.userId }, config.jwtSecret, signOptions);

      res.json({ token: newToken });
    } catch (error) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  }
} 