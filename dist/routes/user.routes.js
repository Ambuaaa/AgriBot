"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("../controllers/user.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_middleware_1.authMiddleware);
// User profile routes
router.get('/profile', user_controller_1.userController.getProfile);
router.put('/profile', user_controller_1.userController.updateProfile);
router.put('/preferences', user_controller_1.userController.updatePreferences);
router.get('/conversations', user_controller_1.userController.getConversations);
router.delete('/account', user_controller_1.userController.deleteAccount);
exports.default = router;
//# sourceMappingURL=user.routes.js.map