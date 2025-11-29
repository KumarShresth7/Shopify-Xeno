import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { ingestionQueue } from '../services/queueService.js';

// Verify Shopify webhook signature
const verifyWebhook = (data: Buffer, hmacHeader: string, secret: string): boolean => {
    const hash = crypto.createHmac('sha256', secret).update(data).digest('base64');
    return hash === hmacHeader;
};

export const handleCartAbandoned = async (req: Request, res: Response) => {
    try {
        const hmac = req.get('X-Shopify-Hmac-SHA256');
        const shopDomain = req.get('X-Shopify-Shop-Domain');

        // FIX: Use the raw buffer attached by the middleware in routes/webhook.ts
        const rawBody = (req as any).rawBody;

        if (!rawBody) {
            console.error('❌ Raw body missing. Ensure express.json verify is set.');
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        // Verify webhook
        if (!hmac || !verifyWebhook(rawBody, hmac, process.env.SHOPIFY_API_SECRET!)) {
            console.log('⚠️  Invalid webhook signature');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Get tenant by shop domain
        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain! },
        });

        if (!tenant) {
            console.log('⚠️  Tenant not found for shop:', shopDomain);
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const cart = req.body;

        // Offload to Redis Queue
        await ingestionQueue.add('process-webhook', {
            type: 'cart-abandoned',
            tenantId: tenant.id,
            payload: cart,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });

        console.log('✅ Cart abandoned event queued:', cart.token);
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};

export const handleCheckoutStarted = async (req: Request, res: Response) => {
    try {
        const hmac = req.get('X-Shopify-Hmac-SHA256');
        const shopDomain = req.get('X-Shopify-Shop-Domain');

        // FIX: Use rawBody here too
        const rawBody = (req as any).rawBody;

        if (!hmac || !verifyWebhook(rawBody, hmac, process.env.SHOPIFY_API_SECRET!)) {
            console.log('⚠️  Invalid webhook signature');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain! },
        });

        if (!tenant) {
            console.log('⚠️  Tenant not found for shop:', shopDomain);
            return res.status(404).json({ message: 'Tenant not found' });
        }

        const checkout = req.body;

        await ingestionQueue.add('process-webhook', {
            type: 'checkout-started',
            tenantId: tenant.id,
            payload: checkout,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });

        console.log('✅ Checkout started event queued:', checkout.id);
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};