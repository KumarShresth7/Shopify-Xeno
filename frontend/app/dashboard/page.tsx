'use client';

import React, { useState } from 'react';
import { useInsights } from '@/hooks/useInsights';
import { Loading } from '@/components/Loading';
import { Overview } from '@/components/dashboard/Overview';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { OrdersChart } from '@/components/dashboard/OrdersChart';
import { TopCustomers } from '@/components/dashboard/TopCustomers';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';

export default function DashboardPage() {
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  const { overview, revenueTrend, topCustomers, loading, error } = useInsights(
    dateRange.startDate,
    dateRange.endDate
  );

  const handleDateChange = (startDate: string, endDate: string) => {
    setDateRange({ startDate, endDate });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Monitor your Shopify store performance</p>
      </div>

      <DateRangePicker onDateChange={handleDateChange} />

      {overview && <Overview data={overview} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {revenueTrend.length > 0 && <RevenueChart data={revenueTrend} />}
        {revenueTrend.length > 0 && <OrdersChart data={revenueTrend} />}
      </div>

      {topCustomers.length > 0 && <TopCustomers customers={topCustomers} />}
    </div>
  );
}
