'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { TrendingUp, ShoppingCart, AlertCircle, RefreshCw } from 'lucide-react';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AnalyticsPage() {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [carts, conv, prod, seg] = await Promise.all([
        apiClient.get('/insights/abandoned-carts'),
        apiClient.get('/insights/conversion-metrics'),
        apiClient.get('/insights/product-performance?limit=8'),
        apiClient.get('/insights/customer-segments'),
      ]);
      setData({
        carts: carts.data.data,
        conv: conv.data.data,
        prod: prod.data.data,
        seg: seg.data.data,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-blue-600 animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 mt-1 text-sm">Deep dive into your store performance metrics.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KPICard title="Conversion Rate" value={`${data.conv?.conversionRate}%`} sub="Checkout to Order" icon={TrendingUp} color="emerald" />
        <KPICard title="Total Checkouts" value={data.conv?.totalCheckouts} sub="Initiated sessions" icon={ShoppingCart} color="blue" />
        <KPICard title="Abandoned Carts" value={data.carts?.totalAbandoned} sub="Last 30 days" icon={AlertCircle} color="red" />
        <KPICard title="Lost Revenue" value={`$${data.carts?.potentialRevenue?.toFixed(2)}`} sub="From abandoned carts" icon={RefreshCw} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Product Performance Chart */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Top Products by Revenue</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.prod} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="title" type="category" width={100} tick={{ fontSize: 11 }} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="totalRevenue" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Segments Pie */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Customer Segments</h3>
          <div className="h-80 flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.seg}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="customerCount"
                >
                  {data.seg.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

const KPICard = ({ title, value, sub, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    amber: 'bg-amber-50 text-amber-600',
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-lg ${colors[color]}`}>
          <Icon size={20} />
        </div>
      </div>
      <h3 className="text-slate-500 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value || 0}</p>
      <p className="text-xs text-slate-400 mt-1">{sub}</p>
    </div>
  );
};