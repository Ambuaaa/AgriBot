import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

export const cropController = {
  // Get all crop guidance
  async getAllCropGuidance(req: Request, res: Response) {
    try {
      const guidance = await prisma.cropGuidance.findMany();
      res.json({ success: true, guidance });
    } catch (error) {
      logger.error('Error fetching crop guidance:', error);
      res.status(500).json({ success: false, message: 'Error fetching crop guidance' });
    }
  },

  // Create new crop guidance
  async createCropGuidance(req: Request, res: Response) {
    try {
      const { crop, stage, guidance, language, season, region } = req.body;
      const newGuidance = await prisma.cropGuidance.create({
        data: {
          crop,
          stage,
          guidance,
          language,
          season,
          region
        }
      });
      res.status(201).json({ success: true, guidance: newGuidance });
    } catch (error) {
      logger.error('Error creating crop guidance:', error);
      res.status(500).json({ success: false, message: 'Error creating crop guidance' });
    }
  },

  // Get crop guidance by ID
  async getCropGuidanceById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const guidance = await prisma.cropGuidance.findUnique({
        where: { id }
      });
      if (!guidance) {
        return res.status(404).json({ success: false, message: 'Crop guidance not found' });
      }
      res.json({ success: true, guidance });
    } catch (error) {
      logger.error('Error fetching crop guidance:', error);
      res.status(500).json({ success: false, message: 'Error fetching crop guidance' });
    }
  },

  // Update crop guidance
  async updateCropGuidance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { crop, stage, guidance, language, season, region } = req.body;
      const updatedGuidance = await prisma.cropGuidance.update({
        where: { id },
        data: {
          crop,
          stage,
          guidance,
          language,
          season,
          region
        }
      });
      res.json({ success: true, guidance: updatedGuidance });
    } catch (error) {
      logger.error('Error updating crop guidance:', error);
      res.status(500).json({ success: false, message: 'Error updating crop guidance' });
    }
  },

  // Delete crop guidance
  async deleteCropGuidance(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await prisma.cropGuidance.delete({
        where: { id }
      });
      res.json({ success: true, message: 'Crop guidance deleted successfully' });
    } catch (error) {
      logger.error('Error deleting crop guidance:', error);
      res.status(500).json({ success: false, message: 'Error deleting crop guidance' });
    }
  }
}; 