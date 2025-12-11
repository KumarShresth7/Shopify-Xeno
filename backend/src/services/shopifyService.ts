import axios from 'axios';
import prisma from '../config/database.js';

export class ShopifyService {
    private shop: string;
    private accessToken: string;
    private apiVersion: string = '2024-01';

    constructor(shop: string, accessToken: string) {
        this.shop = shop;
        this.accessToken = accessToken;
    }

    private async makeRequest(endpoint: string) {
        const url = `https://${this.shop}/admin/api/${this.apiVersion}/${endpoint}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    'X-Shopify-Access-Token': this.accessToken,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            console.error(`Shopify API Error for ${endpoint}:`, error.message);
            throw new Error(`Failed to fetch from Shopify: ${error.message}`);
        }
    }

    async fetchCustomers() {
        return this.makeRequest('customers.json?limit=250');
    }

    async fetchOrders() {
        return this.makeRequest('orders.json?status=any&limit=250');
    }

    async fetchProducts() {
        return this.makeRequest('products.json?limit=250');
    }

    async fetchAbandonedCheckouts() {
        return this.makeRequest('checkouts.json?status=open&limit=250');
    }

    async syncCustomers(tenantId: number) {
        const data = await this.fetchCustomers();
        const customers = data.customers || [];

        for (const customer of customers) {
            await prisma.customer.upsert({
                where: {
                    id_tenantId: {
                        id: BigInt(customer.id),
                        tenantId,
                    },
                },
                update: {
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    updatedAt: new Date(customer.updated_at),
                },
                create: {
                    id: BigInt(customer.id),
                    tenantId,
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    ordersCount: 0,
                    totalSpent: 0,
                    createdAt: new Date(customer.created_at),
                    updatedAt: new Date(customer.updated_at),
                },
            });
        }

        return customers.length;
    }

    async syncProducts(tenantId: number) {
        const data = await this.fetchProducts();
        const products = data.products || [];

        for (const product of products) {
            const variant = product.variants?.[0];
            await prisma.product.upsert({
                where: {
                    id_tenantId: {
                        id: BigInt(product.id),
                        tenantId,
                    },
                },
                update: {
                    title: product.title,
                    vendor: product.vendor,
                    productType: product.product_type,
                    price: variant ? parseFloat(variant.price) : 0,
                    inventory: variant ? variant.inventory_quantity : 0,
                    updatedAt: new Date(product.updated_at),
                },
                create: {
                    id: BigInt(product.id),
                    tenantId,
                    title: product.title,
                    vendor: product.vendor,
                    productType: product.product_type,
                    price: variant ? parseFloat(variant.price) : 0,
                    inventory: variant ? variant.inventory_quantity : 0,
                    createdAt: new Date(product.created_at),
                    updatedAt: new Date(product.updated_at),
                },
            });
        }

        return products.length;
    }

    async syncOrders(tenantId: number) {
        const data = await this.fetchOrders();
        const orders = data.orders || [];

        for (const order of orders) {
            // 1. Link Order to Checkout
            if (order.checkout_id) {
                try {
                    await prisma.checkout.updateMany({
                        where: { id: BigInt(order.checkout_id), tenantId },
                        data: { completed: true, updatedAt: new Date() }
                    });
                } catch (e) { /* ignore */ }
            }

            // 2. Save Order
            await prisma.order.upsert({
                where: {
                    id_tenantId: {
                        id: BigInt(order.id),
                        tenantId,
                    },
                },
                update: {
                    customerId: order.customer ? BigInt(order.customer.id) : null,
                    orderNumber: order.order_number,
                    totalPrice: parseFloat(order.total_price),
                    subtotalPrice: parseFloat(order.subtotal_price || '0'),
                    totalTax: parseFloat(order.total_tax || '0'),
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

            // 3. Save Line Items
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
        }
        return orders.length;
    }

    async syncAbandonedCheckouts(tenantId: number) {
        const data = await this.fetchAbandonedCheckouts();
        const checkouts = data.checkouts || [];

        for (const checkout of checkouts) {
            // Ensure Customer Exists First
            if (checkout.customer) {
                await prisma.customer.upsert({
                    where: { id_tenantId: { id: BigInt(checkout.customer.id), tenantId } },
                    update: {
                        email: checkout.customer.email,
                        firstName: checkout.customer.first_name,
                        lastName: checkout.customer.last_name,
                        updatedAt: new Date(checkout.customer.updated_at || new Date()),
                    },
                    create: {
                        id: BigInt(checkout.customer.id),
                        tenantId,
                        email: checkout.customer.email,
                        firstName: checkout.customer.first_name,
                        lastName: checkout.customer.last_name,
                        ordersCount: 0,
                        totalSpent: 0,
                        createdAt: new Date(checkout.customer.created_at || new Date()),
                        updatedAt: new Date(checkout.customer.updated_at || new Date()),
                    },
                });
            }

            await prisma.abandonedCart.upsert({
                where: {
                    cartToken_tenantId: {
                        cartToken: checkout.token,
                        tenantId,
                    },
                },
                update: {
                    totalPrice: parseFloat(checkout.total_price || '0'),
                    abandonedAt: new Date(checkout.updated_at),
                    lineItems: checkout.line_items,
                    customerEmail: checkout.email || checkout.customer?.email,
                },
                create: {
                    tenantId,
                    cartToken: checkout.token,
                    customerId: checkout.customer?.id ? BigInt(checkout.customer.id) : null,
                    customerEmail: checkout.email || checkout.customer?.email,
                    totalPrice: parseFloat(checkout.total_price || '0'),
                    abandonedAt: new Date(checkout.updated_at),
                    lineItems: checkout.line_items,
                    createdAt: new Date(checkout.created_at || checkout.updated_at),
                },
            });
        }
        return checkouts.length;
    }

    // --- RECALCULATION HELPERS ---

    private async recalculateCustomerTotals(tenantId: number) {
        console.log(`💰 Recalculating customer totals for tenant ${tenantId}...`);

        const aggregations = await prisma.order.groupBy({
            by: ['customerId'],
            where: { tenantId, customerId: { not: null } },
            _sum: { totalPrice: true },
            _count: { id: true }
        });

        for (const agg of aggregations) {
            if (!agg.customerId) continue;

            await prisma.customer.update({
                where: { id_tenantId: { id: agg.customerId, tenantId } },
                data: {
                    totalSpent: agg._sum.totalPrice || 0,
                    ordersCount: agg._count.id
                }
            });
        }
        console.log(`✅ Updated ${aggregations.length} customers with correct totals.`);
    }

    private async calculateGlobalStats(tenantId: number) {
        const [ordersAgg, customersCount] = await Promise.all([
            prisma.order.aggregate({
                where: { tenantId },
                _sum: { totalPrice: true },
                _count: { id: true }
            }),
            prisma.customer.count({ where: { tenantId } })
        ]);

        const totalRevenue = parseFloat(ordersAgg._sum.totalPrice?.toString() || '0');
        const totalOrders = ordersAgg._count.id;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            totalOrders,
            totalCustomers: customersCount,
            averageOrderValue: parseFloat(averageOrderValue.toFixed(2))
        };
    }

    async syncAllData(tenantId: number) {
        console.log(`🔄 Starting sync for tenant ${tenantId}...`);
        const results = {
            customers: 0,
            products: 0,
            orders: 0,
            abandonedCarts: 0,
            stats: {}
        };

        try { results.customers = await this.syncCustomers(tenantId); }
        catch (e) { console.error('Error syncing customers:', e); }

        try { results.products = await this.syncProducts(tenantId); }
        catch (e) { console.error('Error syncing products:', e); }

        try { results.orders = await this.syncOrders(tenantId); }
        catch (e) { console.error('Error syncing orders:', e); }

        try { results.abandonedCarts = await this.syncAbandonedCheckouts(tenantId); }
        catch (e) { console.error('Error syncing abandoned checkouts:', e); }

        // --- FINAL STEPS ---
        try {
            await this.recalculateCustomerTotals(tenantId);
            const stats = await this.calculateGlobalStats(tenantId);
            results.stats = stats;
            console.log(`📊 Sync Stats: Revenue=$${stats.totalRevenue}, Orders=${stats.totalOrders}, Customers=${stats.totalCustomers}, AOV=$${stats.averageOrderValue}`);
        } catch (error) {
            console.error('❌ Error calculating final stats:', error);
        }

        return results;
    }
}