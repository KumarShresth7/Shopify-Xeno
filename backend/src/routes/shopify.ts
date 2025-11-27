import { Router } from 'express';
import { syncData, getCustomers, getOrders, getProducts } from '../controllers/shopifyController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';

const router = Router();

router.use(authenticate);
router.use(tenantContext);

router.post('/sync', syncData);
router.get('/customers', getCustomers);
router.get('/orders', getOrders);
router.get('/products', getProducts);

export default router;
