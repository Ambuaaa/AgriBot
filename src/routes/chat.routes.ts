import { Router } from 'express';
import { chatController } from '../controllers/chat.controller';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Protected routes (require authentication)
router.use(AuthMiddleware.verifyToken);

// Chat routes
router.post('/conversations', chatController.startConversation);
router.post('/messages', chatController.sendMessage);
router.get('/conversations/:conversationId/messages', chatController.getMessages);
router.put('/conversations/:conversationId/end', chatController.endConversation);

export default router; 