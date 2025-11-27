'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import { Order } from '@/types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface OrdersTableProps {
  orders: Order[];
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ orders }) => {
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      paid: 'text-green-700 bg-green-50',
      pending: 'text-yellow-700 bg-yellow-50',
      refunded: 'text-red-700 bg-red-50',
      fulfilled: 'text-blue-700 bg-blue-50',
      unfulfilled: 'text-gray-700 bg-gray-50',
    };
    return colors[status.toLowerCase()] || 'text-gray-700 bg-gray-50';
  };

  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h3>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Order #</TableHeader>
            <TableHeader>Customer</TableHeader>
            <TableHeader>Date</TableHeader>
            <TableHeader>Total</TableHeader>
            <TableHeader>Payment Status</TableHeader>
            <TableHeader>Fulfillment</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">#{order.orderNumber}</TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">
                    {order.customer?.firstName} {order.customer?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{order.customer?.email}</p>
                </div>
              </TableCell>
              <TableCell>{formatDateTime(order.createdAt)}</TableCell>
              <TableCell className="font-semibold">
                {formatCurrency(order.totalPrice)}
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.financialStatus
                  )}`}
                >
                  {order.financialStatus}
                </span>
              </TableCell>
              <TableCell>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    order.fulfillmentStatus || 'unfulfilled'
                  )}`}
                >
                  {order.fulfillmentStatus || 'Unfulfilled'}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
