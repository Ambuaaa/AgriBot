import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

interface AppConfig {
  env: string;
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  openWeatherApiKey: string;
  agmarknetApiUrl: string;
  agmarknetApiKey: string;
  geminiApiKey: string;
  emailConfig: {
    host: string;
    port: number;
    secure: boolean;
    from: string;
    password: string;
  };
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
}

export const config: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
  rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  openWeatherApiKey: process.env.OPEN_WEATHER_API_KEY || '',
  agmarknetApiUrl: process.env.AGMARKNET_API_URL || 'https://api.agmarknet.gov.in',
  agmarknetApiKey: process.env.AGMARKNET_API_KEY || '',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  emailConfig: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: process.env.EMAIL_SECURE === 'true',
    from: process.env.EMAIL_FROM || '',
    password: process.env.EMAIL_PASSWORD || ''
  },
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DATABASE || 'agribot'
  }
};

// Only validate critical environment variables in production
if (process.env.NODE_ENV === 'production') {
  const requiredEnvVars = [
    'JWT_SECRET',
    'POSTGRES_PASSWORD',
    'GEMINI_API_KEY',
    'EMAIL_PASSWORD'
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable in production: ${envVar}`);
    }
  }
} 