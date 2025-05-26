import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/app.config';
import logger, { stream } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { setupRoutes } from './routes';
import { setupJobs } from './jobs';

import authRouter from './routes/auth.routes';
import userRouter from './routes/user.routes';

// Initialize express app
const app = express();

// Basic middleware
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security middleware
app.use(helmet());
app.use(morgan('combined', { stream }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.rateLimitWindowMs,
  max: config.rateLimitMaxRequests,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint (no rate limiting)
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: config.env
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Setup routes
setupRoutes(app);

// Initialize background jobs
setupJobs().catch(error => {
  logger.error('Failed to initialize background jobs:', error);
});

// Error handling middleware
app.use(errorHandler);

// 404 Handler - must be after all routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Export app for testing
export default app; 