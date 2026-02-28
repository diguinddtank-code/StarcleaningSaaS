import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Job } from '../types';
import { formatCurrency } from '../lib/utils';
import { Download, TrendingUp, DollarSign, Users, Calendar as CalendarIcon, Filter } from 'lucide-react';
import AnimatedButton from './AnimatedButton';

export default function FinancialReports() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7) // YYYY-MM
  );

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      // Fallback empty state if table doesn't exist
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.date.startsWith(selectedMonth) && job.status === 'completed'
  );

  const totalRevenue = filteredJobs.reduce((sum, job) => sum + (job.amount || 0), 0);
  const totalTeamPay = filteredJobs.reduce((sum, job) => sum + (job.team_pay || 0), 0);
  const totalProfit = totalRevenue - totalTeamPay;

  const exportToCSV = () => {
    if (filteredJobs.length === 0) return;

    const headers = ['Data', 'Equipe', 'Valor Cobrado', 'Pago à Equipe', 'Lucro', 'Status'];
    const csvData = filteredJobs.map(job => [
      new Date(job.date).toLocaleDateString(),
      job.team || '-',
      job.amount || 0,
      job.team_pay || 0,
      (job.amount || 0) - (job.team_pay || 0),
      job.status
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_limpezas_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get unique months for filter
  const availableMonths = Array.from(new Set(jobs.map(j => j.date.slice(0, 7)))).sort().reverse() as string[];
  if (!availableMonths.includes(selectedMonth)) {
    availableMonths.unshift(selectedMonth);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <CalendarIcon size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">Relatório Mensal</h2>
            <p className="text-sm text-slate-500">Acompanhe o faturamento e custos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full sm:w-48 appearance-none bg-slate-50 border border-slate-200 text-slate-700 py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-medium"
            >
              {availableMonths.map((month: string) => {
                const [year, m] = month.split('-');
                const date = new Date(parseInt(year), parseInt(m) - 1);
                return (
                  <option key={month} value={month}>
                    {date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }).replace(/^\w/, c => c.toUpperCase())}
                  </option>
                );
              })}
            </select>
            <Filter size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
          <AnimatedButton 
            variant="outline" 
            onClick={exportToCSV}
            icon={<Download size={16} />}
            disabled={filteredJobs.length === 0}
          >
            <span className="hidden sm:inline">Exportar CSV</span>
          </AnimatedButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <DollarSign size={64} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Faturamento Total</p>
            <h3 className="text-3xl font-bold text-slate-800">{formatCurrency(totalRevenue)}</h3>
            <p className="text-xs text-slate-400 mt-2">Limpezas concluídas no mês</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Users size={64} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Pagamento Equipes</p>
            <h3 className="text-3xl font-bold text-red-600">{formatCurrency(totalTeamPay)}</h3>
            <p className="text-xs text-slate-400 mt-2">Custo operacional no mês</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} />
          </div>
          <div className="relative z-10">
            <p className="text-sm font-medium text-slate-500 mb-1">Lucro Bruto</p>
            <h3 className="text-3xl font-bold text-green-600">{formatCurrency(totalProfit)}</h3>
            <p className="text-xs text-slate-400 mt-2">Margem: {totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0}%</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Limpezas Realizadas ({filteredJobs.length})</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 sm:px-6 py-3">Data</th>
                <th className="px-4 sm:px-6 py-3">Equipe</th>
                <th className="px-4 sm:px-6 py-3 text-right">Cobrado</th>
                <th className="px-4 sm:px-6 py-3 text-right">Pago Equipe</th>
                <th className="px-4 sm:px-6 py-3 text-right">Lucro</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredJobs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <DollarSign size={32} className="mx-auto mb-3 text-slate-300" />
                    <p>Nenhuma limpeza concluída registrada neste mês.</p>
                  </td>
                </tr>
              ) : (
                filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 whitespace-nowrap">{new Date(job.date).toLocaleDateString()}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-700">{job.team || '-'}</td>
                    <td className="px-4 sm:px-6 py-4 text-right font-medium">{formatCurrency(job.amount)}</td>
                    <td className="px-4 sm:px-6 py-4 text-right text-red-600 font-medium">{formatCurrency(job.team_pay || 0)}</td>
                    <td className="px-4 sm:px-6 py-4 text-right text-green-600 font-medium">{formatCurrency((job.amount || 0) - (job.team_pay || 0))}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
