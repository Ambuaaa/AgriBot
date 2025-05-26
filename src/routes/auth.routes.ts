import { Router } from 'express';
import { AuthMiddleware } from '../middleware/auth.middleware';
import { JWTUtils } from '../utils/jwt.utils';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { strictLimiter } from '../middleware/rate-limit.middleware';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import { config } from '../config/app.config';
import { register, login , getProfile } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validation.middleware';
import { protect } from '../middleware/auth.middleware';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.emailConfig.from,
    pass: config.emailConfig.password
  }
});

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 */
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      }
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating user' });
  }
});

/**
 * @route POST /api/auth/login
 * @desc Login user
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error logging in' });
  }
});

/**
 * @route GET /api/auth/profile
 * @desc Get current user profile
 */
router.get('/profile', protect, getProfile);

/**
 * @route POST /api/auth/refresh
 * @desc Refresh JWT token
 */
router.post('/refresh', AuthMiddleware.refreshToken);

/**
 * @route GET /api/auth/me
 * @desc Get current user
 */
router.get('/me', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching user' });
  }
});

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 */
router.post('/forgot-password', strictLimiter, async (req, res) => {
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
    const resetToken = crypto.randomBytes(32).toString('hex');
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
    const resetUrl = `${config.corsOrigin}/reset-password?token=${resetToken}`;
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
  } catch (error) {
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
router.post('/reset-password', strictLimiter, async (req, res) => {
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
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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
  } catch (error) {
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
router.post('/change-password', AuthMiddleware.verifyToken, async (req, res) => {
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
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
});

export default router; 