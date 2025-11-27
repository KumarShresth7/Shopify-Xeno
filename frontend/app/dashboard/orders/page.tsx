'use client';

import React, { useState, useEffect } from 'react';
import { shopifyAPI } from '@/lib/api';
import { Order } from '@/types';
import { Loading } from '@/components/Loading';
import { OrdersTable } from '@/components/dashboard/OrdersTable';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await shopifyAPI.getOrders();
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">View and manage all orders</p>
      </div>

      <OrdersTable orders={orders} />
    </div>
  );
}
