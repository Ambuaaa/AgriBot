"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncMarketPrices = void 0;
const client_1 = require("@prisma/client");
const axios_1 = __importDefault(require("axios"));
const app_config_1 = require("../config/app.config");
const logger_1 = require("../utils/logger");
const redis_1 = require("../config/redis");
const prisma = new client_1.PrismaClient();
const redis = (0, redis_1.getRedisClient)();
const syncMarketPrices = async () => {
    try {
        // Fetch data from Agmarknet API
        const response = await axios_1.default.get(`${app_config_1.config.agmarknetApiUrl}/prices`, {
            headers: {
                'Authorization': `Bearer ${app_config_1.config.agmarknetApiKey}`
            }
        });
        const prices = response.data;
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
            // Update cache
            await Promise.all(batch.map(async (price) => {
                const cacheKey = `market:${price.crop}:${price.market}:${price.date.toISOString().split('T')[0]}`;
                await redis.set(cacheKey, JSON.stringify(price), 'EX', 3600); // Cache for 1 hour
            }));
        }
        // Check for significant price changes and notify users
        await notifyPriceChanges(prices);
        logger_1.logger.info(`Successfully synced ${prices.length} market prices`);
    }
    catch (error) {
        logger_1.logger.error('Error syncing market prices:', error);
        throw error;
    }
};
exports.syncMarketPrices = syncMarketPrices;
async function notifyPriceChanges(prices) {
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
            const metadata = subscription.metadata;
            // Find matching price update
            const priceUpdate = prices.find(p => p.crop === metadata.crop &&
                p.market === metadata.market);
            if (priceUpdate) {
                const shouldNotify = (metadata.condition === 'above' && priceUpdate.price >= metadata.targetPrice) ||
                    (metadata.condition === 'below' && priceUpdate.price <= metadata.targetPrice);
                if (shouldNotify) {
                    // TODO: Implement notification service integration
                    logger_1.logger.info(`Price alert triggered for user ${subscription.user.phone}: ${priceUpdate.crop} in ${priceUpdate.market} is ${priceUpdate.price}/${priceUpdate.unit}`);
                }
            }
        }
    }
    catch (error) {
        logger_1.logger.error('Error processing price notifications:', error);
    }
}
//# sourceMappingURL=market-sync.job.js.map