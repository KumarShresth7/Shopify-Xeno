import { Router } from 'express';
import authRoutes from './auth.js';
import shopifyRoutes from './shopify.js';
import insightsRoutes from './insights.js';
import tenantRoutes from './tenant.js';
import webhookRoutes from './webhook.js';
import chatRoutes from './chat.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/shopify', shopifyRoutes);
router.use('/insights', insightsRoutes);
router.use('/tenant', tenantRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/chat', chatRoutes);

export default router;
