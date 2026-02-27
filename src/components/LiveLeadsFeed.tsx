import React from 'react';
import { Lead } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Phone, Mail, Clock, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LiveLeadsFeedProps {
  leads: Lead[];
  onStatusChange: (id: number, newStatus: string) => void;
}

export default function LiveLeadsFeed({ leads = [], onStatusChange }: LiveLeadsFeedProps) {
  // Filter only new leads or leads that need attention
  const safeLeads = Array.isArray(leads) ? leads : [];
  const newLeads = safeLeads.filter(l => (l.status?.toLowerCase() || 'new') === 'new');
  const otherLeads = safeLeads.filter(l => (l.status?.toLowerCase() || 'new') !== 'new').slice(0, 5); // Show recent 5 others

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </div>
          Leads Recentes (Tempo Real)
        </h2>
        <span className="text-sm text-slate-500">
          {newLeads.length} novos leads aguardando contato
        </span>
      </div>

      <div className="grid gap-4">
        <AnimatePresence mode="popLayout">
          {newLeads.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white p-8 rounded-xl border border-slate-200 border-dashed text-center text-slate-500"
            >
              <CheckCircle2 className="mx-auto h-12 w-12 text-slate-300 mb-3" />
              <p>Tudo limpo! Nenhum lead novo aguardando contato.</p>
            </motion.div>
          ) : (
            newLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={onStatusChange} isNew={true} />
            ))
          )}
        </AnimatePresence>
      </div>

      {otherLeads.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-slate-500 mb-4 uppercase tracking-wider">Últimas Atualizações</h3>
          <div className="space-y-3 opacity-75">
            {otherLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} onStatusChange={onStatusChange} isNew={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const LeadCard: React.FC<{ lead: Lead, onStatusChange: (id: number, s: string) => void, isNew: boolean }> = ({ lead, onStatusChange, isNew }) => {
  const timeAgo = formatDistanceToNow(new Date(lead.created_at), { addSuffix: true, locale: ptBR });
  
  // Calculate if lead is "overdue" (e.g., more than 30 mins without contact)
  const createdDate = new Date(lead.created_at);
  const isOverdue = isNew && (new Date().getTime() - createdDate.getTime() > 30 * 60 * 1000);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-white rounded-xl p-5 border shadow-sm transition-all hover:shadow-md ${
        isNew ? 'border-indigo-100 shadow-indigo-100/50' : 'border-slate-200'
      } ${isOverdue ? 'ring-2 ring-red-100' : ''}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-lg font-bold shrink-0 ${
            isNew ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'
          }`}>
            {lead.name.charAt(0)}
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-slate-900">{lead.name}</h3>
              {isNew && (
                <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                  Novo
                </span>
              )}
              {isOverdue && (
                <span className="flex items-center gap-1 bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-red-100">
                  <AlertCircle size={10} />
                  Atrasado
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Clock size={14} />
                {timeAgo}
              </span>
              {lead.service_type && (
                <span className="px-2 py-0.5 bg-slate-50 rounded border border-slate-100 text-xs">
                  {lead.service_type}
                </span>
              )}
              {lead.city && (
                <span className="text-xs text-slate-400">
                  em {lead.city}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:self-center self-end">
          {lead.phone && (
            <a 
              href={`https://wa.me/${lead.phone.replace(/\D/g, '')}`} 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-slate-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="WhatsApp"
            >
              <Phone size={20} />
            </a>
          )}
          {lead.email && (
            <a 
              href={`mailto:${lead.email}`}
              className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Email"
            >
              <Mail size={20} />
            </a>
          )}
          
          {isNew && (
            <button
              onClick={() => onStatusChange(lead.id, 'contacted')}
              className="ml-2 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Marcar Contato
              <ArrowRight size={16} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
