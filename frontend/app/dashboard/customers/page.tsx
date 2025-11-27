'use client';

import React, { useState, useEffect } from 'react';
import { shopifyAPI } from '@/lib/api';
import { Customer } from '@/types';
import { Loading } from '@/components/Loading';
import { Card } from '@/components/ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '@/components/ui/Table';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await shopifyAPI.getCustomers();
        setCustomers(response.data.customers);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-2">Manage and view your customer base</p>
      </div>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Email</TableHeader>
              <TableHeader>Orders</TableHeader>
              <TableHeader>Total Spent</TableHeader>
              <TableHeader>Joined</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers.map((customer) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">
                  {customer.firstName} {customer.lastName}
                </TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.ordersCount}</TableCell>
                <TableCell className="font-semibold text-primary-600">
                  {formatCurrency(customer.totalSpent)}
                </TableCell>
                <TableCell>{formatDate(customer.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
