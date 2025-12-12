'use client';

import React from 'react';
import apiClient from '@/lib/api';
import useSWR from 'swr';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, ShoppingCart, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Fetcher function that gets all data in parallel
const fetchDashboardData = async () => {
  const [overviewRes, trendRes, customersRes] = await Promise.all([
    apiClient.get('/insights/overview'),
    apiClient.get('/insights/revenue-trend'),
    apiClient.get('/insights/top-customers?limit=5'),
  ]);
  return {
    overview: overviewRes.data.data,
    revenueTrend: trendRes.data.data,
    topCustomers: customersRes.data.data,
  };
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover p-4 border border-border shadow-xl rounded-xl">
        <p className="text-sm font-semibold text-popover-foreground mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground capitalize">{entry.name}:</span>
            <span className="font-medium text-popover-foreground">
              {entry.name === 'revenue' ? '₹' : ''}{entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR('dashboard-overview', fetchDashboardData);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
      </div>
    );
  }

  // Safely access data
  const { overview, revenueTrend, topCustomers } = data || {};

  const metrics = [
    { title: 'Total Revenue', value: `₹${overview?.totalRevenue?.toFixed(2) || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-500/10', trend: '+12.5%' },
    { title: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-500/10', trend: '+4.2%' },
    { title: 'Total Customers', value: overview?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-500/10', trend: '+8.1%' },
    { title: 'Avg Order Value', value: `₹${overview?.averageOrderValue?.toFixed(2) || 0}`, icon: Package, color: 'text-orange-600', bg: 'bg-orange-500/10', trend: '-2.4%' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Overview of your store's performance today.</p>
        </div>
        <div className="text-sm text-muted-foreground bg-card px-3 py-1 rounded-md border border-border shadow-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend.startsWith('+');
          return (
            <div key={index} className="bg-card rounded-xl p-6 border border-border shadow-sm hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-4">
                <div className={`${metric.bg} ${metric.color} p-3 rounded-lg`}>
                  <Icon size={22} />
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
                }`}>
                  {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {metric.trend}
                </div>
              </div>
              <h3 className="text-muted-foreground text-sm font-medium">{metric.title}</h3>
              <p className="text-2xl font-bold text-foreground mt-1">{metric.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card rounded-xl border border-border shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-foreground">Revenue Trend</h2>
              <p className="text-sm text-muted-foreground">Revenue vs Orders over time</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 12}} 
                  tickFormatter={(value) => `₹${value}`}
                />
                <YAxis yAxisId="right" orientation="right" hide />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border shadow-sm p-6">
          <h2 className="text-lg font-bold text-foreground mb-6">Top Spenders</h2>
          <div className="space-y-6">
            {topCustomers && topCustomers.length > 0 ? (
              topCustomers.map((customer: any, index: number) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                      <p className="text-xs text-muted-foreground">{customer.ordersCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">₹{customer.totalSpent.toFixed(2)}</p>
                    <p className={`text-xs font-medium ${
                      customer.tier === 'VIP' ? 'text-emerald-600' : 
                      customer.tier === 'High Value' ? 'text-blue-600' : 'text-slate-500'
                    }`}>
                      {customer.tier}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">No data available</div>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-primary font-medium hover:bg-secondary rounded-lg transition-colors">
            View All Customers
          </button>
        </div>
      </div>
    </div>
  );
}