'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Package, RefreshCw,
  Settings, BarChart3, LogOut, ChevronRight
} from 'lucide-react';
import apiClient from '@/lib/api';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
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
        // You might want to use a toast notification here instead of alert
        alert('Sync Complete');
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <aside className="w-72 bg-white border-r border-slate-200 min-h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-600/20">
            <span className="font-bold text-lg">X</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-lg tracking-tight">Xeno</h1>
            <p className="text-xs text-slate-500 font-medium">Enterprise Analytics</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4 px-4">
          Menu
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-blue-50 text-blue-700 font-medium'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-blue-400" />}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-8 mb-4 px-4">
          System
        </div>

        <Link
          href="/dashboard/settings"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/dashboard/settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Settings size={20} className="text-slate-400 group-hover:text-slate-600" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-medium hover:border-blue-300 hover:text-blue-600 hover:shadow-sm transition-all disabled:opacity-70"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin text-blue-600' : ''} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}