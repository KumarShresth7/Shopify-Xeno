'use client';

import { useState, useEffect } from 'react';
import { insightsAPI } from '@/lib/api';
import { InsightsOverview, RevenueData, TopCustomer } from '@/types';

export const useInsights = (startDate?: string, endDate?: string) => {
    const [overview, setOverview] = useState<InsightsOverview | null>(null);
    const [revenueTrend, setRevenueTrend] = useState<RevenueData[]>([]);
    const [topCustomers, setTopCustomers] = useState<TopCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchInsights = async () => {
            try {
                setLoading(true);
                const [overviewRes, trendRes, customersRes] = await Promise.all([
                    insightsAPI.getOverview(),
                    insightsAPI.getRevenueTrend('daily', startDate, endDate),
                    insightsAPI.getTopCustomers(5),
                ]);

                setOverview(overviewRes.data);
                setRevenueTrend(trendRes.data);
                setTopCustomers(customersRes.data);
                setError(null);
            } catch (err) {
                setError('Failed to fetch insights');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchInsights();
    }, [startDate, endDate]);

    return { overview, revenueTrend, topCustomers, loading, error };
};
