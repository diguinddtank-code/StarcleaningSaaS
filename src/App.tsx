import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Calendar, Settings, Plus, Sparkles, Upload, Bell, Menu, X, List, Kanban } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Lead } from './types';
import { cn } from './lib/utils';
import LeadBoard from './components/LeadBoard';
import LeadList from './components/LeadList';
import LeadForm from './components/LeadForm';
import LeadDetails from './components/LeadDetails';
import DashboardStats from './components/DashboardStats';
import LiveLeadsFeed from './components/LiveLeadsFeed';
import CsvImporter from './components/CsvImporter';
import AnimatedButton from './components/AnimatedButton';
import { supabase } from './lib/supabase';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'leads' | 'calendar'>('dashboard');
  const [leadsViewMode, setLeadsViewMode] = useState<'board' | 'list'>('board');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showImporter, setShowImporter] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [newLeadNotification, setNewLeadNotification] = useState<Lead | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden">
      {/* ... sidebar ... */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="h-6 w-6" />
            <span className="font-bold text-lg tracking-tight text-slate-900">StarCleaning</span>
          </div>
          <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
            <X size={20} />
          </button>
        </div>
        <p className="text-xs text-slate-500 mt-2 px-6">CRM & Lead Manager</p>

        <nav className="flex-1 p-4 space-y-1 mt-4">
          <NavItem 
            icon={<LayoutDashboard size={20} />} 
            label="Dashboard" 
            active={view === 'dashboard'} 
            onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }} 
          />
          <NavItem 
            icon={<Users size={20} />} 
            label="Leads Pipeline" 
            active={view === 'leads'} 
            onClick={() => { setView('leads'); setMobileMenuOpen(false); }} 
          />
          <NavItem 
            icon={<Calendar size={20} />} 
            label="Schedule" 
            active={view === 'calendar'} 
            onClick={() => { setView('calendar'); setMobileMenuOpen(false); }} 
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </aside>

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-slate-800">
              {view === 'dashboard' && 'Visão Geral'}
              {view === 'leads' && 'Gestão de Leads'}
              {view === 'calendar' && 'Agenda'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            {view === 'leads' && (
              <div className="flex bg-slate-100 p-1 rounded-lg mr-2">
                <button 
                  onClick={() => setLeadsViewMode('board')}
                  className={cn("p-1.5 rounded-md transition-all", leadsViewMode === 'board' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
                  title="Kanban Board"
                >
                  <Kanban size={16} />
                </button>
                <button 
                  onClick={() => setLeadsViewMode('list')}
                  className={cn("p-1.5 rounded-md transition-all", leadsViewMode === 'list' ? "bg-white shadow-sm text-indigo-600" : "text-slate-500 hover:text-slate-700")}
                  title="List View"
                >
                  <List size={16} />
                </button>
              </div>
            )}

            <AnimatedButton 
              variant="ghost"
              size="sm"
              onClick={() => setShowImporter(true)}
              icon={<Upload size={16} />}
              className="hidden sm:inline-flex text-slate-600"
            >
              Importar CSV
            </AnimatedButton>
            
            <AnimatedButton 
              variant="primary"
              size="sm"
              onClick={() => setShowAddLead(true)}
              icon={<Plus size={16} />}
              className="shadow-indigo-200"
            >
              <span className="hidden sm:inline">Novo Lead</span>
              <span className="sm:hidden">Novo</span>
            </AnimatedButton>
            
            <div className="h-9 w-9 rounded-full bg-indigo-100 border-2 border-white shadow-sm flex items-center justify-center text-indigo-700 font-medium text-sm ml-2">
              SC
            </div>
          </div>
        </header>

        {/* View Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 bg-slate-50/50">
          {loading ? (
            <div className="flex items-center justify-center h-full text-slate-400">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
                <span className="text-sm font-medium animate-pulse">Carregando dados...</span>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={view}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.2 }}
                className="h-full max-w-7xl mx-auto"
              >
                {view === 'dashboard' && (
                  <div className="space-y-8 pb-10">
                    <DashboardStats leads={leads} />
                    <LiveLeadsFeed leads={leads} onStatusChange={handleStatusChange} />
                  </div>
                )}
                {view === 'leads' && (
                  leadsViewMode === 'board' ? (
                    <LeadBoard leads={leads} onUpdate={fetchLeads} />
                  ) : (
                    <LeadList leads={leads} onLeadClick={setSelectedLead} />
                  )
                )}
                {view === 'calendar' && (
                  <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-slate-200 border-dashed text-slate-400 p-8 text-center">
                    <div className="bg-slate-50 p-4 rounded-full mb-4">
                      <Calendar size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-700">Agenda em Breve</h3>
                    <p className="max-w-xs mx-auto mt-2">Estamos trabalhando na integração com Google Calendar para agendamentos automáticos.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {/* Toast Notification */}
        <AnimatePresence>
          {newLeadNotification && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%', scale: 0.9 }}
              animate={{ opacity: 1, y: 0, x: '-50%', scale: 1 }}
              exit={{ opacity: 0, y: 20, x: '-50%', scale: 0.9 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 z-50 cursor-pointer border border-white/10 hover:scale-105 transition-transform"
              onClick={() => {
                setView('dashboard');
                setNewLeadNotification(null);
              }}
            >
              <div className="bg-green-500 rounded-full p-2 shadow-lg shadow-green-500/20">
                <Bell size={16} fill="currentColor" />
              </div>
              <div>
                <p className="font-semibold text-sm">Novo Lead Recebido!</p>
                <p className="text-xs text-slate-300">{newLeadNotification.name} acabou de entrar.</p>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNewLeadNotification(null);
                }}
                className="ml-2 text-slate-400 hover:text-white p-1 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={16} />
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

      {/* Lead Details Modal */}
      {selectedLead && (
        <LeadDetails 
          lead={selectedLead} 
          onClose={() => setSelectedLead(null)} 
          onUpdate={fetchLeads} 
        />
      )}
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
        active 
          ? "bg-indigo-50 text-indigo-700 shadow-sm" 
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      {icon}
      <span>{label}</span>
      {active && (
        <motion.div 
          layoutId="active-nav"
          className="absolute left-0 w-1 h-8 bg-indigo-600 rounded-r-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />
      )}
    </motion.button>
  );
}
