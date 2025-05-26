"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateRegister = exports.sanitizeRequest = void 0;
const express_validator_1 = require("express-validator");
const sanitize_html_1 = __importDefault(require("sanitize-html"));
// Sanitize request body
const sanitizeRequest = (req, res, next) => {
    if (req.body) {
        for (let key in req.body) {
            if (typeof req.body[key] === 'string') {
                req.body[key] = (0, sanitize_html_1.default)(req.body[key], {
                    allowedTags: [],
                    allowedAttributes: {}
                });
            }
        }
    }
    next();
};
exports.sanitizeRequest = sanitizeRequest;
// Validate registration request
exports.validateRegister = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty()
        .withMessage('Name is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
// Validate login request
exports.validateLogin = [
    (0, express_validator_1.body)('email')
        .trim()
        .isEmail()
        .withMessage('Please enter a valid email address'),
    (0, express_validator_1.body)('password')
        .notEmpty()
        .withMessage('Password is required'),
    (req, res, next) => {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        next();
    }
];
//# sourceMappingURL=validation.middleware.js.map