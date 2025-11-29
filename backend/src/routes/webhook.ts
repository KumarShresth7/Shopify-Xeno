import { Router } from 'express';
import { handleCartAbandoned, handleCheckoutStarted } from '../controllers/webhookController.js';

const router = Router();

// REMOVED: router.use(express.json(...)) - Handled globally in index.ts now

router.post('/cart-abandoned', handleCartAbandoned);
router.post('/checkout-started', handleCheckoutStarted);

export default router;