import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { config } from '../config/app.config';
import logger from '../utils/logger';

interface GeocodingResponse {
  lat: number;
  lon: number;
  name: string;
}

interface WeatherResponse {
  main: {
    temp: number;
    humidity: number;
  };
}

const prisma = new PrismaClient();

export async function syncWeatherData(): Promise<void> {
  try {
    // Get all unique user locations
    const users = await prisma.user.findMany({
      where: {
        location: { not: null },
        preferences: { weatherAlerts: true }
      },
      select: { location: true }
    });

    const locations = [...new Set(users.map(u => u.location))];

    for (const location of locations) {
      // Get coordinates for location
      const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location!)}&limit=1&appid=${config.openWeatherApiKey}`;
      const geocodeResponse = await axios.get<GeocodingResponse[]>(geocodeUrl);
      
      if (!geocodeResponse.data?.[0]) continue;

      const { lat, lon } = geocodeResponse.data[0];

      // Get weather data
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${config.openWeatherApiKey}&units=metric`;
      const weatherResponse = await axios.get<WeatherResponse>(weatherUrl);

      // Create weather alert if severe conditions
      const weather = weatherResponse.data;
      if (weather.main.temp > 40 || weather.main.temp < 0 || weather.main.humidity > 90) {
        await prisma.weatherAlert.create({
          data: {
            location: location!,
            alertType: 'extreme',
            severity: 'high',
            message: `Extreme weather conditions: Temperature ${weather.main.temp}°C, Humidity ${weather.main.humidity}%`,
            startTime: new Date(),
            endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          }
        });
      }
    }

    logger.info('Weather sync completed successfully');
  } catch (error) {
    logger.error('Error in weather sync job:', error);
    throw error;
  }
} 