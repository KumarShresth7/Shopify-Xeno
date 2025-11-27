'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  RefreshCw,
  Settings,
  BarChart3,
  LogOut,
} from 'lucide-react';
import apiClient from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      const response = await apiClient.post('/shopify/sync');
      if (response.data.success) {
        alert(`✅ Data synced successfully!\n\nCustomers: ${response.data.results.customers}\nProducts: ${response.data.results.products}\nOrders: ${response.data.results.orders}`);
        window.location.reload();
      } else {
        alert('❌ ' + response.data.message);
      }
    } catch (error: any) {
      alert('❌ ' + (error.response?.data?.message || 'Error syncing data'));
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen flex flex-col">
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-2xl font-bold">Xeno Analytics</h1>
        <p className="text-sm text-gray-400 mt-1">Shopify Insights</p>
      </div>

      <nav className="flex-1 px-4 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}

        <button
          onClick={handleSync}
          disabled={syncing}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors mt-4 border border-gray-700 disabled:opacity-50"
        >
          <RefreshCw size={20} className={syncing ? 'animate-spin' : ''} />
          <span>{syncing ? 'Syncing...' : 'Sync Data'}</span>
        </button>
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-gray-800 transition-colors"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
