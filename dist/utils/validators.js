"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidators = exports.weatherValidation = exports.marketValidation = exports.chatValidation = exports.authValidation = void 0;
const joi_1 = __importDefault(require("joi"));
const express_validator_1 = require("express-validator");
exports.authValidation = {
    register: joi_1.default.object({
        phone: joi_1.default.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
            'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number'
        }),
        name: joi_1.default.string()
            .min(2)
            .max(50)
            .required(),
        email: joi_1.default.string()
            .email()
            .optional(),
        language: joi_1.default.string()
            .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml')
            .default('hi'),
        location: joi_1.default.string()
            .optional()
    }),
    login: joi_1.default.object({
        phone: joi_1.default.string()
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
            'string.pattern.base': 'Phone number must be a valid 10-digit Indian mobile number'
        })
    }),
    verify: joi_1.default.object({
        phone: joi_1.default.string()
            .pattern(/^[6-9]\d{9}$/)
            .required(),
        otp: joi_1.default.string()
            .pattern(/^\d{6}$/)
            .required()
            .messages({
            'string.pattern.base': 'OTP must be a 6-digit number'
        })
    }),
    updatePreferences: joi_1.default.object({
        language: joi_1.default.string()
            .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml'),
        voiceEnabled: joi_1.default.boolean(),
        weatherAlerts: joi_1.default.boolean(),
        priceAlerts: joi_1.default.boolean(),
        cropReminders: joi_1.default.boolean(),
        preferredCrops: joi_1.default.array()
            .items(joi_1.default.string()),
        preferredMarkets: joi_1.default.array()
            .items(joi_1.default.string())
    })
};
exports.chatValidation = {
    sendMessage: joi_1.default.object({
        content: joi_1.default.string()
            .required(),
        conversationId: joi_1.default.string()
            .optional(),
        messageType: joi_1.default.string()
            .valid('text', 'voice', 'image')
            .default('text'),
        language: joi_1.default.string()
            .valid('hi', 'en', 'bn', 'te', 'ta', 'mr', 'gu', 'kn', 'ml')
            .default('hi')
    })
};
exports.marketValidation = {
    getPrices: joi_1.default.object({
        crop: joi_1.default.string()
            .required(),
        market: joi_1.default.string()
            .optional(),
        state: joi_1.default.string()
            .optional(),
        fromDate: joi_1.default.date()
            .optional(),
        toDate: joi_1.default.date()
            .optional()
    }),
    setAlert: joi_1.default.object({
        crop: joi_1.default.string()
            .required(),
        market: joi_1.default.string()
            .required(),
        targetPrice: joi_1.default.number()
            .required(),
        condition: joi_1.default.string()
            .valid('above', 'below')
            .required()
    })
};
exports.weatherValidation = {
    getWeather: joi_1.default.object({
        location: joi_1.default.string()
            .required(),
        type: joi_1.default.string()
            .valid('current', 'forecast')
            .default('current')
    }),
    setAlert: joi_1.default.object({
        location: joi_1.default.string()
            .required(),
        alertType: joi_1.default.string()
            .valid('rain', 'temperature', 'humidity')
            .required(),
        threshold: joi_1.default.number()
            .required()
    })
};
exports.authValidators = {
    register: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email'),
        (0, express_validator_1.body)('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
        (0, express_validator_1.body)('name')
            .trim()
            .isLength({ min: 2 })
            .withMessage('Name must be at least 2 characters long')
    ],
    login: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email'),
        (0, express_validator_1.body)('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    forgotPassword: [
        (0, express_validator_1.body)('email')
            .isEmail()
            .normalizeEmail()
            .withMessage('Please enter a valid email')
    ],
    resetPassword: [
        (0, express_validator_1.body)('token')
            .notEmpty()
            .withMessage('Reset token is required'),
        (0, express_validator_1.body)('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    ],
    changePassword: [
        (0, express_validator_1.body)('currentPassword')
            .notEmpty()
            .withMessage('Current password is required'),
        (0, express_validator_1.body)('newPassword')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters long')
            .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/)
            .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
            .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        })
    ]
};
//# sourceMappingURL=validators.js.map