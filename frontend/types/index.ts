export interface User {
    id: number;
    email: string;
    tenantId: number;
    tenant?: Tenant;
}

export interface Tenant {
    id: number;
    shopDomain: string;
    email: string;
    createdAt: string;
}

export interface Customer {
    id: number;
    email: string;
    firstName: string;
    lastName: string;
    ordersCount: number;
    totalSpent: number;
    createdAt: string;
}

export interface Order {
    id: number;
    orderNumber: number;
    customer: Customer;
    totalPrice: number;
    subtotalPrice: number;
    totalTax: number;
    financialStatus: string;
    fulfillmentStatus: string;
    createdAt: string;
    lineItems?: LineItem[];
}

export interface Product {
    id: number;
    title: string;
    vendor: string;
    productType: string;
    price: number;
    createdAt: string;
}

export interface LineItem {
    id: number;
    productId: number;
    title: string;
    quantity: number;
    price: number;
}

export interface InsightsOverview {
    totalCustomers: number;
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
}

export interface RevenueData {
    date: string;
    revenue: number;
    orders: number;
}

export interface TopCustomer {
    id: number;
    name: string;
    email: string;
    totalSpent: number;
    ordersCount: number;
}

export interface DateRange {
    startDate: string;
    endDate: string;
}
