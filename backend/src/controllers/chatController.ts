import { Response } from 'express';
import { TenantRequest } from '../middleware/tenantContext.js';
import prisma from '../config/database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chatWithAnalyst = async (req: TenantRequest, res: Response) => {
    try {
        const { message } = req.body;
        const tenantId = req.tenant.id;


        const [
            orderStats,
            cartStats,
            checkoutStats,
            topProducts,
            recentOrders
        ] = await Promise.all([

            prisma.order.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
                _count: { id: true },
            }),


            prisma.abandonedCart.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
                _count: { id: true },
            }),


            prisma.checkout.groupBy({
                by: ['completed'],
                where: { tenantId },
                _count: { id: true },
            }),


            prisma.orderLineItem.groupBy({
                by: ['title'],
                where: { tenantId },
                _sum: { quantity: true, price: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),


            prisma.order.findMany({
                where: { tenantId },
                orderBy: { createdAt: 'desc' },
                take: 3,
                select: { totalPrice: true, createdAt: true }
            })
        ]);




        const completedCheckouts = checkoutStats.find(c => c.completed)?._count.id || 0;
        const totalCheckouts = checkoutStats.reduce((acc, curr) => acc + curr._count.id, 0);
        const conversionRate = totalCheckouts > 0
            ? ((completedCheckouts / totalCheckouts) * 100).toFixed(1) + '%'
            : '0%';


        const analysisContext = {
            performance: {
                total_revenue: orderStats._sum.totalPrice || 0,
                total_orders: orderStats._count.id,
                conversion_rate: conversionRate,
            },
            opportunities: {
                abandoned_carts: cartStats._count.id,
                lost_revenue: cartStats._sum.totalPrice || 0,
            },
            top_products: topProducts.map(p => ({
                name: p.title,
                sold: p._sum.quantity,
                revenue: p._sum.price
            })),
            latest_activity: recentOrders.map(o => ({
                amount: o.totalPrice,
                date: o.createdAt.toISOString().split('T')[0]
            }))
        };


        const cleanContext = JSON.parse(JSON.stringify(analysisContext, (_, v) =>
            typeof v === 'bigint' ? v.toString() : v
        ));

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemPrompt = `
        You are "Xeno", a Senior eCommerce Strategist & Data Analyst.
        
        YOUR GOAL: Provide insights, not just data.
        
        REAL-TIME DATA CONTEXT:
        ${JSON.stringify(cleanContext, null, 2)}
        
        INSTRUCTIONS:
        1. **Be Analytical:** If lost revenue is high, mention it as a "hidden opportunity".
        2. **Conversion Focus:** If conversion rate is under 2%, suggest checkout improvements.
        3. **Tone:** Professional but enthusiastic. Use emojis sparingly.
        4. **Format:** Use bullet points for lists. Keep responses concise (under 3 sentences unless asked for detail).
        5. **Currency:** Format all money in the store's currency (assume USD or matching context).
        
        User Question: "${message}"
        `;

        const result = await model.generateContent(systemPrompt);
        const reply = result.response.text();

        res.json({ success: true, reply });

    } catch (error: any) {
        console.error('AI Analyst Error:', error);
        res.status(500).json({
            success: false,
            reply: "My analytics engine is cooling down. Please try again in a moment."
        });
    }
};