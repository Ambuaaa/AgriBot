import app from './app';
import { config } from './config/app.config';
import logger from './utils/logger';

const PORT = process.env.PORT || 4000;

const startServer = async () => {
  try {
    logger.info('Starting server...');
    logger.info(`Environment: ${config.env}`);
    logger.info(`Port: ${PORT}`);
    
    app.listen(PORT, () => {
      logger.info(`Server is running on port ${PORT}`);
      logger.info('Routes configured:');
      app._router.stack.forEach((r: any) => {
        if (r.route && r.route.path) {
          logger.info(`${Object.keys(r.route.methods)} ${r.route.path}`);
        }
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  process.exit(1);
}); 