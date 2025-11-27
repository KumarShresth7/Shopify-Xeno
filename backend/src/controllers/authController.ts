import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../config/database.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, shopDomain } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const result = await prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: { shopDomain, email },
            });

            const user = await tx.user.create({
                data: {
                    email,
                    passwordHash,
                    tenantId: tenant.id,
                },
                include: { tenant: true },
            });

            return { user, tenant };
        });

        const token = generateToken({
            userId: result.user.id,
            email: result.user.email,
            tenantId: result.user.tenantId,
        });

        res.status(201).json({
            success: true,
            token,
            user: {
                id: result.user.id,
                email: result.user.email,
                tenantId: result.user.tenantId,
                tenant: {
                    id: result.tenant.id,
                    shopDomain: result.tenant.shopDomain,
                    email: result.tenant.email,
                },
            },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, message: 'Error creating user', error: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
            include: { tenant: true },
        });

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            tenantId: user.tenantId,
        });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                email: user.email,
                tenantId: user.tenantId,
                tenant: {
                    id: user.tenant.id,
                    shopDomain: user.tenant.shopDomain,
                    email: user.tenant.email,
                },
            },
        });
    } catch (error: any) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, message: 'Error logging in', error: error.message });
    }
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            include: { tenant: true },
            select: {
                id: true,
                email: true,
                tenantId: true,
                tenant: true,
                createdAt: true,
            },
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching user', error: error.message });
    }
};
