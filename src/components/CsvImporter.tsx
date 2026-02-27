import React, { useState, useRef } from 'react';
import { Upload, X, FileSpreadsheet, Check, AlertCircle, Loader2, ArrowRight, Database, FileText } from 'lucide-react';
import Papa from 'papaparse';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface CsvImporterProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CsvImporter({ onClose, onSuccess }: CsvImporterProps) {
  const [step, setStep] = useState<'upload' | 'map' | 'processing' | 'success'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<any[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Colunas esperadas no banco de dados Supabase
  const dbFields = [
    { key: 'name', label: 'Nome', required: true },
    { key: 'email', label: 'Email', required: false },
    { key: 'phone', label: 'Telefone', required: false },
    { key: 'zip_code', label: 'Zip Code', required: false },
    { key: 'type', label: 'Type (One-time/Recurring)', required: false },
    { key: 'bedrooms', label: 'Bedrooms', required: false },
    { key: 'bathrooms', label: 'Bathrooms', required: false },
    { key: 'sqft', label: 'Sqft', required: false },
    { key: 'people_count', label: 'Pessoas', required: false },
    { key: 'service', label: 'Service', required: false },
    { key: 'estimated_price', label: 'Estimated Price', required: false },
    { key: 'city', label: 'Cidade', required: false },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      parseFile(selectedFile);
    }
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      preview: 5, // Ler apenas as primeiras 5 linhas para preview
      complete: (results) => {
        setPreview(results.data);
        // Tentar mapear automaticamente
        const headers = results.meta.fields || [];
        const initialMapping: Record<string, string> = {};
        
        headers.forEach(header => {
          const lowerHeader = header.toLowerCase();
          if (lowerHeader.includes('nome') || lowerHeader.includes('name')) initialMapping['name'] = header;
          else if (lowerHeader.includes('email')) initialMapping['email'] = header;
          else if (lowerHeader.includes('tele') || lowerHeader.includes('phone')) initialMapping['phone'] = header;
          else if (lowerHeader.includes('zip') || lowerHeader.includes('cep')) initialMapping['zip_code'] = header;
          else if (lowerHeader.includes('type') || lowerHeader.includes('tipo')) initialMapping['type'] = header;
          else if (lowerHeader.includes('bed') || lowerHeader.includes('quarto')) initialMapping['bedrooms'] = header;
          else if (lowerHeader.includes('bath') || lowerHeader.includes('banheiro')) initialMapping['bathrooms'] = header;
          else if (lowerHeader.includes('sqft') || lowerHeader.includes('area')) initialMapping['sqft'] = header;
          else if (lowerHeader.includes('pessoa') || lowerHeader.includes('people')) initialMapping['people_count'] = header;
          else if (lowerHeader.includes('service') || lowerHeader.includes('serviço')) initialMapping['service'] = header;
          else if (lowerHeader.includes('estim') || lowerHeader.includes('price') || lowerHeader.includes('preço')) initialMapping['estimated_price'] = header;
          else if (lowerHeader.includes('cidade') || lowerHeader.includes('city')) initialMapping['city'] = header;
        });
        
        setMapping(initialMapping);
        setStep('map');
      },
      error: (err) => {
        setError('Erro ao ler arquivo CSV: ' + err.message);
      }
    });
  };

  const handleImport = async () => {
    if (!file) return;
    setStep('processing');
    setProgress(0);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const allRows = results.data;
          setTotalCount(allRows.length);
          
          const BATCH_SIZE = 50;
          let currentProcessed = 0;

          // Processar em lotes
          for (let i = 0; i < allRows.length; i += BATCH_SIZE) {
            const batch = allRows.slice(i, i + BATCH_SIZE);
            
            const rowsToInsert = batch.map((row: any) => {
              const newRow: any = {
                status: 'new', // Status padrão
                created_at: new Date().toISOString()
              };
              
              // Aplicar mapeamento
              Object.entries(mapping).forEach(([dbField, csvHeader]) => {
                let value = row[csvHeader as string];
                
                // Limpeza básica de dados
                if (['estimated_price', 'bedrooms', 'bathrooms', 'sqft', 'people_count'].includes(dbField)) {
                  const cleanStr = value ? value.toString().replace(/[^0-9.]/g, '') : '';
                  const num = parseFloat(cleanStr);
                  value = isNaN(num) ? null : num;
                }
                
                newRow[dbField] = value;
              });

              return newRow;
            });

            // Enviar lote para Supabase
            const { error } = await supabase.from('leads').insert(rowsToInsert);

            if (error) {
              console.error('Supabase error:', error);
              throw error;
            }

            currentProcessed += batch.length;
            setProcessedCount(currentProcessed);
            setProgress(Math.round((currentProcessed / allRows.length) * 100));
            
            // Pequeno delay para permitir atualização da UI e não travar o navegador
            await new Promise(resolve => setTimeout(resolve, 50));
          }

          setStep('success');
          onSuccess();
        } catch (err: any) {
          console.error('Full import error:', err);
          let errorMessage = 'Erro desconhecido';
          
          if (err && typeof err === 'object') {
             errorMessage = err.message || err.details || err.hint || JSON.stringify(err);
             if (errorMessage === '{}') errorMessage = 'Erro de conexão. Verifique se a tabela "leads" existe no Supabase.';
          } else {
             errorMessage = String(err);
          }

          setError('Erro: ' + errorMessage);
          setStep('map');
        }
      }
    });
  };

  const reset = () => {
    setFile(null);
    setPreview([]);
    setMapping({});
    setStep('upload');
    setError(null);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-50 p-2 rounded-lg">
              <Database className="text-indigo-600 h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-800">Importar Leads</h2>
              <p className="text-xs text-slate-500">Adicione contatos em massa via CSV</p>
            </div>
          </div>
          {step !== 'processing' && (
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded-full transition-colors">
              <X size={20} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: UPLOAD */}
            {step === 'upload' && (
              <motion.div 
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full flex flex-col items-center justify-center py-8"
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full max-w-xl border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-white hover:bg-indigo-50/30 rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 group"
                >
                  <div className="h-16 w-16 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Upload size={32} />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">Clique para enviar ou arraste aqui</h3>
                  <p className="text-slate-500 mb-6 max-w-xs mx-auto">Suportamos arquivos .CSV com até 10.000 linhas. Certifique-se que seu arquivo está formatado corretamente.</p>
                  
                  <div className="flex gap-3 text-xs text-slate-400 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
                    <span className="flex items-center gap-1"><FileText size={12} /> .CSV</span>
                    <span className="w-px h-4 bg-slate-200"></span>
                    <span>UTF-8 Encoded</span>
                  </div>
                  
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    accept=".csv" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 2: MAPPING */}
            {step === 'map' && file && (
              <motion.div 
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                      <FileSpreadsheet size={20} />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • {preview.length > 0 ? 'Preview carregado' : 'Lendo...'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={reset}
                    className="text-sm text-red-600 hover:text-red-700 font-medium px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Trocar arquivo
                  </button>
                </div>

                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h3 className="font-semibold text-slate-800">Mapeamento de Colunas</h3>
                    <p className="text-sm text-slate-500">Associe as colunas do seu arquivo aos campos do sistema.</p>
                  </div>
                  
                  <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                    {dbFields.map((field) => {
                      const isMapped = !!mapping[field.key];
                      return (
                        <div key={field.key} className="p-4 hover:bg-slate-50 transition-colors grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                          <div className="sm:col-span-4">
                            <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                              {field.label}
                              {field.required && <span className="text-red-500 text-xs" title="Obrigatório">*</span>}
                              {isMapped && <Check size={14} className="text-green-500" />}
                            </label>
                            <p className="text-xs text-slate-400">Campo do sistema</p>
                          </div>
                          
                          <div className="hidden sm:flex sm:col-span-1 justify-center text-slate-300">
                            <ArrowRight size={16} />
                          </div>

                          <div className="sm:col-span-7">
                            <select 
                              className={cn(
                                "w-full text-sm rounded-lg border-slate-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all",
                                isMapped ? "bg-indigo-50/30 border-indigo-200 text-indigo-900" : "text-slate-500"
                              )}
                              value={mapping[field.key] || ''}
                              onChange={(e) => setMapping(prev => ({ ...prev, [field.key]: e.target.value }))}
                            >
                              <option value="">Ignorar coluna</option>
                              {preview.length > 0 && Object.keys(preview[0]).map((header) => (
                                <option key={header} value={header}>{header} (Ex: {preview[0][header]?.toString().slice(0, 15)}...)</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING */}
            {step === 'processing' && (
              <motion.div 
                key="processing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-6"
              >
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full transform -rotate-90">
                    <circle
                      className="text-slate-100"
                      strokeWidth="8"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                    <circle
                      className="text-indigo-600 transition-all duration-300 ease-out"
                      strokeWidth="8"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * progress) / 100}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="40"
                      cx="48"
                      cy="48"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xl font-bold text-indigo-600">{progress}%</span>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Importando seus dados...</h3>
                  <p className="text-slate-500 mt-1">Processando lote {Math.ceil(processedCount / 50)} de {Math.ceil(totalCount / 50)}</p>
                  <p className="text-xs text-slate-400 mt-2">{processedCount} de {totalCount} registros processados</p>
                </div>

                <div className="w-full max-w-sm bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center space-y-6"
              >
                <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <Check size={40} strokeWidth={3} />
                </div>
                
                <div>
                  <h3 className="text-2xl font-bold text-slate-800">Importação Concluída!</h3>
                  <p className="text-slate-600 mt-2 text-lg">Todos os {totalCount} leads foram importados com sucesso.</p>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full max-w-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Total processado</span>
                    <span className="font-semibold text-slate-900">{totalCount}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-500">Erros</span>
                    <span className="font-semibold text-slate-900">0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Tempo estimado</span>
                    <span className="font-semibold text-slate-900">&lt; 1 min</span>
                  </div>
                </div>

                <button 
                  onClick={onClose}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Voltar ao Dashboard
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3"
            >
              <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">Ocorreu um erro</h4>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer Actions (Only for Map Step) */}
        {step === 'map' && (
          <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-white sticky bottom-0 z-10">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={handleImport}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <Check size={18} />
              Confirmar e Importar
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
