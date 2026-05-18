-- ✅ RPC pública para verificar disponibilidade de e-mail e CPF antes do cadastro
-- SECURITY DEFINER: acessa auth.users sem expor dados sensíveis ao cliente

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
  -- Considera e-mail indisponível apenas se o usuário já completou o onboarding (existe em public.service_providers)
  -- OU se for um perfil administrativo (operator ou master) que já está cadastrado.
  SELECT EXISTS(
    SELECT 1 FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
    WHERE LOWER(u.email) = LOWER(p_email)
      AND (
        EXISTS (SELECT 1 FROM public.service_providers sp WHERE sp.id = u.id)
        OR p.role IN ('operator', 'master')
      )
  ) INTO email_taken;

  -- Considera CPF indisponível apenas se o perfil já completou o onboarding
  -- OU se for um perfil administrativo.
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

-- Garante que qualquer usuário anônimo/autenticado possa chamar esta função
GRANT EXECUTE ON FUNCTION public.check_registration_availability(text, text) TO anon, authenticated;
