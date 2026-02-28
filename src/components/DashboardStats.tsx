import React from 'react';
import { Lead, LEAD_STATUSES } from '../types';
import { Users, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'motion/react';

export default function DashboardStats({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length;
  // Normalize status check to be case-insensitive
  const wonLeads = leads.filter(l => l.status?.toLowerCase() === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  
  // Helper to extract average price from a range string (e.g., "$100 - $150" -> 125)
  const extractAveragePrice = (priceStr: string | undefined | null): number => {
    if (!priceStr) return 0;
    const numbers = priceStr.match(/\d+(\.\d+)?/g);
    if (!numbers || numbers.length === 0) return 0;
    const sum = numbers.reduce((acc, val) => acc + Number(val), 0);
    return sum / numbers.length;
  };

  // Calculate potential value (all active leads) using First Cleaning (estimated_price1)
  const pipelineValue = leads
    .filter(l => ['new', 'contacted', 'quoted', 'scheduled'].includes(l.status?.toLowerCase() || ''))
    .reduce((sum, l) => sum + extractAveragePrice(l.estimated_price1), 0);

  // Data for chart by status
  const statusData = LEAD_STATUSES.map(status => ({
    name: status.label,
    count: leads.filter(l => (l.status?.toLowerCase() || 'new') === status.id).length
  }));

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total de Leads" 
          value={totalLeads.toString()} 
          icon={<Users className="text-blue-600" />} 
          trend="+12% este mês"
          variants={item}
          gradient="from-blue-50 to-blue-100/50"
        />
        <StatCard 
          title="Valor no Pipeline" 
          value={formatCurrency(pipelineValue)} 
          icon={<DollarSign className="text-emerald-600" />} 
          trend="Oportunidades ativas"
          variants={item}
          gradient="from-emerald-50 to-emerald-100/50"
        />
        <StatCard 
          title="Taxa de Conversão" 
          value={`${conversionRate}%`} 
          icon={<TrendingUp className="text-purple-600" />} 
          trend="Vs. 15% mês passado"
          variants={item}
          gradient="from-purple-50 to-purple-100/50"
        />
        <StatCard 
          title="Serviços Fechados" 
          value={wonLeads.toString()} 
          icon={<CheckCircle className="text-indigo-600" />} 
          trend="Agendamentos concluídos"
          variants={item}
          gradient="from-indigo-50 to-indigo-100/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          variants={item}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Status do Pipeline</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} interval={0} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f8fafc' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={32} animationDuration={1500} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          variants={item}
          className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col"
        >
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Atividades Recentes</h3>
          <div className="space-y-3 flex-1 overflow-y-auto pr-2 hide-scrollbar">
            {leads.slice(0, 6).map((lead, index) => {
              const status = LEAD_STATUSES.find(s => s.id === (lead.status?.toLowerCase() || 'new')) || LEAD_STATUSES[0];
              return (
                <motion.div 
                  key={lead.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 border border-slate-100 bg-slate-50/50 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{lead.name}</p>
                      <p className="text-xs text-slate-500 truncate max-w-[120px] sm:max-w-[200px]">{lead.city} • {lead.service_type}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${status.color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'border-')}`}>
                    {status.label}
                  </span>
                </motion.div>
              );
            })}
            {leads.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                <Users size={32} className="text-slate-300" />
                <p className="text-sm">Nenhuma atividade recente</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, trend, variants, gradient }: { title: string, value: string, icon: React.ReactNode, trend: string, variants?: any, gradient?: string }) {
  return (
    <motion.div 
      variants={variants}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden`}
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${gradient} rounded-bl-full -z-10 opacity-60`}></div>
      <div className="flex items-start justify-between z-10">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        <div className="p-2.5 bg-white rounded-xl shadow-sm border border-slate-100">
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-4 font-medium">{trend}</p>
    </motion.div>
  );
}
