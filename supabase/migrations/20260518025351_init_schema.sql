-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - MILESTONE 1 (FONDAÇÃO)

-- 1. Criação da Tabela public.profiles
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  name text not null,
  cpf text unique,
  phone text,
  role text default 'candidate' check (role in ('candidate', 'provider', 'operator', 'master')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Criação da Tabela public.service_providers
create table public.service_providers (
  id uuid references public.profiles on delete cascade primary key,
  status text default 'Pendente' check (status in ('Pendente', 'Aprovado', 'Rejeitado')),
  cep text not null,
  rua text not null,
  num text not null,
  comp text,
  bairro text not null,
  cidade text not null,
  loc text not null,
  selfie_path text,
  document_path text,
  is_verified boolean default false,
  verified_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Índices de Performance para Alta Concorrência
create index idx_profiles_cpf on public.profiles(cpf);
create index idx_service_providers_status on public.service_providers(status);

-- 4. Função e Trigger para Auto-Registro de Perfis a partir da Autenticação do Supabase
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'Usuário Novo'),
    coalesce(new.raw_user_meta_data->>'role', 'candidate')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. Habilitar Row Level Security (RLS) para Segurança dos Dados
alter table public.profiles enable row level security;
alter table public.service_providers enable row level security;

-- 6. Políticas RLS para public.profiles
create policy "Permitir leitura do próprio perfil" on public.profiles
  for select using (auth.uid() = id);

create policy "Permitir operadores lerem todos os perfis" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('operator', 'master')
    )
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
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('operator', 'master')
    )
  );

create policy "Permitir inserção do próprio cadastro de prestador" on public.service_providers
  for insert with check (auth.uid() = id);

create policy "Permitir atualização do próprio cadastro de prestador" on public.service_providers
  for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Permitir operadores atualizarem qualquer cadastro de prestador" on public.service_providers
  for update using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('operator', 'master')
    )
  );

-- 8. Setup dos Buckets Temporários de Armazenamento Seguro
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('selfies-temp', 'selfies-temp', false, 5242880, '{image/jpeg,image/png,image/webp}'),
  ('criminologia-temp', 'criminologia-temp', false, 10485760, '{image/jpeg,image/png,image/webp,application/pdf}')
on conflict (id) do nothing;

-- 9. Políticas RLS no Storage Objects para Proteção à LGPD
create policy "Permitir upload para candidatos autenticados" on storage.objects
  for insert to authenticated
  with check (
    bucket_id in ('selfies-temp', 'criminologia-temp')
  );

create policy "Permitir leitura de documentos apenas para operadores" on storage.objects
  for select to authenticated
  using (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('operator', 'master')
    )
  );

create policy "Permitir exclusão de documentos apenas para operadores" on storage.objects
  for delete to authenticated
  using (
    bucket_id in ('selfies-temp', 'criminologia-temp') and
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('operator', 'master')
    )
  );
