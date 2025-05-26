import { Router } from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware';
import { AuthMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Public webhook endpoints (no authentication required)
router.get('/webhook', (req, res) => {
  // Verify webhook
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
      console.log('Webhook verified');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    res.sendStatus(400);
  }
});

router.post('/webhook', 
  validate([
    body('entry').isArray(),
    body('entry.*.changes').isArray(),
    body('entry.*.changes.*.value').exists()
  ]),
  (req, res) => {
    try {
      const { body } = req;
      
      // Handle different types of messages
      if (body.object === 'whatsapp_business_account') {
        // Process the message
        console.log('WhatsApp webhook received:', JSON.stringify(body, null, 2));
        res.status(200).send('OK');
      } else {
        res.sendStatus(404);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      res.sendStatus(500);
    }
  }
);

// Protected routes (require authentication)
router.use(AuthMiddleware.verifyToken);

// Additional WhatsApp management routes
router.get('/messages', (req, res) => {
  // TODO: Implement message history retrieval
  res.status(200).json({ messages: [] });
});

router.post('/send', 
  validate([
    body('to').isString().notEmpty(),
    body('message').isString().notEmpty()
  ]),
  (req, res) => {
    // TODO: Implement message sending
    res.status(200).json({ success: true });
  }
);

export default router; 