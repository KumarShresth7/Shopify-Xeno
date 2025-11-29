'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Save, ShieldCheck, AlertTriangle, Key, Link as LinkIcon, Info } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsPage() {
  const [formData, setFormData] = useState({ accessToken: '', shopDomain: '' });
  const [status, setStatus] = useState<{ configured: boolean; shopDomain?: string }>({ configured: false });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    apiClient.get('/tenant/shopify-status').then(res => {
      setStatus(res.data);
      if (res.data.shopDomain) setFormData(prev => ({ ...prev, shopDomain: res.data.shopDomain }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      await apiClient.post('/tenant/shopify-token', formData);
      setMsg({ type: 'success', text: 'Settings updated successfully' });
      setStatus({ configured: true, shopDomain: formData.shopDomain });
      setFormData(prev => ({ ...prev, accessToken: '' }));
    } catch (err: any) {
      setMsg({ type: 'error', text: err.response?.data?.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm">Manage your Shopify integration and API credentials.</p>
      </div>

      <div className={`p-4 rounded-xl border ${status.configured ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-amber-500/10 border-amber-500/20'} flex items-start gap-4`}>
        {status.configured ? <ShieldCheck className="text-emerald-600 dark:text-emerald-400 mt-0.5" /> : <AlertTriangle className="text-amber-600 dark:text-amber-400 mt-0.5" />}
        <div>
          <h3 className={`font-semibold ${status.configured ? 'text-emerald-900 dark:text-emerald-100' : 'text-amber-900 dark:text-amber-100'}`}>
            {status.configured ? 'Integration Active' : 'Configuration Required'}
          </h3>
          <p className={`text-sm mt-1 ${status.configured ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}`}>
            {status.configured 
              ? `Connected to ${status.shopDomain}. Data sync is enabled.` 
              : 'Connect your Shopify store to start syncing data.'}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-muted/20">
          <h2 className="font-semibold text-foreground">API Configuration</h2>
          <p className="text-xs text-muted-foreground mt-1">Provide your Shopify Admin API credentials.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <LinkIcon size={16} /> Shop Domain
              </label>
              <Input
                placeholder="store-name.myshopify.com"
                value={formData.shopDomain}
                onChange={e => setFormData({ ...formData, shopDomain: e.target.value })}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Key size={16} /> Admin API Access Token
              </label>
              <Input
                type="password"
                placeholder="shpat_xxxxxxxxxxxxxxxx"
                value={formData.accessToken}
                onChange={e => setFormData({ ...formData, accessToken: e.target.value })}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Info size={12} /> Token is encrypted on storage. Leave blank to keep current.
              </p>
            </div>
          </div>

          {msg && (
            <div className={`text-sm px-4 py-3 rounded-lg ${
              msg.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-destructive/10 text-destructive'
            }`}>
              {msg.text}
            </div>
          )}

          <div className="pt-4 flex justify-end">
            <Button type="submit" disabled={loading} className="gap-2">
              {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}