import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';

// Verify Shopify webhook signature
const verifyWebhook = (data: string, hmacHeader: string, secret: string): boolean => {
    const hash = crypto.createHmac('sha256', secret).update(data, 'utf8').digest('base64');
    return hash === hmacHeader;
};

export const handleCartAbandoned = async (req: Request, res: Response) => {
    try {
        const hmac = req.get('X-Shopify-Hmac-SHA256');
        const shopDomain = req.get('X-Shopify-Shop-Domain');
        const rawBody = JSON.stringify(req.body);

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

        // Store cart abandoned event
        await prisma.abandonedCart.upsert({
            where: {
                cartToken_tenantId: {
                    cartToken: cart.token,
                    tenantId: tenant.id,
                },
            },
            update: {
                totalPrice: parseFloat(cart.total_price || '0'),
                abandonedAt: new Date(cart.updated_at),
                lineItems: cart.line_items,
            },
            create: {
                tenantId: tenant.id,
                cartToken: cart.token,
                customerId: cart.customer?.id ? BigInt(cart.customer.id) : null,
                customerEmail: cart.email || cart.customer?.email,
                totalPrice: parseFloat(cart.total_price || '0'),
                abandonedAt: new Date(cart.updated_at),
                lineItems: cart.line_items,
            },
        });

        console.log('✅ Cart abandoned event recorded:', cart.token);
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
        const rawBody = JSON.stringify(req.body);

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

        // Store checkout started event
        await prisma.checkout.upsert({
            where: {
                id_tenantId: {
                    id: BigInt(checkout.id),
                    tenantId: tenant.id,
                },
            },
            update: {
                completed: checkout.completed_at ? true : false,
            },
            create: {
                id: BigInt(checkout.id),
                tenantId: tenant.id,
                customerId: checkout.customer?.id ? BigInt(checkout.customer.id) : null,
                customerEmail: checkout.email || checkout.customer?.email,
                totalPrice: parseFloat(checkout.total_price || '0'),
                completed: checkout.completed_at ? true : false,
                createdAt: new Date(checkout.created_at),
            },
        });

        console.log('✅ Checkout started event recorded:', checkout.id);
        res.status(200).json({ success: true });
    } catch (error: any) {
        console.error('Webhook error:', error);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};
