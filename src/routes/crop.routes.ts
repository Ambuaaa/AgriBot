import express from 'express';
import { cropController } from '../controllers/crop.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Crop guidance routes
router.get('/', cropController.getAllCropGuidance);
router.post('/', cropController.createCropGuidance);
router.get('/:id', cropController.getCropGuidanceById);
router.put('/:id', cropController.updateCropGuidance);
router.delete('/:id', cropController.deleteCropGuidance);

export default router; 