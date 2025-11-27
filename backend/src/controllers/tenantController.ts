import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.js';
import prisma from '../config/database.js';

export const updateShopifyToken = async (req: AuthRequest, res: Response) => {
    try {
        const { accessToken, shopDomain } = req.body;
        const tenantId = req.user!.tenantId;

        if (!accessToken) {
            return res.status(400).json({ success: false, message: 'Access token is required' });
        }

        await prisma.tenant.update({
            where: { id: tenantId },
            data: {
                accessToken,
                ...(shopDomain && { shopDomain }),
            },
        });

        res.json({
            success: true,
            message: 'Shopify credentials updated successfully',
        });
    } catch (error: any) {
        console.error('Update token error:', error);
        res.status(500).json({ success: false, message: 'Error updating token', error: error.message });
    }
};

export const getShopifyStatus = async (req: AuthRequest, res: Response) => {
    try {
        const tenantId = req.user!.tenantId;

        const tenant = await prisma.tenant.findUnique({
            where: { id: tenantId },
            select: {
                shopDomain: true,
                accessToken: true,
            },
        });

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        res.json({
            success: true,
            configured: !!tenant.accessToken,
            shopDomain: tenant.shopDomain,
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching status', error: error.message });
    }
};
