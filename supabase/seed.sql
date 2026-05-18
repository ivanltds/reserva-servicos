-- 🌱 RESERVA SERVIÇOS — SEED DE DESENVOLVIMENTO
-- Cria usuários fixos de gestão para testes. Senha padrão: Admin@123
-- Execute via: npx supabase db reset

-- ────────────────────────────────────────────────────────────────
-- Usuário OPERATOR (Gestor de Triagem)
-- ────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_operator_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    v_operator_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'gestor@reserva.local',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Gestor Reserva", "role": "operator", "cpf": "000.000.000-01", "phone": "(11) 90000-0001"}',
    NOW(), NOW(),
    '', '', '', ''
  );
  -- O trigger on_auth_user_created cria o perfil automaticamente
END;
$$;

-- ────────────────────────────────────────────────────────────────
-- Usuário MASTER (Super Admin)
-- ────────────────────────────────────────────────────────────────
DO $$
DECLARE
  v_master_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES (
    v_master_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'master@reserva.local',
    crypt('Admin@123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Master Reserva", "role": "master", "cpf": "000.000.000-02", "phone": "(11) 90000-0002"}',
    NOW(), NOW(),
    '', '', '', ''
  );
  -- O trigger on_auth_user_created cria o perfil automaticamente
END;
$$;
