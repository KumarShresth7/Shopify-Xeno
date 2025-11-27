'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/shopify/orders?page=${currentPage}&limit=20`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: any = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      refunded: 'bg-red-100 text-red-800',
      fulfilled: 'bg-blue-100 text-blue-800',
      unfulfilled: 'bg-gray-100 text-gray-800',
      partial: 'bg-orange-100 text-orange-800',
    };
    return colors[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-2">View and manage all orders</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Order #</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Total</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Financial Status</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Fulfillment</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.length > 0 ? (
                    orders.map((order) => (
                      <tr key={order.id.toString()} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6 font-medium">#{order.orderNumber}</td>
                        <td className="py-4 px-6">
                          {order.customer 
                            ? `${order.customer.firstName || ''} ${order.customer.lastName || ''}`.trim()
                            : 'Guest'}
                        </td>
                        <td className="py-4 px-6 font-semibold text-green-600">
                          ${Number(order.totalPrice).toFixed(2)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.financialStatus)}`}>
                            {order.financialStatus}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.fulfillmentStatus || 'unfulfilled')}`}>
                            {order.fulfillmentStatus || 'unfulfilled'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-500">
                        No orders found. Sync your Shopify data to see orders.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing {orders.length} of {pagination.total} orders
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
