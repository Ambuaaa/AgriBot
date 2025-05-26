import { Router } from 'express';
import { protect } from '../middleware/auth.middleware';
import {
  createFarm,
  getFarms,
  getFarm,
  updateFarm,
  deleteFarm,
  addSensor,
  getSensors,
  getSensor,
  updateSensor,
  deleteSensor
} from '../controllers/farm.controller';

const router = Router();

// Apply protection middleware to all routes
router.use((req, res, next) => protect(req, res, next));

// Farm routes
router.post('/farms', createFarm);
router.get('/farms', getFarms);
router.get('/farms/:id', getFarm);
router.put('/farms/:id', updateFarm);
router.delete('/farms/:id', deleteFarm);

// Sensor routes
router.post('/farms/:farmId/sensors', addSensor);
router.get('/farms/:farmId/sensors', getSensors);
router.get('/farms/:farmId/sensors/:id', getSensor);
router.put('/farms/:farmId/sensors/:id', updateSensor);
router.delete('/farms/:farmId/sensors/:id', deleteSensor);

export default router; 