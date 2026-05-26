import React, { useState, useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import type { ConfigData } from '../types';
import { Save } from 'lucide-react';

export function ConfigPage() {
  const { config, loading, updateConfig } = useConfig();
  const [formData, setFormData] = useState<ConfigData>(config);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateConfig(formData);
    alert('Configuration saved successfully!');
  };

  if (loading) return <div>Loading config...</div>;

  return (
    <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Settings</h1>

      <form onSubmit={handleSubmit} className="bg-card p-6 rounded-xl shadow-sm border border-border space-y-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Shop Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
              <input type="text" name="shopName" value={formData.shopName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input type="text" name="shopAddress" value={formData.shopAddress} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
              <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Trade Mark</label>
              <input type="text" name="tradeMark" value={formData.tradeMark} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Defaults & Calculation</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Commission (%)</label>
              <input type="number" step="0.1" name="commissionPct" value={formData.commissionPct} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coolie per entry (₹)</label>
              <input type="number" step="0.5" name="cooliePerEntry" value={formData.cooliePerEntry} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Customer</label>
              <input type="text" name="defaultCustomer" value={formData.defaultCustomer} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Group</label>
              <input type="text" name="defaultGroup" value={formData.defaultGroup} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Default Item Name</label>
              <input type="text" name="defaultItemName" value={formData.defaultItemName} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-saffron outline-none" />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button type="submit" className="bg-green text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-green/90 transition-colors shadow-sm">
            <Save className="w-5 h-5" /> Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
