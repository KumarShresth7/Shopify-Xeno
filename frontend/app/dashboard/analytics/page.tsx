'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, ShoppingCart, AlertCircle } from 'lucide-react';

export default function AnalyticsPage() {
  const [abandonedCarts, setAbandonedCarts] = useState<any>(null);
  const [conversion, setConversion] = useState<any>(null);
  const [productPerf, setProductPerf] = useState<any[]>([]);
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const [cartsRes, convRes, prodRes, segRes] = await Promise.all([
        apiClient.get('/insights/abandoned-carts'),
        apiClient.get('/insights/conversion-metrics'),
        apiClient.get('/insights/product-performance?limit=10'),
        apiClient.get('/insights/customer-segments'),
      ]);

      setAbandonedCarts(cartsRes.data.data);
      setConversion(convRes.data.data);
      setProductPerf(prodRes.data.data);
      setSegments(segRes.data.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Advanced Analytics</h1>
        <p className="text-gray-600 mt-2">Deep insights into your store performance</p>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-green-600" size={20} />
            <h3 className="text-sm text-gray-600">Conversion Rate</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">{conversion?.conversionRate || 0}%</p>
          <p className="text-xs text-gray-500 mt-1">Checkout to order conversion</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="text-blue-600" size={20} />
            <h3 className="text-sm text-gray-600">Total Checkouts</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{conversion?.totalCheckouts || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Initiated checkouts</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="text-red-600" size={20} />
            <h3 className="text-sm text-gray-600">Abandoned Carts</h3>
          </div>
          <p className="text-3xl font-bold text-red-600">{abandonedCarts?.totalAbandoned || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="text-orange-600" size={20} />
            <h3 className="text-sm text-gray-600">Potential Revenue</h3>
          </div>
          <p className="text-3xl font-bold text-orange-600">
            ${abandonedCarts?.potentialRevenue?.toFixed(2) || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">From abandoned carts</p>
        </div>
      </div>

      {/* Product Performance */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Top Products by Revenue</h2>
        {productPerf.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={productPerf}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="title" 
                angle={-45} 
                textAnchor="end" 
                height={120}
                interval={0}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="totalRevenue" fill="#8884d8" name="Revenue ($)" />
              <Bar dataKey="totalQuantitySold" fill="#82ca9d" name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12">
            <Package className="mx-auto text-gray-400 mb-2" size={48} />
            <p className="text-gray-500">No product performance data available</p>
          </div>
        )}
      </div>

      {/* Customer Segments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Customer Segments</h2>
        {segments.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.segment}: ${entry.customerCount}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="customerCount"
                >
                  {segments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-700 mb-3">Segment Breakdown</h3>
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="border-l-4 pl-4 py-2"
                  style={{ borderColor: COLORS[index % COLORS.length] }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-gray-900">{segment.segment}</h4>
                      <p className="text-sm text-gray-600">
                        {segment.customerCount} customers
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        ${segment.segmentRevenue.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Avg: ${segment.avgCustomerValue.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No customer segment data available</p>
          </div>
        )}
      </div>

      {/* Recent Abandoned Carts */}
      {abandonedCarts?.recentCarts && abandonedCarts.recentCarts.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Abandoned Carts</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Customer Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Cart Value</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Abandoned Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Days Ago</th>
                </tr>
              </thead>
              <tbody>
                {abandonedCarts.recentCarts.map((cart: any, index: number) => {
                  const daysAgo = Math.floor(
                    (Date.now() - new Date(cart.abandonedAt).getTime()) / (1000 * 60 * 60 * 24)
                  );
                  return (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        {cart.customerEmail || <span className="text-gray-400 italic">Guest</span>}
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ${Number(cart.totalPrice).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(cart.abandonedAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          daysAgo <= 1 ? 'bg-red-100 text-red-800' : 
                          daysAgo <= 7 ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
