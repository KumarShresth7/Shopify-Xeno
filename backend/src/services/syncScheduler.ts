import cron from 'node-cron';
import prisma from '../config/database.js';
import { ingestionQueue } from './queueService.js'; // Import the queue

export const startSyncScheduler = () => {
    // Run every 6 hours
    cron.schedule('0 */6 * * *', async () => {
        console.log('⏰ [SCHEDULER] Queueing scheduled syncs...');

        const tenants = await prisma.tenant.findMany({
            where: { accessToken: { not: null } },
        });

        for (const tenant of tenants) {
            // Add job to Redis Queue
            await ingestionQueue.add('sync-tenant', {
                tenantId: tenant.id,
                shopDomain: tenant.shopDomain,
                accessToken: tenant.accessToken,
            }, {
                attempts: 3, // Retry 3 times if failed
                backoff: { type: 'exponential', delay: 1000 },
            });
            console.log(`Vk -> Queued sync for ${tenant.shopDomain}`);
        }
    });
};