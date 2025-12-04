import { Response } from 'express';
import { TenantRequest } from '../middleware/tenantContext.js';
import prisma from '../config/database.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export const chatWithAnalyst = async (req: TenantRequest, res: Response) => {
    try {
        const { message } = req.body;
        const tenantId = req.tenant.id;


        const [overview, topProducts, recentSales, customerStats] = await Promise.all([

            prisma.order.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
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
                select: {
                    totalPrice: true,
                    createdAt: true,
                    customer: { select: { firstName: true, email: true } }
                }
            }),

            prisma.customer.count({ where: { tenantId } })
        ]);


        const contextPayload = {
            storeStats: {
                revenue: overview._sum.totalPrice || 0,
                totalOrders: overview._count.id,
                totalCustomers: customerStats,
            },
            trendingProducts: topProducts.map(p => ({
                name: p.title,
                unitsSold: p._sum.quantity,
                revenueGenerated: p._sum.price
            })),
            recentActivity: recentSales.map(o => ({
                amount: o.totalPrice,
                customer: o.customer?.firstName || o.customer?.email || "Guest",
                date: o.createdAt.toISOString().split('T')[0]
            }))
        };

        const systemPrompt = `
        You are an expert E-commerce Data Analyst for Xeno.
        You have access to the following REAL-TIME store data. 
        Answer the user's question based ONLY on this data.
        
        DATA CONTEXT:
        ${JSON.stringify(contextPayload, null, 2)}
        
        GUIDELINES:
        - If the user asks for revenue, give the exact number formatted as currency.
        - If asked about "best products", refer to the trending products list.
        - Be concise, friendly, and professional.
        - If the answer isn't in the data, say "I don't have that specific data point right now."
        `;

        // --- 3. GENERATION LAYER (The "G" in RAG) ---
        // We use Gemini 1.5 Flash for speed and low latency.
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent([
            systemPrompt,
            `User Question: ${message}`
        ]);

        const response = await result.response;
        const reply = response.text();

        res.json({ success: true, reply });

    } catch (error: any) {
        console.error('Gemini Chat Error:', error);
        res.status(500).json({
            success: false,
            reply: "I'm having trouble analyzing the data right now. Please check your API key."
        });
    }
};