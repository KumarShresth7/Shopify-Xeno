import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt.js';
import prisma from '../config/database.js';

export interface AuthRequest extends Request {
    user?: {
        userId: number;
        email: string;
        tenantId: number;
    };
}

export const authenticate = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const payload = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: payload.userId },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        req.user = {
            userId: payload.userId,
            email: payload.email,
            tenantId: payload.tenantId,
        };

        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
};
