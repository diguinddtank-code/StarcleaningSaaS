import React from 'react';
import { Lead, LEAD_STATUSES } from '../types';
import { Users, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardStats({ leads }: { leads: Lead[] }) {
  const totalLeads = leads.length;
  const wonLeads = leads.filter(l => l.status === 'won').length;
  const conversionRate = totalLeads > 0 ? Math.round((wonLeads / totalLeads) * 100) : 0;
  
  // Calculate potential value (all active leads)
  const pipelineValue = leads
    .filter(l => ['new', 'contacted', 'quoted', 'scheduled'].includes(l.status))
    .reduce((sum, l) => sum + (l.estimated_price || 0), 0);

  // Data for chart by status
  const statusData = LEAD_STATUSES.map(status => ({
    name: status.label,
    count: leads.filter(l => l.status === status.id).length
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Leads" 
          value={totalLeads.toString()} 
          icon={<Users className="text-blue-600" />} 
          trend="+12% this month"
        />
        <StatCard 
          title="Pipeline Value" 
          value={formatCurrency(pipelineValue)} 
          icon={<DollarSign className="text-green-600" />} 
          trend="Active opportunities"
        />
        <StatCard 
          title="Conversion Rate" 
          value={`${conversionRate}%`} 
          icon={<TrendingUp className="text-purple-600" />} 
          trend="Vs. 15% last month"
        />
        <StatCard 
          title="Jobs Won" 
          value={wonLeads.toString()} 
          icon={<CheckCircle className="text-indigo-600" />} 
          trend="Completed bookings"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Lead Pipeline Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tick={{fontSize: 12}} interval={0} />
                <YAxis allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {leads.slice(0, 5).map(lead => (
              <div key={lead.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="font-medium text-slate-800">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.city} • {lead.service_type}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  LEAD_STATUSES.find(s => s.id === lead.status)?.color
                }`}>
                  {LEAD_STATUSES.find(s => s.id === lead.status)?.label}
                </span>
              </div>
            ))}
            {leads.length === 0 && (
              <p className="text-slate-400 text-sm text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
        </div>
        <div className="p-2 bg-slate-50 rounded-lg">
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-400 mt-4">{trend}</p>
    </div>
  );
}
