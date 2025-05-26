import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const userController = {
  // Get user profile
  async getProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          preferences: true,
          subscriptions: true
        }
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      res.json(user);
    } catch (error) {
      logger.error('Error in getProfile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update user profile
  async updateProfile(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const { name, email, language, location } = req.body;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email,
          language,
          location
        },
        include: {
          preferences: true
        }
      });

      res.json(updatedUser);
    } catch (error) {
      logger.error('Error in updateProfile:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Update user preferences
  async updatePreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const {
        language,
        voiceEnabled,
        weatherAlerts,
        priceAlerts,
        cropReminders,
        preferredCrops,
        preferredMarkets
      } = req.body;

      const preferences = await prisma.userPreferences.upsert({
        where: { userId },
        update: {
          language,
          voiceEnabled,
          weatherAlerts,
          priceAlerts,
          cropReminders,
          preferredCrops,
          preferredMarkets
        },
        create: {
          userId: userId as string,
          language,
          voiceEnabled,
          weatherAlerts,
          priceAlerts,
          cropReminders,
          preferredCrops,
          preferredMarkets
        }
      });

      res.json(preferences);
    } catch (error) {
      logger.error('Error in updatePreferences:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Get user conversations
  async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      const conversations = await prisma.conversation.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1
          }
        },
        orderBy: { updatedAt: 'desc' }
      });

      res.json(conversations);
    } catch (error) {
      logger.error('Error in getConversations:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Delete user account
  async deleteAccount(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      await prisma.user.delete({
        where: { id: userId }
      });

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      logger.error('Error in deleteAccount:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}; 