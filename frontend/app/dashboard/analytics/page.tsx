'use client';

import React, { useMemo } from 'react';
import apiClient from '@/lib/api';
import useSWR from 'swr';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Label
} from 'recharts';
import { TrendingUp, ShoppingCart, AlertCircle, RefreshCw, User, CheckCircle2, Clock } from 'lucide-react';

const SEGMENT_COLORS: Record<string, string> = {
  'VIP': '#f59e0b',        // Amber
  'High Value': '#3b82f6', // Blue
  'Regular': '#10b981',    // Emerald
  'New': '#94a3b8',        // Slate
};

const DEFAULT_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];


const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload; 
    return (
      <div className="bg-popover p-3 border border-border shadow-xl rounded-xl min-w-[150px]">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-border">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: data.fill }} />
          <span className="font-bold text-popover-foreground">{data.segment}</span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Count:</span>
            <span className="font-medium text-foreground">{data.customerCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Revenue:</span>
            <span className="font-medium text-emerald-600">₹{data.segmentRevenue.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

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

  // Calculate Total Customers for the Center Label
  const totalCustomers = useMemo(() => {
    return data?.seg?.reduce((acc: number, curr: any) => acc + curr.customerCount, 0) || 0;
  }, [data?.seg]);

  // Add Fill Color to Data
  const chartData = useMemo(() => {
    return data?.seg?.map((entry: any) => ({
      ...entry,
      fill: SEGMENT_COLORS[entry.segment] || DEFAULT_COLORS[0]
    })) || [];
  }, [data?.seg]);

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
    <div className="space-y-8 animate-fade-in pb-10">
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
        <KPICard title="Lost Revenue" value={`₹${data?.carts?.potentialRevenue?.toFixed(2)}`} sub="From abandoned carts" icon={RefreshCw} color="amber" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Top Products Chart */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Top Products by Revenue</h3>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.prod} layout="vertical" margin={{ left: 10, right: 10 }}>
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
                  formatter={(value: any) => [`₹${value}`, 'Revenue']}
                />
                <Bar dataKey="totalRevenue" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* --- CUSTOMER SEGMENTS PIE CHART --- */}
        <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
          <h3 className="text-lg font-bold text-foreground mb-6">Customer Segments</h3>
          <div className="h-[350px] flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}  // Increased for better "Donut" look
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="customerCount"
                  nameKey="segment"
                  stroke="hsl(var(--card))" // Match background for clean separation
                  strokeWidth={2}
                >
                  {chartData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                  
                  {/* Center Label (Makes it look complete) */}
                  <Label 
                    value={totalCustomers} 
                    position="center" 
                    className="fill-foreground text-3xl font-bold"
                  />
                  <Label 
                    value="Customers" 
                    position="center" 
                    dy={24} // Offset text below the number
                    className="fill-muted-foreground text-sm font-medium"
                  />
                </Pie>
                
                {/* Use Custom Tooltip here */}
                <Tooltip content={<CustomTooltip />} />
                
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-foreground text-sm font-medium ml-2">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Abandoned Carts Table */}
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
                          <span className="text-sm font-medium text-foreground">
                            {cart.customerName || 'Guest'}
                          </span>
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

// KPI Card Component
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