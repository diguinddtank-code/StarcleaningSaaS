import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, Plus, Sparkles, Upload, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead } from './types';
import { cn } from './lib/utils';
import LeadBoard from './components/LeadBoard';
import LeadForm from './components/LeadForm';
import DashboardStats from './components/DashboardStats';
import LiveLeadsFeed from './components/LiveLeadsFeed';
import CsvImporter from './components/CsvImporter';
import { supabase } from './lib/supabase';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'leads' | 'calendar'>('dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newLeadNotification, setNewLeadNotification] = useState<Lead | null>(null);

  const fetchLeads = async () => {
    // setLoading(true); // Don't set loading on refresh to avoid flicker
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setLeads(data as any);
      } else {
        // Fallback for dev/demo
        const res = await fetch('/api/leads');
        const localData = await res.json();
        if (localData && localData.length > 0) {
            setLeads(localData);
        }
      }
    } catch (error) {
      console.error('Failed to fetch leads', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    // Real-time subscription
    const channel = supabase
      .channel('leads-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('New lead received!', payload);
          const newLead = payload.new as Lead;
          
          // Update list immediately
          setLeads((prev) => [newLead, ...prev]);
          
          // Trigger notification
          setNewLeadNotification(newLead);
          
          // Browser notification
          if (Notification.permission === 'granted') {
            new Notification('Novo Lead!', {
              body: `${newLead.name} acabou de chegar.`,
              icon: '/vite.svg'
            });
          }
          
          // Play sound (optional, simple beep)
          // const audio = new Audio('/notification.mp3');
          // audio.play().catch(e => console.log('Audio play failed', e));
        }
      )
      .subscribe();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleLeadAdded = () => {
    fetchLeads();
    setShowAddLead(false);
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    
    try {
      await supabase.from('leads').update({ status: newStatus }).eq('id', id);
    } catch (error) {
      console.error('Failed to update status', error);
      fetchLeads(); // Revert on error
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight text-slate-900">StarCleaning</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 pl-8">CRM & Lead Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => setView('dashboard')} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Leads Pipeline" 
            active={view === 'leads'} 
            onClick={() => setView('leads')} 
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Schedule" 
            active={view === 'calendar'} 
            onClick={() => setView('calendar')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button could go here */}
            <h1 className="text-xl font-semibold text-slate-800">
              {view === 'dashboard' && 'Visão Geral'}
              {view === 'leads' && 'Gestão de Leads'}
              {view === 'calendar' && 'Agenda'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4">
            <button 
              onClick={() => setShowImporter(true)}
              className="hidden sm:flex items-center gap-2 text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Upload size={16} />
              Importar CSV
            </button>
            <button 
              onClick={() => setShowAddLead(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Novo Lead</span>
            </button>
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-medium text-sm">
              SC
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span>Carregando...</span>
              </div>
            </div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full max-w-7xl mx-auto"
            >
              {view === 'dashboard' && (
                <div className="space-y-8">
                  <DashboardStats leads={leads} />
                  <LiveLeadsFeed leads={leads} onStatusChange={handleStatusChange} />
                </div>
              )}
              {view === 'leads' && <LeadBoard leads={leads} onUpdate={fetchLeads} />}
              {view === 'calendar' && (
                <div className="flex items-center justify-center h-full bg-white rounded-xl border border-slate-200 border-dashed text-slate-400">
                  Integração de Calendário em Breve
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {newLeadNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 cursor-pointer"
              onClick={() => {
                setView('dashboard');
                setNewLeadNotification(null);
              }}
            >
              <div className="bg-green-500 rounded-full p-1">
                <Bell size={14} fill="currentColor" />
              </div>
              <div>
                <p className="font-medium text-sm">Novo Lead: {newLeadNotification.name}</p>
                <p className="text-xs text-slate-400">Toque para ver</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNewLeadNotification(null);
                }}
                className="ml-2 text-slate-400 hover:text-white"
              >
                <span className="sr-only">Fechar</span>
                ×
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Add Lead Modal */}
      {showAddLead && (
        <LeadForm onClose={() => setShowAddLead(false)} onSuccess={handleLeadAdded} />
      )}

      {/* CSV Importer Modal */}
      {showImporter && (
        <CsvImporter onClose={() => setShowImporter(false)} onSuccess={fetchLeads} />
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
        active 
          ? "bg-indigo-50 text-indigo-700" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
