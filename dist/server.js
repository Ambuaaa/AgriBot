"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const app_config_1 = require("./config/app.config");
const logger_1 = __importDefault(require("./utils/logger"));
const server = app_1.app.listen(app_config_1.config.port, () => {
    logger_1.default.info(`Server is running on port ${app_config_1.config.port} in ${app_config_1.config.env} mode`);
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger_1.default.error('UNHANDLED REJECTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});
// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger_1.default.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    logger_1.default.error(err.name, err.message);
    process.exit(1);
});
//# sourceMappingURL=server.js.map