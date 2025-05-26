import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export async function cleanupOldData(): Promise<void> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Cleanup old market prices
    await prisma.marketPrice.deleteMany({
      where: {
        date: {
          lt: thirtyDaysAgo
        }
      }
    });

    // Cleanup old weather alerts
    await prisma.weatherAlert.deleteMany({
      where: {
        endTime: {
          lt: thirtyDaysAgo
        }
      }
    });

    // Cleanup inactive conversations
    await prisma.conversation.deleteMany({
      where: {
        isActive: false,
        updatedAt: {
          lt: thirtyDaysAgo
        }
      }
    });

    logger.info('Cleanup completed successfully');
  } catch (error) {
    logger.error('Error in cleanup job:', error);
    throw error;
  }
} 