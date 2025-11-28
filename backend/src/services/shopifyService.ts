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
            console.log('🔑 Token Scopes:', response.headers['x-shopify-access-token-scopes']);
            console.log('Response data: ', response.data)
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
                    ordersCount: customer.orders_count || 0,
                    totalSpent: parseFloat(customer.total_spent || '0'),
                    updatedAt: new Date(customer.updated_at),
                },
                create: {
                    id: BigInt(customer.id),
                    tenantId,
                    email: customer.email,
                    firstName: customer.first_name,
                    lastName: customer.last_name,
                    ordersCount: customer.orders_count || 0,
                    totalSpent: parseFloat(customer.total_spent || '0'),
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
                    updatedAt: new Date(product.updated_at),
                },
                create: {
                    id: BigInt(product.id),
                    tenantId,
                    title: product.title,
                    vendor: product.vendor,
                    productType: product.product_type,
                    price: variant ? parseFloat(variant.price) : 0,
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

            // Delete existing line items for this order
            await prisma.orderLineItem.deleteMany({
                where: {
                    orderId: BigInt(order.id),
                    tenantId,
                },
            });

            // Insert line items
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

    async syncAllData(tenantId: number) {
        console.log(`🔄 Starting sync for tenant ${tenantId}...`);
        const results = {
            customers: 0,
            products: 0,
            orders: 0,
        };

        try {
            results.customers = await this.syncCustomers(tenantId);
            console.log(`✅ Synced ${results.customers} customers`);
        } catch (error) {
            console.error('❌ Error syncing customers:', error);
        }

        try {
            results.products = await this.syncProducts(tenantId);
            console.log(`✅ Synced ${results.products} products`);
        } catch (error) {
            console.error('❌ Error syncing products:', error);
        }

        try {
            results.orders = await this.syncOrders(tenantId);
            console.log(`✅ Synced ${results.orders} orders`);
        } catch (error) {
            console.error('❌ Error syncing orders:', error);
        }

        return results;
    }
}
