"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.marketController = void 0;
const client_1 = require("@prisma/client");
const logger_1 = require("../utils/logger");
const translate_service_1 = require("../services/translate.service");
const prisma = new client_1.PrismaClient();
exports.marketController = {
    // Get market prices for specific crop
    async getCropPrices(req, res) {
        try {
            const { crop, market, state } = req.query;
            const userId = req.user?.id;
            // Get user preferences for language
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { preferences: true }
            });
            const whereClause = {
                date: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            };
            if (crop)
                whereClause.crop = crop;
            if (market)
                whereClause.market = market;
            if (state)
                whereClause.state = state;
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
                    price.crop = await (0, translate_service_1.translateText)(price.crop, 'en', user.language);
                    if (price.variety) {
                        price.variety = await (0, translate_service_1.translateText)(price.variety, 'en', user.language);
                    }
                }
            }
            res.json(prices);
        }
        catch (error) {
            logger_1.logger.error('Error in getCropPrices:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Get price trends for a crop
    async getPriceTrends(req, res) {
        try {
            const { crop, market, duration = '30' } = req.query;
            if (!crop) {
                return res.status(400).json({ message: 'Crop parameter is required' });
            }
            const durationDays = parseInt(duration);
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - durationDays);
            const whereClause = {
                crop: crop,
                date: {
                    gte: startDate
                }
            };
            if (market)
                whereClause.market = market;
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
        }
        catch (error) {
            logger_1.logger.error('Error in getPriceTrends:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Subscribe to price alerts
    async subscribeToPriceAlerts(req, res) {
        try {
            const userId = req.user?.id;
            const { crops, markets, threshold } = req.body;
            // Update user preferences
            await prisma.userPreference.update({
                where: { userId },
                data: {
                    priceAlerts: true,
                    preferredCrops: crops,
                    preferredMarkets: markets
                }
            });
            // Create or update subscription
            const subscription = await prisma.subscription.upsert({
                where: {
                    id: `price_${userId}`
                },
                update: {
                    metadata: {
                        crops,
                        markets,
                        threshold
                    }
                },
                create: {
                    id: `price_${userId}`,
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
            res.json(subscription);
        }
        catch (error) {
            logger_1.logger.error('Error in subscribeToPriceAlerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    },
    // Unsubscribe from price alerts
    async unsubscribeFromPriceAlerts(req, res) {
        try {
            const userId = req.user?.id;
            // Update user preferences
            await prisma.userPreference.update({
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
            res.json({ message: 'Successfully unsubscribed from price alerts' });
        }
        catch (error) {
            logger_1.logger.error('Error in unsubscribeFromPriceAlerts:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
//# sourceMappingURL=market.controller.js.map