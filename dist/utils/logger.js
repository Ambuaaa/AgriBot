"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stream = void 0;
const winston_1 = __importDefault(require("winston"));
const app_config_1 = require("../config/app.config");
const logger = winston_1.default.createLogger({
    level: app_config_1.config.logging.level,
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        new winston_1.default.transports.File({
            filename: app_config_1.config.logging.filename,
            level: app_config_1.config.logging.level
        }),
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
// Create a stream object for Morgan
exports.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};
exports.default = logger;
//# sourceMappingURL=logger.js.map