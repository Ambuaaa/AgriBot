import { config as baseConfig } from './app.config';

export const productionConfig = {
  ...baseConfig,
  // Override development settings for production
  corsOrigin: process.env.CORS_ORIGIN || 'https://agribot.yourdomain.com',
  
  // Enhanced security settings
  security: {
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100, // 100 requests per window
    maxBodySize: '10kb',
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      crossOriginEmbedderPolicy: true,
      crossOriginOpenerPolicy: true,
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: true,
      frameguard: { action: 'deny' },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
      },
      ieNoOpen: true,
      noSniff: true,
      referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
      xssFilter: true,
    }
  },

  // Redis configuration
  redis: {
    ...baseConfig.redis,
    tls: true,
    retryStrategy: (times: number) => Math.min(times * 50, 2000),
  },

  // Email configuration
  email: {
    ...baseConfig.emailConfig,
    secure: true,
  },

  // Logging configuration
  logging: {
    level: 'info',
    format: 'json',
    maxFiles: '30d',
    maxSize: '100m',
  },

  // Database configuration
  database: {
    ...baseConfig.database,
    ssl: true,
    pool: {
      min: 2,
      max: 10,
    },
  },
}; 