import { Router } from 'express';
import {
    getOverview,
    getRevenueTrend,
    getTopCustomers,
    getOrdersByDate,
    getAbandonedCarts,
    getConversionMetrics,
    getProductPerformance,
    getCustomerSegments,
} from '../controllers/insightsController.js';
import { authenticate } from '../middleware/auth.js';
import { tenantContext } from '../middleware/tenantContext.js';
import { cacheMiddleware } from '../middleware/cache.js';

const router = Router();
router.use(authenticate);
router.use(tenantContext);


router.get('/overview', cacheMiddleware(60 * 60), getOverview);
router.get('/revenue-trend', cacheMiddleware(60 * 60), getRevenueTrend);
router.get('/top-customers', cacheMiddleware(60 * 60), getTopCustomers);
router.get('/orders', cacheMiddleware(60 * 60), getOrdersByDate);


router.get('/abandoned-carts', cacheMiddleware(60 * 60), getAbandonedCarts);
router.get('/conversion-metrics', cacheMiddleware(60 * 60), getConversionMetrics);
router.get('/product-performance', cacheMiddleware(60 * 60), getProductPerformance);
router.get('/customer-segments', cacheMiddleware(60 * 60), getCustomerSegments);

export default router;
