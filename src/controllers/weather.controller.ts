import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/app.config';
import logger from '../utils/logger';
import { translateText } from '../services/translate.service';

interface GeocodingResponse {
  lat: number;
  lon: number;
  name: string;
}

interface WeatherForecast {
  list: Array<{
    weather: Array<{
      description: string;
    }>;
  }>;
}

const prisma = new PrismaClient();

export const weatherController = {
  // Get weather alerts for user's location
  async getWeatherAlerts(req: Request, res: Response) {
    try {
      const alerts = await prisma.weatherAlert.findMany({
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, alerts });
    } catch (error) {
      logger.error('Error fetching weather alerts:', error);
      res.status(500).json({ success: false, message: 'Error fetching weather alerts' });
    }
  },

  // Get weather forecast
  async getWeatherForecast(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user?.location) {
        return res.status(400).json({ message: 'User location not set' });
      }

      // Get coordinates for the location
      const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(user.location)}&limit=1&appid=${config.openWeatherApiKey}`;
      const geocodeResponse = await axios.get<GeocodingResponse[]>(geocodeUrl);
      
      if (!geocodeResponse.data?.[0]) {
        return res.status(400).json({ message: 'Location not found' });
      }

      const { lat, lon } = geocodeResponse.data[0];

      // Get weather forecast
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${config.openWeatherApiKey}&units=metric`;
      const forecastResponse = await axios.get<WeatherForecast>(forecastUrl);

      const forecast = forecastResponse.data;

      // Translate weather descriptions if needed
      if (user.language !== 'en') {
        for (let item of forecast.list) {
          item.weather[0].description = await translateText(
            item.weather[0].description,
            'en',
            user.language
          );
        }
      }

      res.json(forecast);
    } catch (error) {
      logger.error('Error in getWeatherForecast:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  },

  // Subscribe to weather alerts
  async subscribeToAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }

      const { location } = req.body;

      // Update user preferences
      await prisma.userPreferences.update({
        where: { userId },
        data: {
          weatherAlerts: true
        }
      });

      // Find existing subscription
      const existingSubscription = await prisma.subscription.findFirst({
        where: {
          userId,
          type: 'weather',
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
              location
            }
          }
        });
      } else {
        // Create new subscription
        subscription = await prisma.subscription.create({
          data: {
            userId,
            type: 'weather',
            status: 'active',
            metadata: {
              location
            }
          }
        });
      }

      res.json({ success: true, subscription });
    } catch (error) {
      logger.error('Error in subscribeToAlerts:', error);
      res.status(500).json({ success: false, message: 'Error subscribing to alerts' });
    }
  },

  // Unsubscribe from weather alerts
  async unsubscribeFromAlerts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Update user preferences
      await prisma.userPreferences.update({
        where: { userId },
        data: {
          weatherAlerts: false
        }
      });

      // Deactivate subscription
      await prisma.subscription.updateMany({
        where: {
          userId,
          type: 'weather'
        },
        data: {
          status: 'inactive'
        }
      });

      res.json({ success: true, message: 'Successfully unsubscribed from weather alerts' });
    } catch (error) {
      logger.error('Error in unsubscribeFromAlerts:', error);
      res.status(500).json({ success: false, message: 'Error unsubscribing from alerts' });
    }
  },

  // Update weather preferences
  async updateWeatherPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      await prisma.userPreferences.update({
        where: { userId },
        data: { weatherAlerts: req.body.weatherAlerts }
      });

      res.json({ success: true, message: 'Weather preferences updated' });
    } catch (error) {
      logger.error('Error updating weather preferences:', error);
      res.status(500).json({ success: false, message: 'Error updating preferences' });
    }
  },

  // Get weather preferences
  async getWeatherPreferences(req: Request, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      const preferences = await prisma.userPreferences.findUnique({
        where: { userId }
      });

      res.json({ success: true, preferences });
    } catch (error) {
      logger.error('Error fetching weather preferences:', error);
      res.status(500).json({ success: false, message: 'Error fetching preferences' });
    }
  }
}; 