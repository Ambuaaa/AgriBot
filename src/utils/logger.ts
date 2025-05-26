import winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from '../config/app.config';
const { combine, timestamp, printf, colorize, simple } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`;
});

// Create the logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: combine(
    timestamp(),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), simple())
    })
  ]
});

// Create a stream object with a write function that will be used by morgan
export const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  }
};

export default logger; 