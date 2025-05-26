import { Express } from 'express';
import userRoutes from './user.routes';
import chatRoutes from './chat.routes';
import weatherRoutes from './weather.routes';
import marketRoutes from './market.routes';
import authRoutes from './auth.routes';
import cropRoutes from './crop.routes';

export const setupRoutes = (app: Express): void => {
  // API version prefix
  const apiPrefix = '/api/v1';

  // Public routes (no authentication required)
  app.use(`${apiPrefix}/auth`, authRoutes);

  // Protected routes (require authentication)
  app.use(`${apiPrefix}/users`, userRoutes);
  app.use(`${apiPrefix}/chat`, chatRoutes);
  app.use(`${apiPrefix}/weather`, weatherRoutes);
  app.use(`${apiPrefix}/market`, marketRoutes);
  app.use(`${apiPrefix}/crop`, cropRoutes);
}; 