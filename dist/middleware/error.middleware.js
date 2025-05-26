"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.AppError = void 0;
const logger_1 = require("../utils/logger");
class AppError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
const errorHandler = (err, req, res, next) => {
    const statusCode = err instanceof AppError ? err.statusCode : 500;
    const isOperational = err instanceof AppError ? err.isOperational : false;
    // Log error
    if (!isOperational) {
        logger_1.logger.error('Unhandled Error:', {
            error: err,
            stack: err.stack,
            path: req.path,
            method: req.method,
            body: req.body,
            query: req.query,
            params: req.params,
        });
    }
    const response = {
        status: statusCode >= 500 ? 'error' : 'fail',
        message: isOperational ? err.message : 'Internal server error'
    };
    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
        response.stack = err.stack;
    }
    res.status(statusCode).json(response);
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=error.middleware.js.map