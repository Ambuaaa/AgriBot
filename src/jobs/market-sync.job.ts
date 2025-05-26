import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/app.config';
import logger from '../utils/logger';

const prisma = new PrismaClient();

interface MarketPriceData {
  crop: string;
  variety: string;
  market: string;
  state: string;
  district: string;
  price: number;
  unit: string;
  date: Date;
}

export const syncMarketPrices = async (): Promise<void> => {
  try {
    // Fetch data from Agmarknet API
    const response = await axios.get(`${config.agmarknetApiUrl}/prices`, {
      headers: {
        'Authorization': `Bearer ${config.agmarknetApiKey}`
      }
    });

    const prices: MarketPriceData[] = response.data as MarketPriceData[];

    // Batch process the prices
    const batchSize = 100;
    for (let i = 0; i < prices.length; i += batchSize) {
      const batch = prices.slice(i, i + batchSize);

      // Update database
      await prisma.marketPrice.createMany({
        data: batch.map(price => ({
          crop: price.crop,
          variety: price.variety,
          market: price.market,
          state: price.state,
          district: price.district,
          price: price.price,
          unit: price.unit,
          date: price.date
        })),
        skipDuplicates: true
      });
    }

    // Check for significant price changes and notify users
    await notifyPriceChanges(prices);

    logger.info(`Successfully synced ${prices.length} market prices`);
  } catch (error) {
    logger.error('Error syncing market prices:', error);
    throw error;
  }
};

async function notifyPriceChanges(prices: MarketPriceData[]): Promise<void> {
  try {
    // Get all price alert subscriptions
    const subscriptions = await prisma.subscription.findMany({
      where: {
        type: 'market',
        status: 'active'
      },
      include: {
        user: {
          include: {
            preferences: true
          }
        }
      }
    });

    // Process each subscription
    for (const subscription of subscriptions) {
      const metadata = subscription.metadata as { crop: string; market: string; targetPrice: number; condition: 'above' | 'below' };
      
      // Find matching price update
      const priceUpdate = prices.find(p => 
        p.crop === metadata.crop && 
        p.market === metadata.market
      );

      if (priceUpdate) {
        const shouldNotify = 
          (metadata.condition === 'above' && priceUpdate.price >= metadata.targetPrice) ||
          (metadata.condition === 'below' && priceUpdate.price <= metadata.targetPrice);

        if (shouldNotify) {
          // TODO: Implement notification service integration
          logger.info(`Price alert triggered for user ${subscription.user.phone}: ${priceUpdate.crop} in ${priceUpdate.market} is ${priceUpdate.price}/${priceUpdate.unit}`);
        }
      }
    }
  } catch (error) {
    logger.error('Error processing price notifications:', error);
  }
} 