import { Router } from 'express';
import { updateShopifyToken, getShopifyStatus, getProducts } from '../controllers/tenantController.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/shopify-token', updateShopifyToken);
router.get('/shopify-status', getShopifyStatus);
router.get('/products', getProducts);

export default router;
