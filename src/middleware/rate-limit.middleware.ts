import rateLimit from 'express-rate-limit';
import { config } from '../config/app.config';

export const authLimiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: 'Too many requests from this IP, please try again later'
});

// More strict limiter for sensitive routes
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: {
    success: false,
    message: 'Too many attempts, please try again after an hour.'
  }
}); 