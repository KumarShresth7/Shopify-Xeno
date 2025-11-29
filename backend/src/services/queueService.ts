import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { ShopifyService } from './shopifyService.js';
import prisma from '../config/database.js';


export const ingestionQueue = new Queue('ingestion-queue', {
    connection: redisConnection,
});


const worker = new Worker('ingestion-queue', async (job: Job) => {
    console.log(`👷 [Worker] Processing job ${job.name} (ID: ${job.id})`);

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