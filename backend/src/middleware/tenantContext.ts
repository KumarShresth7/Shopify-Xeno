import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth.js';
import prisma from '../config/database.js';

export interface TenantRequest extends AuthRequest {
    tenant?: any;
}

export const tenantContext = async (
    req: TenantRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }

        const tenant = await prisma.tenant.findUnique({
            where: { id: req.user.tenantId },
        });

        if (!tenant) {
            return res.status(404).json({ success: false, message: 'Tenant not found' });
        }

        req.tenant = tenant;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error fetching tenant context' });
    }
};
