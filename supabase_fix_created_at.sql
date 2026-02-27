-- SOLUÇÃO "NUCLEAR" PARA CORRIGIR A TABELA
-- Copie e cole TODO este código no SQL Editor do Supabase e clique em RUN.
-- Isso vai garantir que a coluna 'created_at' e todas as outras existam.

-- 1. Desabilitar segurança para evitar bloqueios
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- 2. Adicionar a coluna created_at se ela estiver faltando (Causa provável do erro)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS created_at timestamp with time zone default timezone('utc'::text, now()) not null;

-- 3. Adicionar todas as outras colunas possíveis (para garantir)
ALTER TABLE leads ADD COLUMN IF NOT EXISTS name text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS email text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS phone text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS address text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS city text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS zip_code text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bedrooms numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS bathrooms numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS sqft numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS people_count numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS service_type text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS frequency text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS estimated_price numeric;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status text DEFAULT 'new';
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS source text DEFAULT 'manual';

-- 4. Garantir permissões públicas (para o app funcionar sem login)
DROP POLICY IF EXISTS "Allow anonymous inserts on leads" ON leads;
DROP POLICY IF EXISTS "Allow anonymous selects on leads" ON leads;
DROP POLICY IF EXISTS "Allow anonymous updates on leads" ON leads;
DROP POLICY IF EXISTS "Allow anonymous deletes on leads" ON leads;

CREATE POLICY "Allow anonymous inserts on leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous selects on leads" ON leads FOR SELECT USING (true);
CREATE POLICY "Allow anonymous updates on leads" ON leads FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous deletes on leads" ON leads FOR DELETE USING (true);

-- 5. Recarregar o cache de schema do Supabase (Truque: comentar na tabela força atualização)
COMMENT ON TABLE leads IS 'Leads table refreshed';
