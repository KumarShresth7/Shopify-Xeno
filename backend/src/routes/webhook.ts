import { Router } from 'express';
import express from 'express';
import { handleCartAbandoned, handleCheckoutStarted } from '../controllers/webhookController.js';

const router = Router();


router.use(express.json({ verify: (req: any, res, buf) => { req.rawBody = buf; } }));

router.post('/cart-abandoned', handleCartAbandoned);
router.post('/checkout-started', handleCheckoutStarted);

export default router;
