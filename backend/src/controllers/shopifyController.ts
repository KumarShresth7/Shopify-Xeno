import { Response } from 'express';
import { TenantRequest } from '../middleware/tenantContext.js';
import { ShopifyService } from '../services/shopifyService.js';
import prisma from '../config/database.js';

export const syncData = async (req: TenantRequest, res: Response) => {
    try {
        const tenant = req.tenant;

        if (!tenant.accessToken) {
            return res.status(400).json({
                success: false,
                message: 'Shopify access token not configured. Please update your settings.',
            });
        }

        const shopifyService = new ShopifyService(tenant.shopDomain, tenant.accessToken);
        const results = await shopifyService.syncAllData(tenant.id);

        res.json({
            success: true,
            message: 'Data synced successfully',
            results,
        });
    } catch (error: any) {
        console.error('Sync error:', error);
        res.status(500).json({
            success: false,
            message: 'Error syncing data',
            error: error.message,
        });
    }
};

export const getCustomers = async (req: TenantRequest, res: Response) => {
    try {
        const { page = 1, limit = 20, search = '' } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const where: any = { tenantId: req.tenant.id };

        if (search) {
            where.OR = [
                { email: { contains: String(search), mode: 'insensitive' } },
                { firstName: { contains: String(search), mode: 'insensitive' } },
                { lastName: { contains: String(search), mode: 'insensitive' } },
            ];
        }

        const [customers, total] = await Promise.all([
            prisma.customer.findMany({
                where,
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.customer.count({ where }),
        ]);

        res.json({
            success: true,
            customers,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching customers', error: error.message });
    }
};

export const getOrders = async (req: TenantRequest, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { tenantId: req.tenant.id },
                include: {
                    customer: {
                        select: {
                            firstName: true,
                            lastName: true,
                            email: true,
                        },
                    },
                    lineItems: {
                        select: {
                            title: true,
                            quantity: true,
                            price: true,
                        },
                    },
                },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.order.count({ where: { tenantId: req.tenant.id } }),
        ]);

        res.json({
            success: true,
            orders,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching orders', error: error.message });
    }
};

export const getProducts = async (req: TenantRequest, res: Response) => {
    try {
        const { page = 1, limit = 20 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where: { tenantId: req.tenant.id },
                skip,
                take: Number(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.product.count({ where: { tenantId: req.tenant.id } }),
        ]);

        res.json({
            success: true,
            products,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                totalPages: Math.ceil(total / Number(limit)),
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching products', error: error.message });
    }
};
