import cron from 'node-cron';
import logger from '../utils/logger';
import { syncMarketPrices } from './market-sync.job';
import { syncWeatherData } from './weather.job';
import { cleanupOldData } from './cleanup.sync.job';

export async function setupJobs(): Promise<void> {
  try {
    // Sync market prices every hour
    cron.schedule('0 * * * *', async () => {
      try {
        logger.info('Starting market price sync job');
        await syncMarketPrices();
        logger.info('Market price sync completed');
      } catch (error) {
        logger.error('Market price sync failed:', error);
      }
    });

    // Sync weather data every 30 minutes
    cron.schedule('*/30 * * * *', async () => {
      try {
        logger.info('Starting weather data sync job');
        await syncWeatherData();
        logger.info('Weather data sync completed');
      } catch (error) {
        logger.error('Weather data sync failed:', error);
      }
    });

    // Cleanup old data daily at midnight
    cron.schedule('0 0 * * *', async () => {
      try {
        logger.info('Starting data cleanup job');
        await cleanupOldData();
        logger.info('Data cleanup completed');
      } catch (error) {
        logger.error('Data cleanup failed:', error);
      }
    });

    logger.info('Background jobs initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize background jobs:', error);
    throw error; // Re-throw to be handled by the caller
  }
} 