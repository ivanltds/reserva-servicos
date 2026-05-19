-- 🛠️ RESERVA SERVIÇOS - SCHEMA MIGRATION - AUTO CONFIRMAÇÃO DE USUÁRIOS
-- Trigger para auto-confirmar e-mails de novos usuários.
-- Evita o travamento do fluxo de cadastro em ambientes de desenvolvimento/teste onde a confirmação de e-mail do Supabase Cloud está ativada.

CREATE OR REPLACE FUNCTION public.auto_confirm_new_users()
RETURNS TRIGGER AS $$
BEGIN
  NEW.email_confirmed_at := COALESCE(NEW.email_confirmed_at, NOW());
  NEW.confirmed_at := COALESCE(NEW.confirmed_at, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remove o trigger antigo se existir
DROP TRIGGER IF EXISTS tr_auto_confirm_new_users ON auth.users;

-- Cria o trigger BEFORE INSERT na tabela auth.users
CREATE TRIGGER tr_auto_confirm_new_users
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_new_users();
