import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import logger from '../utils/logger';

const prisma = new PrismaClient();

// Farm Controllers
export const createFarm = async (req: Request, res: Response) => {
  try {
    const { name, location, size, cropType } = req.body;
    const farm = await prisma.farm.create({
      data: {
        name,
        location,
        size,
        cropType,
        userId: req.user!.userId
      }
    });

    res.status(201).json({
      success: true,
      farm
    });
  } catch (error) {
    logger.error('Error in createFarm:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating farm'
    });
  }
};

export const getFarms = async (req: Request, res: Response) => {
  try {
    const farms = await prisma.farm.findMany({
      where: {
        userId: req.user!.userId
      }
    });

    res.json({
      success: true,
      farms
    });
  } catch (error) {
    logger.error('Error in getFarms:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farms'
    });
  }
};

export const getFarm = async (req: Request, res: Response) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      },
      include: {
        sensors: true
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    res.json({
      success: true,
      farm
    });
  } catch (error) {
    logger.error('Error in getFarm:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching farm'
    });
  }
};

export const updateFarm = async (req: Request, res: Response) => {
  try {
    const { name, location, size, cropType } = req.body;
    const farm = await prisma.farm.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const updatedFarm = await prisma.farm.update({
      where: { id: req.params.id },
      data: {
        name,
        location,
        size,
        cropType
      }
    });

    res.json({
      success: true,
      farm: updatedFarm
    });
  } catch (error) {
    logger.error('Error in updateFarm:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating farm'
    });
  }
};

export const deleteFarm = async (req: Request, res: Response) => {
  try {
    const farm = await prisma.farm.findFirst({
      where: {
        id: req.params.id,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    await prisma.farm.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Farm deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteFarm:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting farm'
    });
  }
};

// Sensor Controllers
export const addSensor = async (req: Request, res: Response) => {
  try {
    const { type, value } = req.body;
    const { farmId } = req.params;

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const sensor = await prisma.sensor.create({
      data: {
        type,
        value,
        farmId
      }
    });

    res.status(201).json({
      success: true,
      sensor
    });
  } catch (error) {
    logger.error('Error in addSensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding sensor'
    });
  }
};

export const getSensors = async (req: Request, res: Response) => {
  try {
    const { farmId } = req.params;

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const sensors = await prisma.sensor.findMany({
      where: { farmId }
    });

    res.json({
      success: true,
      sensors
    });
  } catch (error) {
    logger.error('Error in getSensors:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sensors'
    });
  }
};

export const getSensor = async (req: Request, res: Response) => {
  try {
    const { farmId, id } = req.params;

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const sensor = await prisma.sensor.findFirst({
      where: {
        id,
        farmId
      }
    });

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    res.json({
      success: true,
      sensor
    });
  } catch (error) {
    logger.error('Error in getSensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sensor'
    });
  }
};

export const updateSensor = async (req: Request, res: Response) => {
  try {
    const { type, value } = req.body;
    const { farmId, id } = req.params;

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const sensor = await prisma.sensor.findFirst({
      where: {
        id,
        farmId
      }
    });

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    const updatedSensor = await prisma.sensor.update({
      where: { id },
      data: {
        type,
        value
      }
    });

    res.json({
      success: true,
      sensor: updatedSensor
    });
  } catch (error) {
    logger.error('Error in updateSensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating sensor'
    });
  }
};

export const deleteSensor = async (req: Request, res: Response) => {
  try {
    const { farmId, id } = req.params;

    const farm = await prisma.farm.findFirst({
      where: {
        id: farmId,
        userId: req.user!.userId
      }
    });

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: 'Farm not found'
      });
    }

    const sensor = await prisma.sensor.findFirst({
      where: {
        id,
        farmId
      }
    });

    if (!sensor) {
      return res.status(404).json({
        success: false,
        message: 'Sensor not found'
      });
    }

    await prisma.sensor.delete({
      where: { id }
    });

    res.json({
      success: true,
      message: 'Sensor deleted successfully'
    });
  } catch (error) {
    logger.error('Error in deleteSensor:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting sensor'
    });
  }
}; 