"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const farm_controller_1 = require("../controllers/farm.controller");
const router = (0, express_1.Router)();
// Apply protection middleware to all routes
router.use(auth_middleware_1.protect);
// Farm routes
router.post('/farms', farm_controller_1.createFarm);
router.get('/farms', farm_controller_1.getFarms);
router.get('/farms/:id', farm_controller_1.getFarm);
router.put('/farms/:id', farm_controller_1.updateFarm);
router.delete('/farms/:id', farm_controller_1.deleteFarm);
// Sensor routes
router.post('/farms/:farmId/sensors', farm_controller_1.addSensor);
router.get('/farms/:farmId/sensors', farm_controller_1.getSensors);
router.get('/farms/:farmId/sensors/:id', farm_controller_1.getSensor);
router.put('/farms/:farmId/sensors/:id', farm_controller_1.updateSensor);
router.delete('/farms/:farmId/sensors/:id', farm_controller_1.deleteSensor);
exports.default = router;
//# sourceMappingURL=protected.routes.js.map