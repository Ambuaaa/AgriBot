"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const client_1 = require("@prisma/client");
const rate_limit_middleware_1 = require("../middleware/rate-limit.middleware");
const crypto_1 = __importDefault(require("crypto"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_config_1 = require("../config/app.config");
const auth_controller_1 = require("../controllers/auth.controller");
const validation_middleware_1 = require("../middleware/validation.middleware");
const auth_middleware_2 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Create nodemailer transporter
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: app_config_1.config.emailConfig.from,
        pass: app_config_1.config.emailConfig.password
    }
});
/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', validation_middleware_1.validateRegister, auth_controller_1.register);
/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', validation_middleware_1.validateLogin, auth_controller_1.login);
/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 */
router.get('/profile', auth_middleware_2.protect, auth_controller_1.getProfile);
/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 */
router.post('/refresh', auth_middleware_1.AuthMiddleware.refreshToken);
/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', auth_middleware_1.AuthMiddleware.verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.json({
            success: true,
            user
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching user'
        });
    }
});
/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 */
router.post('/forgot-password', rate_limit_middleware_1.strictLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Generate reset token
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
        // Save reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                resetToken,
                resetTokenExpiry
            }
        });
        // Send reset email
        const resetUrl = `${app_config_1.config.corsOrigin}/reset-password?token=${resetToken}`;
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `
        });
        res.json({
            success: true,
            message: 'Password reset email sent'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error processing password reset request'
        });
    }
});
/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 */
router.post('/reset-password', rate_limit_middleware_1.strictLimiter, async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        // Find user with valid reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {
                    gt: new Date()
                }
            }
        });
        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired reset token'
            });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password and clear reset token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        });
        res.json({
            success: true,
            message: 'Password reset successful'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error resetting password'
        });
    }
});
/**
 * @route POST /api/auth/change-password
 * @desc Change password (authenticated)
 */
router.post('/change-password', auth_middleware_1.AuthMiddleware.verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        // Find user
        const user = await prisma.user.findUnique({
            where: { id: req.user?.userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        // Verify current password
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }
        // Hash new password
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
        // Update password
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword
            }
        });
        res.json({
            success: true,
            message: 'Password changed successfully'
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error changing password'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.routes.js.map