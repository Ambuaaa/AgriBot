"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupJobs = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const logger_1 = require("../utils/logger");
const market_sync_job_1 = require("./market-sync.job");
const weather_sync_job_1 = require("./weather-sync.job");
const cleanup_job_1 = require("./cleanup.job");
const setupJobs = () => {
    // Sync market prices every hour
    node_cron_1.default.schedule('0 * * * *', async () => {
        try {
            logger_1.logger.info('Starting market price sync job');
            await (0, market_sync_job_1.syncMarketPrices)();
            logger_1.logger.info('Market price sync completed');
        }
        catch (error) {
            logger_1.logger.error('Market price sync failed:', error);
        }
    });
    // Sync weather data every 30 minutes
    node_cron_1.default.schedule('*/30 * * * *', async () => {
        try {
            logger_1.logger.info('Starting weather data sync job');
            await (0, weather_sync_job_1.syncWeatherData)();
            logger_1.logger.info('Weather data sync completed');
        }
        catch (error) {
            logger_1.logger.error('Weather data sync failed:', error);
        }
    });
    // Cleanup old data daily at midnight
    node_cron_1.default.schedule('0 0 * * *', async () => {
        try {
            logger_1.logger.info('Starting data cleanup job');
            await (0, cleanup_job_1.cleanupOldData)();
            logger_1.logger.info('Data cleanup completed');
        }
        catch (error) {
            logger_1.logger.error('Data cleanup failed:', error);
        }
    });
    logger_1.logger.info('Scheduled jobs initialized');
};
exports.setupJobs = setupJobs;
//# sourceMappingURL=index.js.map