'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Users, ShoppingCart, Package, RefreshCw,
  Settings, BarChart3, LogOut, ChevronRight
} from 'lucide-react';
import apiClient from '@/lib/api';
import { ThemeToggle } from './ThemeToggle';

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
    <aside className="w-72 bg-card border-r border-border min-h-screen flex flex-col fixed left-0 top-0 z-50 transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-md">
            <span className="font-bold text-lg">X</span>
          </div>
          <div>
            <h1 className="font-bold text-foreground text-lg tracking-tight">Xeno</h1>
            <p className="text-xs text-muted-foreground font-medium">Enterprise Analytics</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">
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
                  ? 'bg-secondary text-primary font-medium'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon size={20} className={isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight size={16} className="text-primary/50" />}
            </Link>
          );
        })}

        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mt-8 mb-4 px-4">
          System
        </div>

        <Link
          href="/dashboard/settings"
          className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
            pathname === '/dashboard/settings' ? 'bg-secondary text-primary' : 'text-muted-foreground hover:bg-secondary/50'
          }`}
        >
          <Settings size={20} className="text-muted-foreground group-hover:text-foreground" />
          <span>Settings</span>
        </Link>
      </div>

      <div className="p-4 border-t border-border bg-secondary/20">
        <div className="flex items-center justify-between mb-4 px-1">
           <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
             Theme
           </span>
           <ThemeToggle />
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-background border border-border text-foreground text-sm font-medium hover:border-primary hover:text-primary transition-all disabled:opacity-70"
          >
            <RefreshCw size={16} className={syncing ? 'animate-spin text-primary' : ''} />
            {syncing ? 'Syncing...' : 'Sync Data'}
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-sm transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}