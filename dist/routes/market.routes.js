"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const market_controller_1 = require("../controllers/market.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_middleware_1.authMiddleware);
// Market routes
router.get('/prices', market_controller_1.marketController.getCropPrices);
router.get('/trends', market_controller_1.marketController.getPriceTrends);
router.post('/subscribe', market_controller_1.marketController.subscribeToPriceAlerts);
router.post('/unsubscribe', market_controller_1.marketController.unsubscribeFromPriceAlerts);
exports.default = router;
//# sourceMappingURL=market.routes.js.map