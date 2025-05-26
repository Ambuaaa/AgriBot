import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';

export class JWTUtils {
  static generateToken(payload: any): string {
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn
    });
  }

  static verifyToken(token: string): any {
    return jwt.verify(token, config.jwtSecret);
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }
    return authHeader.split(' ')[1];
  }

  static refreshToken(oldToken: string): string | null {
    try {
      const decoded = this.verifyToken(oldToken);
      delete decoded.iat;
      delete decoded.exp;
      return this.generateToken(decoded);
    } catch (error) {
      return null;
    }
  }
} 