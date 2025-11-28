'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { Users, ShoppingCart, DollarSign, Package, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Custom Tooltip Component for better aesthetics
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-slate-100 shadow-lg rounded-xl">
        <p className="text-sm font-semibold text-slate-700 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 capitalize">{entry.name}:</span>
            <span className="font-medium text-slate-900">
              {entry.name === 'revenue' ? '$' : ''}{entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [overview, setOverview] = useState<any>(null);
  const [revenueTrend, setRevenueTrend] = useState<any[]>([]);
  const [topCustomers, setTopCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [overviewRes, trendRes, customersRes] = await Promise.all([
        apiClient.get('/insights/overview'),
        apiClient.get('/insights/revenue-trend'),
        apiClient.get('/insights/top-customers?limit=5'),
      ]);
      setOverview(overviewRes.data.data);
      setRevenueTrend(trendRes.data.data);
      setTopCustomers(customersRes.data.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="relative">
          <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
        </div>
      </div>
    );
  }

  const metrics = [
    { title: 'Total Revenue', value: `$${overview?.totalRevenue?.toFixed(2) || 0}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '+12.5%' },
    { title: 'Total Orders', value: overview?.totalOrders || 0, icon: ShoppingCart, color: 'text-blue-600', bg: 'bg-blue-50', trend: '+4.2%' },
    { title: 'Total Customers', value: overview?.totalCustomers || 0, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50', trend: '+8.1%' },
    { title: 'Avg Order Value', value: `$${overview?.averageOrderValue?.toFixed(2) || 0}`, icon: Package, color: 'text-orange-600', bg: 'bg-orange-50', trend: '-2.4%' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-slate-500 mt-1">Overview of your store's performance today.</p>
        </div>
        <div className="text-sm text-slate-500 bg-white px-3 py-1 rounded-md border border-slate-200 shadow-sm">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const isPositive = metric.trend.startsWith('+');
          return (
            <div key={index} className="bg-white rounded-xl p-6 border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className={`${metric.bg} ${metric.color} p-3 rounded-lg`}>
                  <Icon size={22} />
                </div>
                <div className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                  isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  {isPositive ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
                  {metric.trend}
                </div>
              </div>
              <h3 className="text-slate-500 text-sm font-medium">{metric.title}</h3>
              <p className="text-2xl font-bold text-slate-900 mt-1">{metric.value}</p>
            </div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Revenue Trend</h2>
              <p className="text-sm text-slate-500">Revenue vs Orders over time</p>
            </div>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  dy={10}
                />
                <YAxis 
                  yAxisId="left" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12}} 
                  tickFormatter={(value) => `$${value}`}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  axisLine={false} 
                  tickLine={false} 
                  hide
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563eb" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="revenue"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  dot={false}
                  name="orders"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Top Spenders</h2>
          <div className="space-y-6">
            {topCustomers.length > 0 ? (
              topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold group-hover:bg-blue-100 group-hover:text-blue-600 transition-colors">
                      {customer.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.ordersCount} orders</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">${customer.totalSpent.toFixed(2)}</p>
                    <p className="text-xs text-emerald-600 font-medium">VIP</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-sm">No data available</div>
            )}
          </div>
          <button className="w-full mt-6 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All Customers
          </button>
        </div>
      </div>
    </div>
  );
}