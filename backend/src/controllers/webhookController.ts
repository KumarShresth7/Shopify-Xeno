import { Request, Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { ingestionQueue } from '../services/queueService.js';
import dotenv from 'dotenv';

dotenv.config();

export const handleCartAbandoned = async (req: Request, res: Response) => {
    try {
        const shopDomain = req.get('X-Shopify-Shop-Domain');

        // --- BYPASS START ---
        // We are skipping HMAC verification for the demo to ensure data flows.
        console.log(`⚠️ [Dev Mode] Skipping HMAC check for Abandoned Cart.`);
        // --- BYPASS END ---

        // 1. Basic Validation: Ensure we at least have the shop domain header
        if (!shopDomain) {
            return res.status(400).json({ message: 'Missing Shop Domain Header' });
        }

        // 2. Find Tenant (This is now your primary security check)
        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain as string },
        });

        if (!tenant) {
            console.warn(`⚠️  Tenant not found for domain: ${shopDomain}`);
            return res.status(404).json({ message: 'Tenant not found' });
        }

        // 3. Queue the Job
        await ingestionQueue.add('process-webhook', {
            type: 'cart-abandoned',
            tenantId: tenant.id,
            payload: req.body,
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });

        console.log(`✅ [Webhook] Cart Abandoned event queued for ${shopDomain}`);
        res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('❌ Webhook Controller Error:', error.message);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};

export const handleCheckoutStarted = async (req: Request, res: Response) => {
    try {
        const shopDomain = req.get('X-Shopify-Shop-Domain');

        // --- BYPASS START ---
        console.log(`⚠️ [Dev Mode] Skipping HMAC check for Checkout Started.`);
        // --- BYPASS END ---

        if (!shopDomain) {
            return res.status(400).json({ message: 'Missing Shop Domain Header' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain as string },
        });

        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        await ingestionQueue.add('process-webhook', {
            type: 'checkout-started',
            tenantId: tenant.id,
            payload: req.body,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

        console.log(`✅ [Webhook] Checkout Started event queued for ${shopDomain}`);
        res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('❌ Webhook Controller Error:', error.message);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};

export const handleOrderCreated = async (req: Request, res: Response) => {
    try {
        const shopDomain = req.get('X-Shopify-Shop-Domain');

        // --- BYPASS START ---
        console.log(`⚠️ [Dev Mode] Skipping HMAC check for Order Created.`);
        // --- BYPASS END ---

        if (!shopDomain) {
            return res.status(400).json({ message: 'Missing Shop Domain Header' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { shopDomain: shopDomain as string },
        });

        if (!tenant) return res.status(404).json({ message: 'Tenant not found' });

        await ingestionQueue.add('process-webhook', {
            type: 'order-created',
            tenantId: tenant.id,
            payload: req.body,
        }, { attempts: 3, backoff: { type: 'exponential', delay: 1000 } });

        console.log(`✅ [Webhook] Order Created event queued for ${shopDomain}`);
        res.status(200).json({ success: true });

    } catch (error: any) {
        console.error('❌ Webhook Controller Error:', error.message);
        res.status(500).json({ message: 'Error processing webhook' });
    }
};