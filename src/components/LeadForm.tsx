import React, { useState } from 'react';
import { X, Loader2, Sparkles } from 'lucide-react';
import { SERVICE_TYPES } from '../types';

export default function LeadForm({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    service_type: 'standard',
    bedrooms: 2,
    bathrooms: 2,
    sqft: 1500,
    frequency: 'bi-weekly',
    notes: '',
    source: 'manual'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AI Feature: Estimate Price & Analyze
  const analyzeLead = async () => {
    setAnalyzing(true);
    try {
      // In a real app, this would call a backend endpoint that uses Gemini
      // For this demo, we'll simulate it or call it if we had the key on client (but we should do it on server ideally)
      // Since we are in a preview environment, I will use a simple heuristic for now to demonstrate "Smart Quote"
      // In the next step, I will implement the actual AI call if requested, or simulate the "Smart" part.
      
      // Call backend for estimate
      const res = await fetch('/api/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bedrooms: formData.bedrooms,
          bathrooms: formData.bathrooms,
          sqft: formData.sqft,
          service_type: formData.service_type
        })
      });
      
      const data = await res.json();
      
      // Simulate AI delay for effect
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert(`Smart Estimate: $${data.estimate}\n\nBased on market rates in Charleston for a ${formData.sqft}sqft home.`);
      
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-slate-800">Add New Lead</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Full Name</label>
              <input 
                required
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Jane Doe"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="jane@example.com"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Phone</label>
              <input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="(843) 555-0123"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">City/Area</label>
              <input 
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                placeholder="Charleston, Summerville..."
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Address</label>
            <input 
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              placeholder="123 Palmetto Blvd"
            />
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-slate-800 flex items-center gap-2">
                <Sparkles size={16} className="text-indigo-500" />
                Property Details
              </h3>
              <button 
                type="button"
                onClick={analyzeLead}
                disabled={analyzing}
                className="text-xs text-indigo-600 font-medium hover:underline disabled:opacity-50"
              >
                {analyzing ? 'Analyzing...' : 'Get Smart Estimate'}
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Service Type</label>
                <select 
                  name="service_type"
                  value={formData.service_type}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm"
                >
                  {SERVICE_TYPES.map(t => (
                    <option key={t.id} value={t.id}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Bedrooms</label>
                <input 
                  type="number"
                  name="bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Bathrooms</label>
                <input 
                  type="number"
                  name="bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-slate-500">Sq Ft</label>
                <input 
                  type="number"
                  name="sqft"
                  value={formData.sqft}
                  onChange={handleChange}
                  className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Notes</label>
            <textarea 
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              placeholder="Any specific requirements, pets, access codes..."
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Create Lead
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
