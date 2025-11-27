'use client';

import React from 'react';
import { Card } from '../ui/Card';
import { Table, TableHead, TableBody, TableRow, TableHeader, TableCell } from '../ui/Table';
import { TopCustomer } from '@/types';
import { formatCurrency } from '@/lib/utils';

interface TopCustomersProps {
  customers: TopCustomer[];
}

export const TopCustomers: React.FC<TopCustomersProps> = ({ customers }) => {
  return (
    <Card>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 5 Customers by Spend</h3>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeader>Name</TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>Orders</TableHeader>
            <TableHeader>Total Spent</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id}>
              <TableCell className="font-medium">{customer.name}</TableCell>
              <TableCell className="text-gray-600">{customer.email}</TableCell>
              <TableCell>{customer.ordersCount}</TableCell>
              <TableCell className="font-semibold text-primary-600">
                {formatCurrency(customer.totalSpent)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};
