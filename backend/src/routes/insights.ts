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

const router = Router();

router.use(authenticate);
router.use(tenantContext);

// Core insights
router.get('/overview', getOverview);
router.get('/revenue-trend', getRevenueTrend);
router.get('/top-customers', getTopCustomers);
router.get('/orders', getOrdersByDate);

// BONUS: Advanced analytics
router.get('/abandoned-carts', getAbandonedCarts);
router.get('/conversion-metrics', getConversionMetrics);
router.get('/product-performance', getProductPerformance);
router.get('/customer-segments', getCustomerSegments);

export default router;
