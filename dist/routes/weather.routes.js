"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const weather_controller_1 = require("../controllers/weather.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_middleware_1.authMiddleware);
// Weather routes
router.get('/alerts', weather_controller_1.weatherController.getWeatherAlerts);
router.get('/forecast', weather_controller_1.weatherController.getWeatherForecast);
router.post('/subscribe', weather_controller_1.weatherController.subscribeToAlerts);
router.post('/unsubscribe', weather_controller_1.weatherController.unsubscribeFromAlerts);
exports.default = router;
//# sourceMappingURL=weather.routes.js.map