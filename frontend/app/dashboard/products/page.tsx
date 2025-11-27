'use client';

import React, { useState, useEffect } from 'react';
import { shopifyAPI } from '@/lib/api';
import { Product } from '@/types';
import { Loading } from '@/components/Loading';
import { Card } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await shopifyAPI.getProducts();
        setProducts(response.data.products);
      } catch (error) {
        console.error('Failed to fetch products', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-2">Browse your product catalog</p>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Title</TableHeader>
              <TableHeader>Vendor</TableHeader>
              <TableHeader>Type</TableHeader>
              <TableHeader>Price</TableHeader>
              <TableHeader>Created</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium">{product.title}</TableCell>
                <TableCell>{product.vendor}</TableCell>
                <TableCell>{product.productType}</TableCell>
                <TableCell className="font-semibold text-primary-600">
                  {formatCurrency(product.price)}
                </TableCell>
                <TableCell>{formatDate(product.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
