"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_config_1 = require("../config/app.config");
const error_middleware_1 = require("../middleware/error.middleware");
const logger_1 = require("../utils/logger");
const prisma = new client_1.PrismaClient();
class AuthController {
    // Register new user
    async register(req, res, next) {
        try {
            const { email, password, name } = req.body;
            // Check if user exists
            const existingUser = await prisma.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                throw new error_middleware_1.AppError(400, 'User already exists');
            }
            // Hash password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create user
            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name
                }
            });
            // Generate token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, app_config_1.config.jwtSecret, { expiresIn: app_config_1.config.jwtExpiresIn });
            res.status(201).json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error in register:', error);
            res.status(500).json({
                success: false,
                message: 'Error creating user'
            });
        }
    }
    // Login user
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            // Check if user exists
            const user = await prisma.user.findUnique({
                where: { email }
            });
            if (!user) {
                throw new error_middleware_1.AppError(400, 'Invalid credentials');
            }
            // Check password
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (!isMatch) {
                throw new error_middleware_1.AppError(400, 'Invalid credentials');
            }
            // Generate token
            const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email, role: user.role }, app_config_1.config.jwtSecret, { expiresIn: app_config_1.config.jwtExpiresIn });
            res.json({
                success: true,
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            });
        }
        catch (error) {
            logger_1.logger.error('Error in login:', error);
            res.status(500).json({
                success: false,
                message: 'Error logging in'
            });
        }
    }
    // Verify OTP and generate token
    async verify(req, res, next) {
        try {
            const { phone, otp } = req.body;
            // Verify OTP (implement actual OTP verification)
            // For now, just check if it's 123456
            if (otp !== '123456') {
                throw new error_middleware_1.AppError(400, 'Invalid OTP');
            }
            const user = await prisma.user.findUnique({
                where: { phone },
                include: {
                    preferences: true
                }
            });
            if (!user) {
                throw new error_middleware_1.AppError(404, 'User not found');
            }
            // Mark user as verified
            await prisma.user.update({
                where: { id: user.id },
                data: { isVerified: true }
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({ id: user.id }, app_config_1.config.jwtSecret, { expiresIn: app_config_1.config.jwtExpiresIn });
            res.status(200).json({
                status: 'success',
                data: {
                    token,
                    user: {
                        id: user.id,
                        phone: user.phone,
                        name: user.name,
                        email: user.email,
                        language: user.language,
                        location: user.location,
                        preferences: user.preferences
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Get current user
    async getCurrentUser(req, res, next) {
        try {
            // User ID will be set by auth middleware
            const userId = req.user.id;
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: {
                    preferences: true
                }
            });
            if (!user) {
                throw new error_middleware_1.AppError(404, 'User not found');
            }
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: user.id,
                        phone: user.phone,
                        name: user.name,
                        email: user.email,
                        language: user.language,
                        location: user.location,
                        preferences: user.preferences
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
    // Update user preferences
    async updatePreferences(req, res, next) {
        try {
            const userId = req.user.id;
            const { language, voiceEnabled, weatherAlerts, priceAlerts, cropReminders, preferredCrops, preferredMarkets } = req.body;
            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: {
                    language,
                    preferences: {
                        update: {
                            language,
                            voiceEnabled,
                            weatherAlerts,
                            priceAlerts,
                            cropReminders,
                            preferredCrops,
                            preferredMarkets
                        }
                    }
                },
                include: {
                    preferences: true
                }
            });
            res.status(200).json({
                status: 'success',
                data: {
                    user: {
                        id: updatedUser.id,
                        phone: updatedUser.phone,
                        name: updatedUser.name,
                        email: updatedUser.email,
                        language: updatedUser.language,
                        location: updatedUser.location,
                        preferences: updatedUser.preferences
                    }
                }
            });
        }
        catch (error) {
            next(error);
        }
    }
}
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map