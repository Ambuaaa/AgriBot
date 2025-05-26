import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/app.config';
import { AppError } from '../middleware/error.middleware';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError(400, 'User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    logger.error('Error in register:', error);
    res.status(500).json({ success: false, message: 'Error creating user' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new AppError(400, 'Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError(400, 'Invalid credentials');
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: '24h' }
    );
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role }
    });
  } catch (error) {
    logger.error('Error in login:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: { id: true, email: true, name: true, role: true }
    });
    if (!user) {
      throw new AppError(404, 'User not found');
    }
    res.json({ success: true, user });
  } catch (error) {
    logger.error('Error in getProfile:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
};

export const verify = async (req: Request, res: Response) => {
  try {
    const { phone, otp } = req.body;

    // Verify OTP (implement actual OTP verification)
    // For now, just check if it's 123456
    if (otp !== '123456') {
      throw new AppError(400, 'Invalid OTP');
    }

    const user = await prisma.user.findUnique({
      where: { phone },
      include: {
        preferences: true
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id },
      config.jwtSecret,
      { expiresIn: '24h' }
    );

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
  } catch (error) {
    logger.error('Error in verify:', error);
    res.status(500).json({ success: false, message: 'Error verifying user' });
  }
};

// Get current user
async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // User ID will be set by auth middleware
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        preferences: true
      }
    });

    if (!user) {
      throw new AppError(404, 'User not found');
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
  } catch (error) {
    next(error);
  }
}

// Update user preferences
async function updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = (req as any).user.id;
    const {
      language,
      voiceEnabled,
      weatherAlerts,
      priceAlerts,
      cropReminders,
      preferredCrops,
      preferredMarkets
    } = req.body;

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
  } catch (error) {
    next(error);
  }
} 