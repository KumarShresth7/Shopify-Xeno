'use client';

import React from 'react';
import { MetricCard } from './MetricCard';
import { Users, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';
import { InsightsOverview } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface OverviewProps {
  data: InsightsOverview;
}

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Customers"
        value={data.totalCustomers.toLocaleString()}
        icon={Users}
      />
      <MetricCard
        title="Total Orders"
        value={data.totalOrders.toLocaleString()}
        icon={ShoppingCart}
      />
      <MetricCard
        title="Total Revenue"
        value={formatCurrency(data.totalRevenue)}
        icon={DollarSign}
      />
      <MetricCard
        title="Average Order Value"
        value={formatCurrency(data.averageOrderValue)}
        icon={TrendingUp}
      />
    </div>
  );
};
