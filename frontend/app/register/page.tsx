'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LayoutDashboard, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    shopDomain: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/register', formData);
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-96 bg-gradient-to-bl from-blue-100 to-slate-50 -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-100/50 rounded-full blur-3xl -z-10" />

      <div className="bg-white/80 backdrop-blur-xl p-8 md:p-12 rounded-2xl shadow-xl border border-white/50 w-full max-w-md mx-4 animate-fade-in">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg shadow-blue-600/30">
            <LayoutDashboard size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Create Account</h1>
          <p className="text-slate-500 text-sm mt-2">Start analyzing your Shopify data today</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            className="bg-slate-50 border-slate-200 focus:bg-white"
          />

          <div className="relative">
            <Input
              label="Shopify Store URL"
              type="text"
              placeholder="store.myshopify.com"
              value={formData.shopDomain}
              onChange={(e) => setFormData({ ...formData, shopDomain: e.target.value })}
              required
              className="bg-slate-50 border-slate-200 focus:bg-white"
            />
            <div className="absolute right-3 top-[34px] text-slate-400">
              <span className="text-xs">.myshopify.com</span>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-center gap-2 text-red-600 text-sm animate-slide-in">
              <span className="w-1 h-1 bg-red-500 rounded-full" />
              {error}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full py-2.5 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all duration-200 group">
            {loading ? 'Creating account...' : (
              <span className="flex items-center justify-center gap-2">
                Get Started <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold transition-colors">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}