-- 🛠️ RESERVA SERVIÇOS - SCHEMA CONSOLIDADO COMPLETO (NUVEM)

-- 1. Criação da Tabela public.profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  cpf text unique,
  phone text,
  role text default 'candidate',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criação da Tabela public.service_providers
create table public.service_providers (
  id uuid references public.profiles on delete cascade primary key,
  status text default 'Pendente' check (status in ('Pendente', 'Aprovado', 'Rejeitado', 'Inativo', 'Banido')),
  cep text not null,
  rua text not null,
  num text not null,
  comp text,
  bairro text not null,
  cidade text not null,
  loc text not null,
  selfie_path text,
  rg_path text,
  document_path text,
  is_verified boolean default false,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_by text,
  audit_checklist jsonb
);

-- 3. Índices de Performance para Alta Concorrência
create index idx_profiles_cpf on public.profiles(cpf);
create index idx_service_providers_status on public.service_providers(status);

-- 4. Função e Trigger para Auto-Registro de Perfis a partir da Autenticação do Supabase
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, cpf, phone, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário Novo'),
    new.raw_user_meta_data->>'cpf',
    new.raw_user_meta_data->>'phone',
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4.5 Função de Segurança para Evitar Recursão RLS (Security Definer)
create or replace function public.is_operator(user_id uuid)
returns boolean as $$
begin
  -- Se for uma chamada do sistema (service_role), retorna verdadeiro
  if auth.role() = 'service_role' then
    return true;
  end if;

  -- Verifica a claim de role nos metadados do JWT do usuário para evitar recursão de RLS
  return coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') in ('operator', 'master');
end;
$$ language plpgsql security definer;

-- 5. Habilitar Row Level Security (RLS) para Segurança dos Dados
alter table public.profiles enable row level security;
alter table public.service_providers enable row level security;

-- 6. Políticas RLS para public.profiles
create policy "Permitir leitura do próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Permitir operadores lerem todos os perfis" on public.profiles
  for select using (
    public.is_operator(auth.uid())
  );

create policy "Permitir inserção do próprio perfil" on public.profiles
  for insert with check (auth.uid() = id);

create policy "Permitir atualização do próprio perfil" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- 7. Políticas RLS para public.service_providers
create policy "Permitir leitura do próprio cadastro de prestador" on public.service_providers
  for select using (auth.uid() = id);

create policy "Permitir operadores lerem todos os cadastros de prestadores" on public.service_providers
  for select using (
    public.is_operator(auth.uid())
  );

create policy "Permitir inserção do próprio cadastro de prestador" on public.service_providers
  for insert with check (auth.uid() = id);

create policy "Permitir atualização do próprio cadastro de prestador" on public.service_providers
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Permitir operadores atualizarem qualquer cadastro de prestador" on public.service_providers
  for update using (
    public.is_operator(auth.uid())
  );

-- 8. Setup dos Buckets Temporários de Armazenamento Seguro
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('selfies-temp', 'selfies-temp', true, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('criminologia-temp', 'criminologia-temp', false, 10485760, '{image/jpeg,image/png,image/webp,application/pdf}')
on conflict (id) do nothing;

-- 9. Políticas RLS no Storage Objects para Proteção à LGPD
create policy "Permitir upload para todos" on storage.objects
  for insert
  with check (
    bucket_id in ('selfies-temp', 'criminologia-temp')
  );

create policy "Permitir leitura de documentos para dono ou operadores" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    (owner = auth.uid() or public.is_operator(auth.uid()))
  );

create policy "Permitir update de documentos para dono ou operadores" on storage.objects
  for update to authenticated
  using (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    (owner = auth.uid() or public.is_operator(auth.uid()))
  )
  with check (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    (owner = auth.uid() or public.is_operator(auth.uid()))
  );

create policy "Permitir exclusão de documentos para dono ou operadores" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    (owner = auth.uid() or public.is_operator(auth.uid()))
  );

-- 10. RPC pública para verificar disponibilidade de e-mail e CPF
CREATE OR REPLACE FUNCTION public.check_registration_availability(p_email text, p_cpf text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  email_taken boolean;
  cpf_taken   boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE LOWER(u.email) = LOWER(p_email)
      AND (
        EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = u.id)
        OR p.role IN ('operator', 'master')
      )
  ) INTO email_taken;

  SELECT EXISTS(
    SELECT 1 FROM public.profiles p
    WHERE REGEXP_REPLACE(p.cpf, '[^0-9]', '', 'g') = REGEXP_REPLACE(p_cpf, '[^0-9]', '', 'g')
      AND (
        EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = p.id)
        OR p.role IN ('operator', 'master')
      )
  ) INTO cpf_taken;

  RETURN json_build_object(
    'email_taken', email_taken,
    'cpf_taken',   cpf_taken
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_registration_availability(text, text) TO anon, authenticated;

-- 11. Customização da constraint de role para Milestone 2
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IS NOT NULL);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hybrid BOOLEAN DEFAULT false;

-- 12. Criação da Tabela public.residents
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

ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir leitura do próprio cadastro de residente" ON public.residents
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Permitir operadores lerem todos os cadastros de residentes" ON public.residents
  FOR SELECT USING (public.is_operator(auth.uid()));

CREATE POLICY "Permitir inserção do próprio cadastro de residente" ON public.residents
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Permitir atualização do próprio cadastro de residente" ON public.residents
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- 13. Função de UPSERT para suportar múltiplos papéis (usuários híbridos)
CREATE OR REPLACE FUNCTION public.upsert_profile_role(user_id UUID, new_role TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.profiles 
  SET role = CASE 
               WHEN role = new_role THEN role 
               ELSE role || ',' || new_role 
             END,
      updated_at = now()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
