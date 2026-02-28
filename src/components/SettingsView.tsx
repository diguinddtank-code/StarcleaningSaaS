import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings, Link as LinkIcon, Phone, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function SettingsView() {
  const [activeTab, setActiveTab] = useState<'general' | 'integrations'>('integrations');

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('general')}
            className={`pb-4 -mb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Geral
          </button>
          <button
            onClick={() => setActiveTab('integrations')}
            className={`pb-4 -mb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'integrations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
            }`}
          >
            Integrações
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
        {activeTab === 'general' && (
          <div className="max-w-3xl">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Configurações Gerais</h2>
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <p className="text-slate-500 text-sm">Opções gerais do sistema (em desenvolvimento).</p>
            </div>
          </div>
        )}

        {activeTab === 'integrations' && (
          <div className="max-w-4xl space-y-8">
            <div>
              <h2 className="text-lg font-semibold text-slate-800 mb-1">Integrações de Parceiros</h2>
              <p className="text-sm text-slate-500 mb-6">Conecte seu CRM com outras ferramentas para automatizar o fluxo de trabalho.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* MaidPad Integration */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                          <Calendar size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">MaidPad</h3>
                          <p className="text-xs text-slate-500">Gestão de Limpezas</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Não conectado
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4">
                      Sincronize clientes automaticamente. Quando um Lead for marcado como "Ganho", ele será enviado para o MaidPad para agendamento.
                    </p>
                    
                    <div className="space-y-3 mt-6">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Como funciona a integração:</h4>
                        <ul className="text-xs text-slate-600 space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 size={14} className="text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                            <span><strong>Webhook:</strong> O CRM envia um sinal (POST) para a API do MaidPad sempre que o status do lead muda para "Won".</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 size={14} className="text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                            <span><strong>Criação de Cliente:</strong> Nome, telefone, email e endereço são criados no MaidPad automaticamente.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                    <button className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      <LinkIcon size={16} />
                      <span>Conectar ao MaidPad</span>
                    </button>
                  </div>
                </div>

                {/* RingCentral Integration */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="p-6 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                          <Phone size={24} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900">RingCentral</h3>
                          <p className="text-xs text-slate-500">Telefonia e SMS</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                        Não conectado
                      </span>
                    </div>
                    
                    <p className="text-sm text-slate-600 mb-4">
                      Faça ligações com um clique (Click-to-Dial) e registre o histórico de chamadas e SMS diretamente no perfil do Lead.
                    </p>
                    
                    <div className="space-y-3 mt-6">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <h4 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">Como funciona a integração:</h4>
                        <ul className="text-xs text-slate-600 space-y-2">
                          <li className="flex items-start">
                            <CheckCircle2 size={14} className="text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                            <span><strong>Click-to-Dial:</strong> Clicar no telefone do lead no CRM aciona a API do RingCentral para iniciar a chamada no seu app.</span>
                          </li>
                          <li className="flex items-start">
                            <CheckCircle2 size={14} className="text-emerald-500 mr-1.5 shrink-0 mt-0.5" />
                            <span><strong>Log Automático:</strong> O RingCentral envia webhooks de volta para o CRM quando uma chamada termina, adicionando uma nota ao Lead.</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100">
                    <button className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      <LinkIcon size={16} />
                      <span>Conectar ao RingCentral</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600 shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-1">Como implementar tecnicamente?</h3>
                  <div className="text-sm text-blue-800 space-y-3">
                    <p>Para ativar essas integrações no código, você precisará:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Obter as <strong>Chaves de API (API Keys)</strong> nos painéis do MaidPad e RingCentral.</li>
                      <li>Salvar essas chaves de forma segura nas variáveis de ambiente (<code>.env</code>) do seu servidor ou no Supabase Vault.</li>
                      <li>Criar <strong>Edge Functions no Supabase</strong> para escutar as mudanças no banco de dados (ex: quando <code>status</code> muda para <code>won</code>) e disparar uma requisição HTTP (fetch) para a API do MaidPad.</li>
                      <li>Para o RingCentral, criar um endpoint no Supabase para receber os Webhooks do RingCentral e inserir registros na tabela <code>lead_notes</code>.</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
