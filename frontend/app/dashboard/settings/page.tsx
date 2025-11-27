'use client';

import React, { useState, useEffect } from 'react';
import apiClient from '@/lib/api';
import { Settings as SettingsIcon, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const [accessToken, setAccessToken] = useState('');
  const [shopDomain, setShopDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [configured, setConfigured] = useState(false);
  const [showToken, setShowToken] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const response = await apiClient.get('/tenant/shopify-status');
      setConfigured(response.data.configured);
      setShopDomain(response.data.shopDomain || '');
    } catch (error) {
      console.error('Error fetching status:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await apiClient.post('/tenant/shopify-token', {
        accessToken,
        shopDomain,
      });

      setMessage('success:' + response.data.message);
      setConfigured(true);
      setAccessToken('');
      setTimeout(() => setMessage(''), 5000);
    } catch (error: any) {
      setMessage('error:' + (error.response?.data?.message || 'Error updating credentials'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <SettingsIcon className="text-gray-700" size={32} />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Configure your Shopify integration</p>
        </div>
      </div>

      <div className="max-w-3xl">
        {/* Connection Status */}
        <div className={`mb-6 p-4 rounded-lg border ${
          configured 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-start gap-3">
            {configured ? (
              <CheckCircle className="text-green-600 flex-shrink-0" size={24} />
            ) : (
              <AlertCircle className="text-yellow-600 flex-shrink-0" size={24} />
            )}
            <div>
              <h3 className={`font-semibold ${configured ? 'text-green-900' : 'text-yellow-900'}`}>
                {configured ? 'Shopify Connected' : 'Shopify Not Connected'}
              </h3>
              <p className={`text-sm mt-1 ${configured ? 'text-green-700' : 'text-yellow-700'}`}>
                {configured 
                  ? 'Your store is connected and ready to sync data.' 
                  : 'Please configure your Shopify credentials below to start syncing data.'}
              </p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <SettingsIcon size={20} />
            Shopify Configuration
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Shop Domain <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="your-store.myshopify.com"
                value={shopDomain}
                onChange={(e) => setShopDomain(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Your Shopify store URL (e.g., example.myshopify.com)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin API Access Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showToken ? 'text' : 'password'}
                  placeholder="shpat_xxxxxxxxxxxxx"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-2 px-3 py-1 text-xs text-blue-600 hover:text-blue-700"
                >
                  {showToken ? 'Hide' : 'Show'}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Starts with &quot;shpat_&quot; - keep this secure!
              </p>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={20} />
                <div>
                  <p className="font-medium mb-2 text-blue-900 text-sm">
                    📝 How to get your Shopify API credentials:
                  </p>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-blue-800">
                    <li>Log in to your Shopify Admin panel</li>
                    <li>Go to <strong>Settings → Apps and sales channels</strong></li>
                    <li>Click <strong>&quot;Develop apps&quot;</strong> → <strong>&quot;Create an app&quot;</strong></li>
                    <li>Give it a name (e.g., &quot;Xeno Data Sync&quot;)</li>
                    <li>Click <strong>&quot;Configure Admin API scopes&quot;</strong></li>
                    <li>Select permissions: <strong>read_products, read_customers, read_orders</strong></li>
                    <li>Click <strong>&quot;Save&quot;</strong> → <strong>&quot;Install app&quot;</strong></li>
                    <li>Copy the <strong>&quot;Admin API access token&quot;</strong></li>
                  </ol>
                  <p className="mt-3 text-xs text-blue-700">
                    💡 <strong>Tip:</strong> Make sure your token has the correct read permissions for customers, products, and orders.
                  </p>
                </div>
              </div>
            </div>

            {/* Message */}
            {message && (
              <div
                className={`p-4 rounded-lg text-sm border ${
                  message.startsWith('success')
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-red-50 border-red-200 text-red-700'
                }`}
              >
                <div className="flex items-start gap-2">
                  {message.startsWith('success') ? (
                    <CheckCircle size={20} className="flex-shrink-0" />
                  ) : (
                    <AlertCircle size={20} className="flex-shrink-0" />
                  )}
                  <span>{message.split(':')[1]}</span>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  <span>{configured ? 'Update Credentials' : 'Save Credentials'}</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Additional Info */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-2">🔒 Security Note</h3>
          <p className="text-sm text-gray-600">
            Your Shopify credentials are securely stored and encrypted. Never share your access token 
            with anyone. If you suspect your token has been compromised, regenerate it immediately in 
            your Shopify admin panel.
          </p>
        </div>
      </div>
    </div>
  );
}
