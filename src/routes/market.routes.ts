import { Router } from 'express';
import { marketController } from '../controllers/market.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.use(protect);

// Market routes
router.get('/prices', marketController.getCropPrices);
router.get('/trends', marketController.getPriceTrends);
router.post('/subscribe', marketController.subscribeToPriceAlerts);
router.post('/unsubscribe', marketController.unsubscribeFromPriceAlerts);

export default router;  