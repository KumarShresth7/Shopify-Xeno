import cron from 'node-cron';
import prisma from '../config/database.js';
import { ShopifyService } from './shopifyService.js';

export const startSyncScheduler = () => {
    // Run sync every 6 hours (can be configured)
    cron.schedule('0 */6 * * *', async () => {
        console.log('⏰ [SCHEDULER] Starting scheduled Shopify sync...');

        try {
            // Get all tenants with access tokens
            const tenants = await prisma.tenant.findMany({
                where: {
                    accessToken: { not: null },
                },
                select: {
                    id: true,
                    shopDomain: true,
                    accessToken: true,
                },
            });

            console.log(`📊 Found ${tenants.length} tenant(s) to sync`);

            for (const tenant of tenants) {
                try {
                    console.log(`🔄 Syncing data for: ${tenant.shopDomain}`);
                    const shopifyService = new ShopifyService(tenant.shopDomain, tenant.accessToken!);
                    const results = await shopifyService.syncAllData(tenant.id);
                    console.log(`✅ Sync completed for ${tenant.shopDomain}:`, results);
                } catch (error: any) {
                    console.error(`❌ Sync failed for ${tenant.shopDomain}:`, error.message);
                }
            }

            console.log('🎉 Scheduled sync completed');
        } catch (error) {
            console.error('❌ Scheduler error:', error);
        }
    });

    console.log('✅ Sync scheduler started (runs every 6 hours at 00:00, 06:00, 12:00, 18:00)');
};
