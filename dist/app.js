"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const express_rate_limit_1 = require("express-rate-limit");
const app_config_1 = require("./config/app.config");
const error_middleware_1 = require("./middleware/error.middleware");
const jobs_1 = require("./jobs");
const logger_1 = __importStar(require("./utils/logger"));
const redis_1 = require("./config/redis");
const security_middleware_1 = require("./middleware/security.middleware");
const validation_middleware_1 = require("./middleware/validation.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const protected_routes_1 = __importDefault(require("./routes/protected.routes"));
// Initialize express app
const app = (0, express_1.default)();
exports.app = app;
const httpServer = (0, http_1.createServer)(app);
// Setup Socket.IO
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: app_config_1.config.corsOrigin,
        methods: ['GET', 'POST']
    }
});
exports.io = io;
// Middleware
app.use((0, cors_1.default)({
    origin: app_config_1.config.corsOrigin,
    credentials: true
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('combined', { stream: logger_1.stream }));
app.use((0, compression_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Security Middleware
app.use(security_middleware_1.securityHeaders);
app.use(security_middleware_1.corsConfig);
app.use(security_middleware_1.xssProtection);
app.use(security_middleware_1.csp);
// Request Sanitization
app.use(validation_middleware_1.sanitizeRequest);
// Rate limiting
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: app_config_1.config.rateLimitWindowMs,
    max: app_config_1.config.rateLimitMaxRequests
});
app.use(limiter);
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/protected', protected_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
// Initialize Redis
(0, redis_1.setupRedis)().catch(error => {
    logger_1.default.error('Redis initialization failed:', error);
    process.exit(1);
});
// Socket.IO connection handling
io.on('connection', (socket) => {
    logger_1.default.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
        logger_1.default.info(`Client disconnected: ${socket.id}`);
    });
});
// Start scheduled jobs
(0, jobs_1.setupJobs)();
// Start server
const PORT = app_config_1.config.port || 3000;
httpServer.listen(PORT, () => {
    logger_1.default.info(`Server is running on port ${PORT}`);
    logger_1.default.info(`Environment: ${app_config_1.config.nodeEnv}`);
});
// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger_1.default.error('Uncaught Exception:', error);
    process.exit(1);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger_1.default.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});
//# sourceMappingURL=app.js.map