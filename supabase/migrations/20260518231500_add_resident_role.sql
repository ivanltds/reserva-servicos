-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - MILESTONE 2 (JORNADA DO CLIENTE)
-- Atualização da constraint de role na tabela public.profiles para suportar 'resident' e 'client'

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role in ('candidate', 'provider', 'operator', 'master', 'resident', 'client'));

-- Criação da Tabela public.residents
CREATE TABLE IF NOT EXISTS public.residents (
  id uuid REFERENCES public.profiles ON DELETE CASCADE PRIMARY KEY,
  cep text NOT NULL,
  rua text NOT NULL,
  num text NOT NULL,
  comp text,
  bairro text NOT NULL,
  cidade text NOT NULL,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar Row Level Security (RLS) para a tabela de residentes
ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para public.residents
CREATE POLICY "Permitir leitura do próprio cadastro de residente" ON public.residents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Permitir operadores lerem todos os cadastros de residentes" ON public.residents
  FOR SELECT USING (public.is_operator(auth.uid()));

CREATE POLICY "Permitir inserção do próprio cadastro de residente" ON public.residents
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir atualização do próprio cadastro de residente" ON public.residents
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
