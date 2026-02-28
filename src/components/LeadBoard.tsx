import React from 'react';
import { Lead, LEAD_STATUSES } from '../types';
import { DndContext, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '../lib/utils';
import { MapPin, Calendar, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

// LeadBoard Component for Kanban View

export default function LeadBoard({ leads, onUpdate }: { leads: Lead[], onUpdate: () => void }) {
  
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const leadId = active.id;
      const newStatus = over.id;
      
      // Optimistic update could happen here, but we'll just call API
      try {
        const { error } = await supabase
          .from('leads')
          .update({ status: newStatus })
          .eq('id', leadId);

        if (error) throw error;
        
        onUpdate();
      } catch (error) {
        console.error('Failed to update status', error);
        alert('Erro ao atualizar status. Tente novamente.');
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este lead?')) {
      try {
        const { error } = await supabase.from('leads').delete().eq('id', id);
        if (error) throw error;
        onUpdate();
      } catch (error) {
        console.error('Failed to delete lead', error);
        alert('Erro ao excluir lead.');
      }
    }
  };

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex h-full gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status, index) => (
          <motion.div
            key={status.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Column 
              status={status} 
              leads={leads.filter(l => (l.status?.toLowerCase() || 'new') === status.id)} 
              onDelete={handleDelete}
            />
          </motion.div>
        ))}
      </div>
    </DndContext>
  );
}

const Column: React.FC<{ status: typeof LEAD_STATUSES[number], leads: Lead[], onDelete: (id: number) => void }> = ({ status, leads, onDelete }) => {
  const { setNodeRef } = useDroppable({
    id: status.id,
  });

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80 bg-slate-100/50 rounded-xl flex flex-col h-full border border-slate-200/60">
      {/* ... header ... */}
      <div className="p-3 border-b border-slate-200/60 flex items-center justify-between sticky top-0 bg-slate-100/50 backdrop-blur-sm rounded-t-xl z-10">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", status.color.split(' ')[0].replace('bg-', 'bg-opacity-100 bg-'))} />
          <h3 className="font-semibold text-slate-700 text-sm">{status.label}</h3>
        </div>
        <span className="bg-white px-2 py-0.5 rounded-md text-xs font-medium text-slate-500 shadow-sm">
          {leads.length}
        </span>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto space-y-2">
        {leads.map(lead => (
          <DraggableLeadCard key={lead.id} lead={lead} onDelete={() => onDelete(lead.id)} />
        ))}
      </div>
    </div>
  );
};

const DraggableLeadCard: React.FC<{ lead: Lead, onDelete: () => void }> = ({ lead, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: lead.id,
  });
  
  const style = transform ? {
    transform: CSS.Translate.toString(transform),
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group relative"
    >
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 size={14} />
      </button>

      <div className="flex justify-between items-start mb-2 pr-6">
        <h4 className="font-medium text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{lead.name}</h4>
        {lead.estimated_price && (
          <span className="text-xs font-medium text-green-700 bg-green-50 px-1.5 py-0.5 rounded">
            ${lead.estimated_price}
          </span>
        )}
      </div>
      
      {/* ... rest of card ... */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin size={12} />
          <span className="truncate">{lead.city || 'No location'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={12} />
          <span className="truncate">{lead.service_type} • {lead.frequency}</span>
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-slate-50 flex justify-between items-center">
        <span className="text-[10px] text-slate-400">
          {lead.created_at && !isNaN(new Date(lead.created_at).getTime()) 
            ? new Date(lead.created_at).toLocaleDateString() 
            : 'Sem data'}
        </span>
        <div className="h-5 w-5 rounded-full bg-slate-100 text-[10px] flex items-center justify-center text-slate-500 font-medium">
          {lead.name.charAt(0)}
        </div>
      </div>
    </div>
  );
};
