'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';

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
      const response = await apiClient.get(`/shopify/orders?page=${currentPage}&limit=15`);
      setOrders(response.data.orders);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: any = {
      paid: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      refunded: 'bg-red-500/10 text-red-600 border-red-500/20',
      fulfilled: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      unfulfilled: 'bg-muted text-muted-foreground border-border',
    };
    const style = styles[status?.toLowerCase()] || styles.unfulfilled;
    
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} inline-flex items-center gap-1.5 capitalize`}>
        <span className={`w-1.5 h-1.5 rounded-full bg-current opacity-60`} />
        {status || 'Unknown'}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1 text-sm">Track and manage customer orders.</p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Customer</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Fulfillment</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-muted rounded animate-pulse w-full"></div></td>
                    ))}
                  </tr>
                ))
              ) : orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id.toString()} className="hover:bg-muted/50 transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                      #{order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-[10px] text-secondary-foreground font-bold">
                          {(order.customer?.firstName || 'G')[0]}
                        </div>
                        <span className="text-sm text-foreground">
                          {order.customer ? `${order.customer.firstName} ${order.customer.lastName}` : 'Guest'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.financialStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(order.fulfillmentStatus || 'unfulfilled')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">
                      ${Number(order.totalPrice).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-muted-foreground">
                    <Package size={32} className="mx-auto text-muted-foreground/50 mb-2" />
                    <p>No orders found to display.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-muted/20 border-t border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Page <span className="font-medium text-foreground">{currentPage}</span> of {pagination.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(pagination.totalPages, p + 1))}
                disabled={currentPage === pagination.totalPages}
                className="p-2 border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-foreground"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}