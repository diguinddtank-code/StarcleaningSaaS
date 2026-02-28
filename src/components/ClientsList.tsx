import React, { useState } from 'react';
import { Lead } from '../types';
import { Search, MapPin, Phone, Mail, Filter, User } from 'lucide-react';
import { motion } from 'motion/react';
import AnimatedButton from './AnimatedButton';

interface ClientsListProps {
  leads: Lead[];
  onClientClick: (client: Lead) => void;
}

export default function ClientsList({ leads, onClientClick }: ClientsListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter for 'won' leads which are considered active clients
  const clients = leads.filter(lead => lead.status === 'won');
  
  const filteredClients = clients.filter(client => {
    const searchLower = searchTerm.toLowerCase();
    return (
      client.name.toLowerCase().includes(searchLower) ||
      client.email.toLowerCase().includes(searchLower) ||
      client.phone.includes(searchTerm) ||
      client.address.toLowerCase().includes(searchLower) ||
      client.city.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-50 rounded-lg text-green-600">
            <User size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Meus Clientes</h2>
            <p className="text-sm text-slate-500">{clients.length} clientes ativos</p>
          </div>
        </div>

        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} className="text-slate-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-all"
            placeholder="Buscar por nome, email, telefone ou endereço..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center flex flex-col items-center justify-center text-slate-400">
            <User size={48} className="mb-4 text-slate-300" />
            <h3 className="text-lg font-medium text-slate-900 mb-1">Nenhum cliente encontrado</h3>
            <p>Tente buscar por outro termo ou converta leads em clientes.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ y: -4, shadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm cursor-pointer transition-all flex flex-col"
              onClick={() => onClientClick(client)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                    {client.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 line-clamp-1">{client.name}</h3>
                    <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {client.service_type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mt-2 flex-1">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.phone || 'Sem telefone'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.email || 'Sem email'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin size={14} className="text-slate-400 shrink-0" />
                  <span className="truncate">{client.address ? `${client.address}, ${client.city}` : client.city}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-400">
                  Adicionado em {new Date(client.created_at).toLocaleDateString()}
                </span>
                <AnimatedButton variant="ghost" size="sm" className="text-indigo-600 hover:bg-indigo-50">
                  Ver Perfil
                </AnimatedButton>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
