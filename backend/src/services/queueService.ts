import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { ShopifyService } from './shopifyService.js';
import prisma from '../config/database.js';

export const ingestionQueue = new Queue('ingestion-queue', {
    connection: redisConnection,
});

const worker = new Worker('ingestion-queue', async (job: Job) => {
    console.log(`👷 [Worker] Picking up job: ${job.name} (Type: ${job.data.type || 'sync'})`);

    try {

        if (job.name === 'sync-tenant') {
            const { tenantId, shopDomain, accessToken } = job.data;
            const service = new ShopifyService(shopDomain, accessToken);
            await service.syncAllData(tenantId);
            console.log(`✅ [Worker] Sync completed for tenant ${tenantId}`);
        }


        else if (job.name === 'process-webhook') {
            const { type, payload, tenantId } = job.data;


            if (type === 'cart-abandoned') {
                console.log(`🛒 [DB] Upserting Abandoned Cart: ${payload.token}`);
                await prisma.abandonedCart.upsert({
                    where: { cartToken_tenantId: { cartToken: payload.token, tenantId } },
                    update: {
                        totalPrice: parseFloat(payload.total_price || '0'),
                        abandonedAt: new Date(payload.updated_at),
                        lineItems: payload.line_items,
                    },
                    create: {
                        tenantId,
                        cartToken: payload.token,
                        customerId: payload.customer?.id ? BigInt(payload.customer.id) : null,
                        customerEmail: payload.email || payload.customer?.email,
                        totalPrice: parseFloat(payload.total_price || '0'),
                        abandonedAt: new Date(payload.updated_at),
                        lineItems: payload.line_items,
                    },
                });
            }


            else if (type === 'checkout-started') {
                console.log(`💳 [DB] Upserting Checkout: ${payload.id}`);
                await prisma.checkout.upsert({
                    where: { id_tenantId: { id: BigInt(payload.id), tenantId } },
                    update: {
                        totalPrice: parseFloat(payload.total_price || '0'),
                        completed: payload.completed_at ? true : false,
                        updatedAt: new Date(payload.updated_at),
                    },
                    create: {
                        id: BigInt(payload.id),
                        tenantId,
                        customerId: payload.customer?.id ? BigInt(payload.customer.id) : null,
                        customerEmail: payload.email || payload.customer?.email,
                        totalPrice: parseFloat(payload.total_price || '0'),
                        completed: payload.completed_at ? true : false,
                        createdAt: new Date(payload.created_at),
                        updatedAt: new Date(payload.updated_at),
                    },
                });
            }


            else if (type === 'order-created') {
                const order = payload;
                console.log(`📦 [DB] Processing Order #${order.order_number}`);


                if (order.checkout_id) {
                    try {
                        await prisma.checkout.updateMany({
                            where: { id: BigInt(order.checkout_id), tenantId },
                            data: { completed: true, updatedAt: new Date() }
                        });
                        console.log(`✅ [DB] Linked Checkout ${order.checkout_id} marked as completed.`);
                    } catch (err) {
                        console.warn(`⚠️ Could not link checkout ${order.checkout_id}`);
                    }
                }


                if (order.customer) {
                    await prisma.customer.upsert({
                        where: { id_tenantId: { id: BigInt(order.customer.id), tenantId } },
                        update: {
                            email: order.customer.email,
                            firstName: order.customer.first_name,
                            lastName: order.customer.last_name,
                            updatedAt: new Date(order.customer.updated_at),

                        },
                        create: {
                            id: BigInt(order.customer.id),
                            tenantId,
                            email: order.customer.email,
                            firstName: order.customer.first_name,
                            lastName: order.customer.last_name,
                            ordersCount: 1,
                            totalSpent: 0,
                            createdAt: new Date(order.customer.created_at),
                            updatedAt: new Date(order.customer.updated_at),
                        },
                    });
                }


                await prisma.order.upsert({
                    where: { id_tenantId: { id: BigInt(order.id), tenantId } },
                    update: {
                        customerId: order.customer ? BigInt(order.customer.id) : null,
                        totalPrice: parseFloat(order.total_price),
                        financialStatus: order.financial_status,
                        fulfillmentStatus: order.fulfillment_status,
                        updatedAt: new Date(order.updated_at),
                    },
                    create: {
                        id: BigInt(order.id),
                        tenantId,
                        customerId: order.customer ? BigInt(order.customer.id) : null,
                        orderNumber: order.order_number,
                        totalPrice: parseFloat(order.total_price),
                        subtotalPrice: parseFloat(order.subtotal_price || '0'),
                        totalTax: parseFloat(order.total_tax || '0'),
                        financialStatus: order.financial_status,
                        fulfillmentStatus: order.fulfillment_status,
                        createdAt: new Date(order.created_at),
                        updatedAt: new Date(order.updated_at),
                    },
                });


                await prisma.orderLineItem.deleteMany({
                    where: { orderId: BigInt(order.id), tenantId },
                });

                if (order.line_items && order.line_items.length > 0) {
                    for (const item of order.line_items) {
                        await prisma.orderLineItem.create({
                            data: {
                                orderId: BigInt(order.id),
                                tenantId,
                                productId: item.product_id ? BigInt(item.product_id) : null,
                                quantity: item.quantity,
                                price: parseFloat(item.price),
                                title: item.title,
                            },
                        });
                    }
                }


                if (order.customer) {
                    const customerId = BigInt(order.customer.id);


                    const aggregate = await prisma.order.aggregate({
                        where: { customerId, tenantId },
                        _sum: { totalPrice: true },
                        _count: { id: true }
                    });


                    await prisma.customer.update({
                        where: { id_tenantId: { id: customerId, tenantId } },
                        data: {
                            totalSpent: aggregate._sum.totalPrice || 0,
                            ordersCount: aggregate._count.id || 0
                        }
                    });
                    console.log(`💰 [DB] Recalculated Customer ${customerId}: Total Spent = ${aggregate._sum.totalPrice}`);
                }

                console.log(`✅ [DB] Order #${order.order_number} saved fully!`);
            }
        }
    } catch (error: any) {
        console.error(`❌ [Worker] Job ${job.id} failed:`, error.message);
        throw error;
    }
}, {
    connection: redisConnection,
    concurrency: 5,
});

worker.on('completed', (job) => {
    console.log(`🎉 [Worker] Job ${job.id} finished successfully`);
});

worker.on('failed', (job, err) => {
    console.log(`💀 [Worker] Job ${job?.id} failed with ${err.message}`);
});