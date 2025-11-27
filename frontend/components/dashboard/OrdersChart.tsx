'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card } from '../ui/Card';
import { RevenueData } from '@/types';
import { formatDate } from '@/lib/utils';

interface OrdersChartProps {
  data: RevenueData[];
}

export const OrdersChart: React.FC<OrdersChartProps> = ({ data }) => {
  const formattedData = data.map((item) => ({
    ...item,
    date: formatDate(item.date),
  }));

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Orders by Date</h3>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={formattedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            stroke="#6b7280"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar 
            dataKey="orders" 
            fill="#0ea5e9" 
            radius={[8, 8, 0, 0]}
            name="Orders"
          />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};
