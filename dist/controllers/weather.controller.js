"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.weatherController = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const app_config_1 = require("../config/app.config");
const logger_1 = require("../utils/logger");
const translate_service_1 = require("../services/translate.service");
const prisma = new client_1.PrismaClient();
exports.weatherController = {
    // Get weather alerts for user's location
    async getWeatherAlerts(req, res) {
        try {
            const userId = req.user?.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true }
            });
            if (!user?.location) {
                return res.status(400).json({ message: 'User location not set' });
            }
            const alerts = await prisma.weatherAlert.findMany({
                where: {
                    location: user.location,
                    endTime: {
                        gte: new Date()
                    }
                },
                orderBy: {
                    startTime: 'asc'
                }
            });
            // Translate alerts if needed
            if (user.language !== 'en') {
                for (let alert of alerts) {
                    alert.message = await (0, translate_service_1.translateText)(alert.message, 'en', user.language);
                }
            }
            res.json(alerts);
        }
        catch (error) {
            logger_1.logger.error('Error in getWeatherAlerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Get weather forecast
    async getWeatherForecast(req, res) {
        try {
            const userId = req.user?.id;
            const user = await prisma.user.findUnique({
                where: { id: userId }
            });
            if (!user?.location) {
                return res.status(400).json({ message: 'User location not set' });
            }
            // Get coordinates for the location
            const geocodeUrl = `http://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(user.location)}&limit=1&appid=${app_config_1.config.openWeatherApiKey}`;
            const geocodeResponse = await axios_1.default.get(geocodeUrl);
            if (!geocodeResponse.data?.[0]) {
                return res.status(400).json({ message: 'Location not found' });
            }
            const { lat, lon } = geocodeResponse.data[0];
            // Get weather forecast
            const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${app_config_1.config.openWeatherApiKey}&units=metric`;
            const forecastResponse = await axios_1.default.get(forecastUrl);
            const forecast = forecastResponse.data;
            // Translate weather descriptions if needed
            if (user.language !== 'en') {
                for (let item of forecast.list) {
                    item.weather[0].description = await (0, translate_service_1.translateText)(item.weather[0].description, 'en', user.language);
                }
            }
            res.json(forecast);
        }
        catch (error) {
            logger_1.logger.error('Error in getWeatherForecast:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Subscribe to weather alerts
    async subscribeToAlerts(req, res) {
        try {
            const userId = req.user?.id;
            const { location } = req.body;
            // Update user preferences
            await prisma.userPreference.update({
                where: { userId },
                data: {
                    weatherAlerts: true
                }
            });
            // Create or update subscription
            const subscription = await prisma.subscription.upsert({
                where: {
                    id: `weather_${userId}`
                },
                update: {
                    metadata: {
                        location
                    }
                },
                create: {
                    id: `weather_${userId}`,
                    userId,
                    type: 'weather',
                    status: 'active',
                    metadata: {
                        location
                    }
                }
            });
            res.json(subscription);
        }
        catch (error) {
            logger_1.logger.error('Error in subscribeToAlerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Unsubscribe from weather alerts
    async unsubscribeFromAlerts(req, res) {
        try {
            const userId = req.user?.id;
            // Update user preferences
            await prisma.userPreference.update({
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
            res.json({ message: 'Successfully unsubscribed from weather alerts' });
        }
        catch (error) {
            logger_1.logger.error('Error in unsubscribeFromAlerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
//# sourceMappingURL=weather.controller.js.map