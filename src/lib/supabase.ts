import { createClient } from '@supabase/supabase-js';

// As credenciais foram fornecidas pelo usuário.
// Em produção, essas variáveis devem estar no arquivo .env
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL || 'https://supabase.infra-remakingautomacoes.cloud';
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzE1MDUwODAwLAogICJleHAiOiAxODcyODE3MjAwCn0.VFKkaPwcpuWYV2L-iMR5K_07259lQZvOUX67u0a8W4Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
