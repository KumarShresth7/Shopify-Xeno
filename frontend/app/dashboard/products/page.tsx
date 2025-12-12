'use client';

import React from 'react';
import useSWR from 'swr';
import apiClient from '@/lib/api';
import { Package, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

const fetchProducts = async () => {
  const res = await apiClient.get('/tenant/products');
  return res.data.data;
};

export default function ProductsPage() {
  const { data: products, error, isLoading } = useSWR('products', fetchProducts);
  const [searchTerm, setSearchTerm] = React.useState('');

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-muted border-t-primary animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-red-500">Failed to load products.</div>;
  }

  const filteredProducts = products?.filter((p: any) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.vendor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store inventory.</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Inventory</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {filteredProducts?.map((product: any) => (
                <tr key={product.id} className="hover:bg-muted/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-secondary text-secondary-foreground">
                        <Package size={20} />
                      </div>
                      <span className="font-medium text-foreground">{product.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {product.vendor || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InventoryStatus count={product.inventory} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-foreground">
                    {product.inventory}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-foreground">
                    ₹{Number(product.price).toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {filteredProducts?.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No products found matching "{searchTerm}"
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

// Helper Component for Inventory Status Badges
const InventoryStatus = ({ count }: { count: number }) => {
  if (count <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
        <XCircle size={12} /> Out of Stock
      </span>
    );
  }
  if (count < 10) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
        <AlertCircle size={12} /> Low Stock
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <CheckCircle2 size={12} /> In Stock
    </span>
  );
};