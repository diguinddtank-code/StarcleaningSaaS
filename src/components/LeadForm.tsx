import React, { useState } from 'react';
import { X, Loader2, Sparkles, Home, User, Mail, Phone, MapPin, DollarSign } from 'lucide-react';
import { SERVICE_TYPES } from '../types';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'motion/react';
import AnimatedButton from './AnimatedButton';

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
    bathrooms: 1,
    sqft: 1000,
    frequency: 'one-time',
    notes: '',
    source: 'manual'
  });
  const [estimate, setEstimate] = useState<number | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const calculateEstimate = async () => {
    setAnalyzing(true);
    try {
      // Simulate API call delay for effect
      await new Promise(resolve => setTimeout(resolve, 600));
      
      let basePrice = 100;
      basePrice += (formData.bedrooms || 0) * 25;
      basePrice += (formData.bathrooms || 0) * 35;
      basePrice += (formData.sqft || 0) * 0.08;
      
      if (formData.service_type === 'deep') basePrice *= 1.5;
      if (formData.service_type === 'move-in-out') basePrice *= 2.0;
      
      const calculated = Math.ceil(basePrice / 5) * 5;
      setEstimate(calculated);
    } catch (error) {
      console.error('Estimate error', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const leadData = {
        ...formData,
        estimated_price: estimate,
        status: 'new'
      };

      const { error } = await supabase.from('leads').insert([leadData]);

      if (error) throw error;
      
      onSuccess();
    } catch (error: any) {
      console.error('Error creating lead:', error);
      alert(`Erro ao criar lead: ${error.message || JSON.stringify(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
      >
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Novo Lead</h2>
            <p className="text-sm text-slate-500">Adicionar manualmente ao pipeline</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8 flex-1 overflow-y-auto">
          
          {/* Section: Client Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <User size={16} className="text-indigo-500" />
              Informações do Cliente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
                <input
                  required
                  name="name"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Maria Silva"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Telefone</label>
                <input
                  type="tel"
                  name="phone"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="cliente@email.com"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Section: Property Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Home size={16} className="text-indigo-500" />
              Detalhes do Imóvel
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quartos</label>
                <input
                  type="number"
                  min="0"
                  name="bedrooms"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.bedrooms}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Banheiros</label>
                <input
                  type="number"
                  min="0"
                  name="bathrooms"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.bathrooms}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Área (sqft)</label>
                <input
                  type="number"
                  min="0"
                  name="sqft"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.sqft}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Endereço</label>
                <input
                  type="text"
                  name="address"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Rua, Número"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cidade</label>
                <input
                  type="text"
                  name="city"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Cidade"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-100" />

          {/* Section: Service & Estimate */}
          <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <DollarSign size={16} className="text-indigo-500" />
                Orçamento Inteligente
              </h3>
              <AnimatedButton
                type="button"
                variant="secondary"
                size="sm"
                onClick={calculateEstimate}
                isLoading={analyzing}
                icon={<Sparkles size={14} />}
              >
                Calcular Estimativa
              </AnimatedButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Serviço</label>
                <select
                  name="service_type"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.service_type}
                  onChange={handleChange}
                >
                  {SERVICE_TYPES.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Frequência</label>
                <select
                  name="frequency"
                  className="w-full rounded-xl border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
                  value={formData.frequency}
                  onChange={handleChange}
                >
                  <option value="one-time">Única Vez</option>
                  <option value="weekly">Semanal</option>
                  <option value="bi-weekly">Quinzenal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </div>
            </div>

            <div className="space-y-2 mt-4">
              <label className="text-sm font-medium text-slate-700">Notas</label>
              <textarea 
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Observações..."
              />
            </div>

            <AnimatePresence>
              {estimate !== null && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-between"
                >
                  <span className="text-sm text-slate-600">Preço Sugerido:</span>
                  <span className="text-2xl font-bold text-green-600">${estimate}</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </form>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white sticky bottom-0">
          <AnimatedButton variant="ghost" onClick={onClose}>
            Cancelar
          </AnimatedButton>
          <AnimatedButton 
            onClick={handleSubmit} 
            isLoading={loading}
          >
            Criar Lead
          </AnimatedButton>
        </div>
      </motion.div>
    </div>
  );
}
