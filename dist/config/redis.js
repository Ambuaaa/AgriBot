"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRedisClient = exports.setupRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const app_config_1 = require("./app.config");
const logger_1 = require("../utils/logger");
let redisClient = null;
const setupRedis = async () => {
    try {
        redisClient = new ioredis_1.default(app_config_1.config.redisUrl);
        redisClient.on('connect', () => {
            logger_1.logger.info('Redis client connected');
        });
        redisClient.on('error', (error) => {
            logger_1.logger.error('Redis client error:', error);
        });
    }
    catch (error) {
        logger_1.logger.error('Redis setup error:', error);
        throw error;
    }
};
exports.setupRedis = setupRedis;
const getRedisClient = () => {
    if (!redisClient) {
        throw new Error('Redis client not initialized');
    }
    return redisClient;
};
exports.getRedisClient = getRedisClient;
//# sourceMappingURL=redis.js.map