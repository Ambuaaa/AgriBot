import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', AuthMiddleware.verifyToken, async (req, res) => {
  try {
    const { name } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user?.userId },
      data: { name },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        updatedAt: true
      }
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile' });
  }
});

export default router; 