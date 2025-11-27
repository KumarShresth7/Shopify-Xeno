'use client';

import React, { useEffect, useState } from 'react';
import apiClient from '@/lib/api';
import { Package } from 'lucide-react';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/shopify/products?page=${currentPage}&limit=20`);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-2">View your product catalog</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="text-blue-600" size={24} />
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total || 0}</p>
            </div>
          </div>
        </div>
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
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Title</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Type</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Vendor</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Price</th>
                    <th className="text-left py-3 px-6 font-semibold text-gray-700">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.id.toString()} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{product.title}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            {product.productType || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600">{product.vendor || 'N/A'}</td>
                        <td className="py-4 px-6 font-semibold text-green-600">
                          ${Number(product.price).toFixed(2)}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          {new Date(product.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No products found. Sync your Shopify data to see products.
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
                  Showing {products.length} of {pagination.total} products
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
