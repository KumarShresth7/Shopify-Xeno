import { Response } from 'express';
import { TenantRequest } from '../middleware/tenantContext.js';
import prisma from '../config/database.js';


const getCustomerTier = (spent: number) => {
    if (spent >= 100) return 'VIP';
    if (spent >= 50) return 'High Value';
    if (spent >= 10) return 'Regular';
    return 'New';
};

export const getOverview = async (req: TenantRequest, res: Response) => {
    try {
        const tenantId = req.tenant.id;

        const [totalCustomers, totalOrders, revenueData, totalProducts] = await Promise.all([
            prisma.customer.count({ where: { tenantId } }),
            prisma.order.count({ where: { tenantId } }),
            prisma.order.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
            }),
            prisma.product.count({ where: { tenantId } }),
        ]);

        const totalRevenue = Number(revenueData._sum.totalPrice || 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        res.json({
            success: true,
            data: {
                totalCustomers,
                totalOrders,
                totalRevenue: parseFloat(totalRevenue.toFixed(2)),
                averageOrderValue: parseFloat(averageOrderValue.toFixed(2)),
                totalProducts,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching overview', error: error.message });
    }
};

export const getRevenueTrend = async (req: TenantRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const tenantId = req.tenant.id;

        const where: any = { tenantId };

        if (startDate && endDate) {
            where.createdAt = {
                gte: new Date(startDate as string),
                lte: new Date(endDate as string),
            };
        } else {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            where.createdAt = {
                gte: thirtyDaysAgo,
            };
        }

        const orders = await prisma.order.findMany({
            where,
            select: {
                createdAt: true,
                totalPrice: true,
            },
            orderBy: { createdAt: 'asc' },
        });

        // Group by YYYY-MM-DD
        const trendMap = new Map<string, { revenue: number; orders: number }>();

        orders.forEach((order) => {
            const date = order.createdAt.toISOString().split('T')[0];
            const current = trendMap.get(date) || { revenue: 0, orders: 0 };
            trendMap.set(date, {
                revenue: current.revenue + Number(order.totalPrice),
                orders: current.orders + 1,
            });
        });

        // Convert Map to Array for the Chart
        const trend = Array.from(trendMap.entries()).map(([date, data]) => ({
            date,
            revenue: parseFloat(data.revenue.toFixed(2)),
            orders: data.orders,
        }));

        res.json({ success: true, data: trend });
    } catch (error: any) {
        res.status(500).json({ success: false, message: 'Error fetching revenue trend', error: error.message });
    }
};

export const getTopCustomers = async (req: TenantRequest, res: Response) => {
    try {
        const { limit = 5 } = req.query;
        const tenantId = req.tenant.id;

        const customers = await prisma.customer.findMany({
            where: { tenantId },
            orderBy: { totalSpent: 'desc' },
            take: Number(limit),
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                totalSpent: true,
                ordersCount: true,
            },
        });

        const topCustomers = customers.map((customer) => {
            const totalSpent = parseFloat(Number(customer.totalSpent).toFixed(2));
            return {
                id: customer.id.toString(),
                name: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Guest',
                email: customer.email || 'N/A',
                totalSpent,
                ordersCount: customer.ordersCount,

                tier: getCustomerTier(totalSpent),
            };
        });

        res.json({ success: true, data: topCustomers });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching top customers',
            error: error.message,
        });
    }
};

export const getOrdersByDate = async (req: TenantRequest, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const tenantId = req.tenant.id;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                message: 'Start date and end date are required',
            });
        }

        const orders = await prisma.order.findMany({
            where: {
                tenantId,
                createdAt: {
                    gte: new Date(startDate as string),
                    lte: new Date(endDate as string),
                },
            },
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        res.json({ success: true, data: orders });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching orders by date',
            error: error.message,
        });
    }
};

export const getAbandonedCarts = async (req: TenantRequest, res: Response) => {
    try {
        const tenantId = req.tenant.id;

        // 1. Fetch Summary
        const summary = await prisma.abandonedCart.aggregate({
            where: {
                tenantId,
                abandonedAt: {
                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
                },
            },
            _count: true,
            _sum: { totalPrice: true },
        });

        // 2. Fetch Recent Carts
        const rawCarts = await prisma.abandonedCart.findMany({
            where: { tenantId },
            orderBy: { abandonedAt: 'desc' },
            take: 10,
            include: {
                customer: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // 3. Map Data
        const recentCarts = rawCarts.map((cart) => ({
            cartToken: cart.cartToken,
            customerName: cart.customer
                ? `${cart.customer.firstName || ''} ${cart.customer.lastName || ''}`.trim()
                : (cart.customerEmail || 'Guest'),
            customerEmail: cart.customer?.email || cart.customerEmail,
            totalPrice: Number(cart.totalPrice || 0),
            abandonedAt: cart.abandonedAt,
        }));

        res.json({
            success: true,
            data: {
                totalAbandoned: summary._count,
                potentialRevenue: parseFloat(Number(summary._sum.totalPrice || 0).toFixed(2)),
                recentCarts,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching abandoned carts',
            error: error.message,
        });
    }
};

export const getConversionMetrics = async (req: TenantRequest, res: Response) => {
    try {
        const tenantId = req.tenant.id;

        const [checkoutsCount, completedCheckouts, totalOrders, avgOrderValue, recentCheckouts] = await Promise.all([
            prisma.checkout.count({ where: { tenantId } }),
            prisma.checkout.count({ where: { tenantId, completed: true } }),
            prisma.order.count({ where: { tenantId } }),
            prisma.order.aggregate({
                where: { tenantId },
                _avg: { totalPrice: true },
            }),
            prisma.checkout.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                select: {
                    id: true,
                    customerEmail: true,
                    totalPrice: true,
                    completed: true,
                    createdAt: true
                }
            })
        ]);

        const conversionRate =
            checkoutsCount > 0 ? ((completedCheckouts / checkoutsCount) * 100).toFixed(2) : '0';

        const serialize = (obj: any) => JSON.parse(JSON.stringify(obj, (key, value) =>
            typeof value === 'bigint' ? value.toString() : value
        ));

        res.json({
            success: true,
            data: {
                totalCheckouts: checkoutsCount,
                completedCheckouts,
                totalOrders,
                avgOrderValue: parseFloat(Number(avgOrderValue._avg.totalPrice || 0).toFixed(2)),
                conversionRate: parseFloat(conversionRate),
                recentCheckouts: serialize(recentCheckouts),
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching conversion metrics',
            error: error.message,
        });
    }
};

export const getProductPerformance = async (req: TenantRequest, res: Response) => {
    try {
        const tenantId = req.tenant.id;
        const { limit = 10 } = req.query;

        const productStats = await prisma.orderLineItem.groupBy({
            by: ['productId', 'title'],
            where: {
                tenantId,
                productId: { not: null },
            },
            _count: { id: true },
            _sum: {
                quantity: true,
                price: true,
            },
            orderBy: {
                _sum: {
                    price: 'desc',
                },
            },
            take: Number(limit),
        });

        const products = productStats.map((stat) => ({
            productId: stat.productId?.toString(),
            title: stat.title,
            timesOrdered: stat._count.id,
            totalQuantitySold: stat._sum.quantity || 0,
            totalRevenue: parseFloat(Number(stat._sum.price || 0).toFixed(2)),
        }));

        res.json({ success: true, data: products });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching product performance',
            error: error.message,
        });
    }
};

export const getCustomerSegments = async (req: TenantRequest, res: Response) => {
    try {
        const tenantId = req.tenant.id;

        const customers = await prisma.customer.findMany({
            where: { tenantId },
            select: { totalSpent: true },
        });

        const segments = {
            VIP: { count: 0, revenue: 0 },
            'High Value': { count: 0, revenue: 0 },
            Regular: { count: 0, revenue: 0 },
            New: { count: 0, revenue: 0 },
        };

        // Aggregation Logic matching the Tier helper
        customers.forEach((customer) => {
            const spent = Number(customer.totalSpent || 0);

            if (spent >= 100) {
                segments.VIP.count++;
                segments.VIP.revenue += spent;
            } else if (spent >= 60) {
                segments['High Value'].count++;
                segments['High Value'].revenue += spent;
            } else if (spent >= 30) {
                segments.Regular.count++;
                segments.Regular.revenue += spent;
            } else {
                segments.New.count++;
                segments.New.revenue += spent;
            }
        });

        const result = Object.entries(segments).map(([segment, data]) => ({
            segment,
            customerCount: data.count,
            segmentRevenue: parseFloat(data.revenue.toFixed(2)),
            avgCustomerValue: data.count > 0 ? parseFloat((data.revenue / data.count).toFixed(2)) : 0,
        }));

        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: 'Error fetching customer segments',
            error: error.message,
        });
    }
};

