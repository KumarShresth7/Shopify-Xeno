'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Users, ShoppingCart, DollarSign, Package } from 'lucide-react';

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
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metrics = [
    {
      title: 'Total Customers',
      value: overview?.totalCustomers || 0,
      icon: Users,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: overview?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `$${overview?.totalRevenue?.toFixed(2) || 0}`,
      icon: DollarSign,
      color: 'bg-purple-500',
    },
    {
      title: 'Avg Order Value',
      value: `$${overview?.averageOrderValue?.toFixed(2) || 0}`,
      icon: Package,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your Shopify analytics dashboard</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{metric.value}</p>
                </div>
                <div className={`${metric.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Revenue Trend (Last 30 Days)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue ($)" strokeWidth={2} />
            <Line type="monotone" dataKey="orders" stroke="#82ca9d" name="Orders" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top 5 Customers by Spend</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Orders</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Total Spent</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.length > 0 ? (
                topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">{customer.name}</td>
                    <td className="py-3 px-4 text-gray-600">{customer.email}</td>
                    <td className="py-3 px-4">{customer.ordersCount}</td>
                    <td className="py-3 px-4 font-semibold text-green-600">
                      ${customer.totalSpent.toFixed(2)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500">
                    No customers yet. Sync your Shopify data to see insights.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
