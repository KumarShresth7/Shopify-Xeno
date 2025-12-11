'use client';

import React from 'react';
import apiClient from '@/lib/api';
import useSWR from 'swr';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, AlertCircle, RefreshCw, User, Calendar, CheckCircle2, Clock } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const fetchAnalyticsData = async () => {
  const [carts, conv, prod, seg] = await Promise.all([
    apiClient.get('/insights/abandoned-carts'),
    apiClient.get('/insights/conversion-metrics'),
    apiClient.get('/insights/product-performance?limit=8'),
    apiClient.get('/insights/customer-segments'),
  ]);
  
  return {
    carts: carts.data.data,
    conv: conv.data.data,
    prod: prod.data.data,
    seg: seg.data.data,
  };
};

export default function AnalyticsPage() {
  const { data, error, isLoading } = useSWR('analytics-dashboard', fetchAnalyticsData, {
    refreshInterval: 5000,
    revalidateOnFocus: true,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load analytics data.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Live Analytics</h1>
          <p className="text-muted-foreground mt-1 text-sm flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Updating in real-time
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Conversion Rate" value={`${data?.conv?.conversionRate}%`} sub="Checkout to Order" icon={TrendingUp} color="emerald" />
        <KPICard title="Total Checkouts" value={data?.conv?.totalCheckouts} sub="Initiated sessions" icon={ShoppingCart} color="blue" />
        <KPICard title="Abandoned Carts" value={data?.carts?.totalAbandoned} sub="Last 30 days" icon={AlertCircle} color="red" />
        <KPICard title="Lost Revenue" value={`$${data?.carts?.potentialRevenue?.toFixed(2)}`} sub="From abandoned carts" icon={RefreshCw} color="amber" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Products by Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.prod} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" width={100} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted)/0.3)' }} 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px', 
                    color: 'hsl(var(--popover-foreground))',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Customer Segments</h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.seg}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="customerCount"
                  stroke="hsl(var(--card))"
                >
                  {data?.seg.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '8px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-foreground">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Abandoned Carts Table (Updated) */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="text-lg font-bold text-foreground">Abandoned Carts</h3>
            <p className="text-sm text-muted-foreground">Recent carts that were not completed.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {data?.carts?.recentCarts?.map((cart: any, index: number) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-muted/50">
                          <User size={16} className="text-muted-foreground" />
                        </div>
                        <div className="flex flex-col">
                          {/* Display Name clearly */}
                          <span className="text-sm font-medium text-foreground">
                            {cart.customerName || 'Guest'}
                          </span>
                          {/* Display Email as secondary info */}
                          {cart.customerEmail && (
                            <span className="text-xs text-muted-foreground">{cart.customerEmail}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      ₹{Number(cart.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(cart.abandonedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!data?.carts?.recentCarts || data.carts.recentCarts.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      No abandoned carts found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Checkouts Feed */}
        <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border bg-muted/20">
            <h3 className="text-lg font-bold text-foreground">Live Checkouts Feed</h3>
            <p className="text-sm text-muted-foreground">Real-time "Checkout Started" events.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Value</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {data?.conv?.recentCheckouts?.map((checkout: any, index: number) => (
                  <tr key={index} className="hover:bg-muted/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <ShoppingCart size={16} className="text-blue-500" />
                        <span className="text-sm font-medium text-foreground">{checkout.customerEmail || 'Guest'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground">
                      ₹{Number(checkout.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {checkout.completed ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 size={12} /> Purchased
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          <Clock size={12} /> In Progress
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {(!data?.conv?.recentCheckouts || data.conv.recentCheckouts.length === 0) && (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-muted-foreground">
                      No recent checkout events.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ title, value, sub, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    red: 'bg-red-500/10 text-red-600 dark:text-red-400',
    amber: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  };

  return (
    <div className="bg-card p-6 rounded-xl border border-border shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-muted-foreground text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-foreground mt-1">{value || 0}</p>
      <p className="text-xs text-muted-foreground mt-1">{sub}</p>
    </div>
  );
};