-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - SUPORTE A USUÁRIOS HÍBRIDOS
-- Remove a constraint restritiva de role única para permitir flexibilidade ou múltiplos papeis

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IS NOT NULL);

-- Adiciona coluna is_hybrid para facilitar queries rápidas se necessário, 
-- mas a lógica principal será baseada na existência em tabelas específicas.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_hybrid BOOLEAN DEFAULT false;

-- Atualiza a função handle_new_user para não sobrescrever dados se o perfil já existir
-- (Embora o trigger seja AFTER INSERT on auth.users, o signUp pode ser chamado para usuários existentes)
-- Criamos uma função de UPSERT para o perfil para lidar com o fluxo de "já cadastrado"
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
