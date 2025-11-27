import axios, { AxiosError } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default apiClient;

// API functions
export const authAPI = {
    login: (email: string, password: string) =>
        apiClient.post('/auth/login', { email, password }),
    register: (email: string, password: string, shopDomain: string) =>
        apiClient.post('/auth/register', { email, password, shopDomain }),
    getMe: () => apiClient.get('/auth/me'),
};

export const insightsAPI = {
    getOverview: () => apiClient.get('/insights/overview'),
    getRevenueTrend: (period: string, startDate?: string, endDate?: string) =>
        apiClient.get('/insights/revenue-trend', {
            params: { period, startDate, endDate }
        }),
    getTopCustomers: (limit: number = 5) =>
        apiClient.get('/insights/top-customers', { params: { limit } }),
    getOrdersByDate: (startDate: string, endDate: string) =>
        apiClient.get('/insights/orders', { params: { startDate, endDate } }),
};

export const shopifyAPI = {
    syncData: () => apiClient.post('/shopify/sync'),
    getCustomers: (page: number = 1, limit: number = 20) =>
        apiClient.get('/shopify/customers', { params: { page, limit } }),
    getOrders: (page: number = 1, limit: number = 20) =>
        apiClient.get('/shopify/orders', { params: { page, limit } }),
    getProducts: (page: number = 1, limit: number = 20) =>
        apiClient.get('/shopify/products', { params: { page, limit } }),
};
