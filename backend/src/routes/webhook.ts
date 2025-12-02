import { Router } from 'express';
import {
    handleCartAbandoned,
    handleCheckoutStarted,
    handleOrderCreated
} from '../controllers/webhookController.js';

const router = Router();

router.post('/cart-abandoned', handleCartAbandoned);
router.post('/checkout-started', handleCheckoutStarted);
router.post('/order-created', handleOrderCreated);

export default router;