"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controllers/chat.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Protected routes (require authentication)
router.use(auth_middleware_1.authMiddleware);
// Chat routes
router.post('/conversations', chat_controller_1.chatController.startConversation);
router.post('/messages', chat_controller_1.chatController.sendMessage);
router.get('/conversations/:conversationId/messages', chat_controller_1.chatController.getMessages);
router.put('/conversations/:conversationId/end', chat_controller_1.chatController.endConversation);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map