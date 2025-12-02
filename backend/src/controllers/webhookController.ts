import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { ingestionQueue } from '../services/queueService.js';


const verifyWebhook = (data: Buffer, hmacHeader: string, secret: string): boolean => {
    const hash = crypto.createHmac('sha256', secret).update(data).digest('base64');
    return hash === hmacHeader;
};

export const handleCartAbandoned = async (req: Request, res: Response) => {
    try {
        const hmac = req.get('X-Shopify-Hmac-SHA256');
        const shopDomain = req.get('X-Shopify-Shop-Domain');
        const rawBody = (req as any).rawBody;

        if (!rawBody) {
            console.error('❌ Raw body missing.');
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        if (!hmac || !verifyWebhook(rawBody, hmac, process.env.SHOPIFY_API_SECRET!)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain! },
        });

        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        await ingestionQueue.add('process-webhook', {
            type: 'cart-abandoned',
            tenantId: tenant.id,
            payload: req.body,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

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
        const rawBody = (req as any).rawBody;

        if (!hmac || !verifyWebhook(rawBody, hmac, process.env.SHOPIFY_API_SECRET!)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain! },
        });

        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        await ingestionQueue.add('process-webhook', {
            type: 'checkout-started',
            tenantId: tenant.id,
            payload: req.body,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};


export const handleOrderCreated = async (req: Request, res: Response) => {
    console.log('📥 [Webhook] Received request: Order Created');
    try {
        const hmac = req.get('X-Shopify-Hmac-SHA256');
        const shopDomain = req.get('X-Shopify-Shop-Domain');
        const rawBody = (req as any).rawBody;

        if (!hmac || !verifyWebhook(rawBody, hmac, process.env.SHOPIFY_API_SECRET!)) {
            console.log('⚠️  Invalid webhook signature for Order Created');
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain! },
        });

        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });


        await ingestionQueue.add('process-webhook', {
            type: 'order-created',
            tenantId: tenant.id,
            payload: req.body,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

        console.log(`🔹 [Webhook] Queueing Order: ${req.body.order_number}`);
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('❌ Webhook error (Order):', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};