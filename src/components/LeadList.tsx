import React from 'react';
import { Lead, LEAD_STATUSES } from '../types';
import { formatCurrency } from '../lib/utils';
import { Phone, Mail, Calendar, MapPin, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

interface LeadListProps {
  leads: Lead[];
  onLeadClick: (lead: Lead) => void;
}

export default function LeadList({ leads, onLeadClick }: LeadListProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto hide-scrollbar">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
            <tr>
              <th className="px-4 sm:px-6 py-4">Nome</th>
              <th className="px-4 sm:px-6 py-4">Status</th>
              <th className="px-4 sm:px-6 py-4">Contato</th>
              <th className="px-6 py-4 hidden md:table-cell">Serviço</th>
              <th className="px-6 py-4 hidden lg:table-cell">Local</th>
              <th className="px-6 py-4 hidden lg:table-cell">Origem</th>
              <th className="px-4 sm:px-6 py-4 text-right">Valor Est.</th>
              <th className="px-4 sm:px-6 py-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((lead, index) => (
              <motion.tr 
                key={lead.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onLeadClick(lead)}
                className="hover:bg-slate-50 cursor-pointer transition-colors group"
              >
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs shrink-0">
                      {lead.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">{lead.name}</span>
                  </div>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${
                    (LEAD_STATUSES.find(s => s.id === (lead.status?.toLowerCase() || 'new')) || LEAD_STATUSES[0]).color.replace('bg-', 'bg-opacity-10 text-').replace('text-', 'border-')
                  }`}>
                    {(LEAD_STATUSES.find(s => s.id === (lead.status?.toLowerCase() || 'new')) || LEAD_STATUSES[0]).label}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {lead.phone && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Phone size={12} className="shrink-0" />
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">{lead.phone}</span>
                      </div>
                    )}
                    {lead.email && (
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <Mail size={12} className="shrink-0" />
                        <span className="truncate max-w-[100px] sm:max-w-[150px]">{lead.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 hidden md:table-cell">
                  {lead.service_type}
                  {lead.frequency && <span className="text-slate-400 text-xs block">{lead.frequency}</span>}
                </td>
                <td className="px-6 py-4 text-slate-600 hidden lg:table-cell">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate max-w-[150px]">{lead.city || '-'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600 hidden lg:table-cell">
                  <span className="px-2 py-1 bg-slate-100 rounded text-xs font-medium text-slate-600 whitespace-nowrap">
                    {lead.source || 'Manual'}
                  </span>
                </td>
                <td className="px-4 sm:px-6 py-4 text-right font-medium text-slate-900 whitespace-nowrap">
                  {lead.estimated_price1 || '-'}
                </td>
                <td className="px-4 sm:px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <MoreHorizontal size={18} />
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
