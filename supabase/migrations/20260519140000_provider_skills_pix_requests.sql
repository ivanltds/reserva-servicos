-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - MILESTONE 2 (JORNADA DO PRESTADOR E SERVIÇOS)
-- Adiciona colunas de habilidades e chaves PIX na tabela de prestadores

ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS skills text[] DEFAULT '{}';
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS pix_key_type text CHECK (pix_key_type in ('cpf', 'phone', 'email', 'random'));
ALTER TABLE public.service_providers ADD COLUMN IF NOT EXISTS pix_key text;

-- Criação da Tabela public.service_requests para gerenciar os agendamentos e o ciclo de vida do Kanban
CREATE TABLE IF NOT EXISTS public.service_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  service_type text NOT NULL,
  neighborhood text NOT NULL,
  address text,
  scheduled_at timestamp with time zone,
  duration_hours numeric,
  value numeric NOT NULL,
  status text NOT NULL DEFAULT 'Solicitado(aguardando pagamento)',
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para public.service_requests
CREATE POLICY "Permitir leitura de solicitações relevantes" ON public.service_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = provider_id OR 
    status = 'Solicitado (Pagamento aprovado)' OR 
    public.is_operator(auth.uid())
  );

CREATE POLICY "Permitir inserção de solicitações pelo próprio cliente" ON public.service_requests
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = client_id OR
    public.is_operator(auth.uid())
  );

CREATE POLICY "Permitir atualização de solicitações pelos envolvidos ou gestores" ON public.service_requests
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = client_id OR 
    auth.uid() = provider_id OR 
    status = 'Solicitado (Pagamento aprovado)' OR
    public.is_operator(auth.uid())
  );
