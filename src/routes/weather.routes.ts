import { Router } from 'express';
import { weatherController } from '../controllers/weather.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.use(protect);

// Weather routes
router.get('/alerts', weatherController.getWeatherAlerts);
router.get('/forecast', weatherController.getWeatherForecast);
router.post('/subscribe', weatherController.subscribeToAlerts);
router.post('/unsubscribe', weatherController.unsubscribeFromAlerts);
router.get('/preferences', weatherController.getWeatherPreferences);
router.put('/preferences', weatherController.updateWeatherPreferences);

export default router; 