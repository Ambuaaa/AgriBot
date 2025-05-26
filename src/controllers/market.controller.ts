import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/app.config';
import logger from '../utils/logger';
import { translateText } from '../services/translate.service';

const prisma = new PrismaClient();

export const marketController = {
  // Get market prices for specific crop
  async getCropPrices(req: Request, res: Response) {
    try {
      const { crop, market, state } = req.query;
      const userId = req.user?.userId;

      // Get user preferences for language
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { preferences: true }
      });

      const whereClause: any = {
        date: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      };

      if (crop) whereClause.crop = crop;
      if (market) whereClause.market = market;
      if (state) whereClause.state = state;

      const prices = await prisma.marketPrice.findMany({
        where: whereClause,
        orderBy: [
          { date: 'desc' },
          { market: 'asc' }
        ],
        take: 100
      });

      // Translate crop names and varieties if needed
      if (user?.language !== 'en') {
        for (let price of prices) {
          price.crop = await translateText(price.crop, 'en', user?.language || 'en');
          if (price.variety) {
            price.variety = await translateText(price.variety, 'en', user?.language || 'en');
          }
        }
      }

      res.json(prices);
    } catch (error) {
      logger.error('Error in getCropPrices:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get price trends for a crop
  async getPriceTrends(req: Request, res: Response) {
    try {
      const { crop, market, duration = '30' } = req.query;
      
      if (!crop) {
        return res.status(400).json({ message: 'Crop parameter is required' });
      }

      const durationDays = parseInt(duration as string);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - durationDays);

      const whereClause: any = {
        crop: crop,
        date: {
          gte: startDate
        }
      };

      if (market) whereClause.market = market;

      const prices = await prisma.marketPrice.findMany({
        where: whereClause,
        orderBy: {
          date: 'asc'
        },
        select: {
          date: true,
          price: true,
          market: true
        }
      });

      // Calculate trends
      const trends = {
        averagePrice: 0,
        minPrice: Infinity,
        maxPrice: -Infinity,
        priceChange: 0,
        priceChangePercentage: 0,
        dailyPrices: prices
      };

      if (prices.length > 0) {
        const sum = prices.reduce((acc, curr) => acc + curr.price, 0);
        trends.averagePrice = sum / prices.length;
        trends.minPrice = Math.min(...prices.map(p => p.price));
        trends.maxPrice = Math.max(...prices.map(p => p.price));
        
        const oldestPrice = prices[0].price;
        const latestPrice = prices[prices.length - 1].price;
        trends.priceChange = latestPrice - oldestPrice;
        trends.priceChangePercentage = (trends.priceChange / oldestPrice) * 100;
      }

      res.json(trends);
    } catch (error) {
      logger.error('Error in getPriceTrends:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Subscribe to price alerts
  async subscribeToPriceAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { crops, markets, threshold } = req.body;

      // Update user preferences
      await prisma.userPreferences.update({
        where: { userId },
        data: {
          priceAlerts: true,
          preferredCrops: crops,
          preferredMarkets: markets
        }
      });

      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          type: 'market',
          status: 'active'
        }
      });

      let subscription;
      if (existingSubscription) {
        // Update existing subscription
        subscription = await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            metadata: {
              crops,
              markets,
              threshold
            }
          }
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId,
            type: 'market',
            status: 'active',
            metadata: {
              crops,
              markets,
              threshold
            }
          }
        });
      }

      res.json({ success: true, subscription });
    } catch (error) {
      logger.error('Error in subscribeToPriceAlerts:', error);
      res.status(500).json({ success: false, message: 'Error subscribing to alerts' });
    }
  },

  // Unsubscribe from price alerts
  async unsubscribeFromPriceAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Update user preferences
      await prisma.userPreferences.update({
        where: { userId },
        data: {
          priceAlerts: false
        }
      });

      // Deactivate subscription
      await prisma.subscription.updateMany({
        where: {
          userId,
          type: 'market'
        },
        data: {
          status: 'inactive'
        }
      });

      res.json({ success: true, message: 'Successfully unsubscribed from price alerts' });
    } catch (error) {
      logger.error('Error in unsubscribeFromPriceAlerts:', error);
      res.status(500).json({ success: false, message: 'Error unsubscribing from alerts' });
    }
  }
}; 