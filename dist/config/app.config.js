"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({
    path: process.env.NODE_ENV === 'test'
        ? path_1.default.join(__dirname, '../../.env.test')
        : path_1.default.join(__dirname, '../../.env')
});
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
    database: {
        url: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/AgriBot',
        testUrl: process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/AgriBot_test'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        filename: process.env.LOG_FILE || 'app.log'
    },
    // Server
    nodeEnv: process.env.NODE_ENV || 'development',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    // Database (PostgreSQL)
    database: {
        host: process.env.POSTGRES_HOST || 'localhost',
        port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD,
        database: process.env.POSTGRES_DB || 'agribot',
    },
    // Redis
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    // Gemini AI
    geminiApiKey: process.env.GEMINI_API_KEY,
    // Speech-to-Text (Using Web Speech API)
    useBrowserSpeech: true,
    // Translation (Using LibreTranslate)
    translationEndpoint: 'https://translate.argosopentech.com', // Free public instance
    // Weather (Using Open-Meteo)
    weatherConfig: {
        baseUrl: 'https://api.open-meteo.com/v1',
        geoUrl: 'https://geocoding-api.open-meteo.com/v1/search',
    },
    // Notifications (Using Telegram)
    notificationConfig: {
        type: 'telegram',
        telegram: {
            botToken: process.env.TELEGRAM_BOT_TOKEN,
            channelId: process.env.TELEGRAM_CHANNEL_ID,
        }
    },
    // Market Data (Using data.gov.in)
    marketConfig: {
        baseUrl: 'https://api.data.gov.in/resource',
        apiKey: process.env.DATA_GOV_API_KEY,
        resourceIds: {
            marketPrices: process.env.DATA_GOV_MARKET_RESOURCE_ID,
            cropInfo: process.env.DATA_GOV_CROP_RESOURCE_ID
        }
    },
    // Rate Limiting
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
};
// Validate required environment variables
const requiredEnvVars = [
    'POSTGRES_PASSWORD',
    'JWT_SECRET',
    'GEMINI_API_KEY',
    'TELEGRAM_BOT_TOKEN',
    'DATA_GOV_API_KEY'
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
    }
}
//# sourceMappingURL=app.config.js.map