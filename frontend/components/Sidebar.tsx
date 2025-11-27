'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, Package, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { shopifyAPI } from '@/lib/api';
import { Button } from './ui/Button';
import { useState } from 'react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Products', icon: Package },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const [syncing, setSyncing] = useState(false);

  const handleSync = async () => {
    setSyncing(true);
    try {
      await shopifyAPI.syncData();
      alert('Data synced successfully!');
      window.location.reload();
    } catch (error) {
      alert('Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <aside className="w-64 bg-gray-50 border-r min-h-screen p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700 hover:bg-gray-200'
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 pt-8 border-t">
        <Button
          onClick={handleSync}
          disabled={syncing}
          variant="outline"
          className="w-full flex items-center justify-center space-x-2"
        >
          <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
          <span>{syncing ? 'Syncing...' : 'Sync Shopify Data'}</span>
        </Button>
      </div>
    </aside>
  );
};
