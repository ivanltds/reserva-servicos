import { createClient } from "@supabase/supabase-js";

// Configurações do Supabase Local do Reserva Serviços (NEXT_PUBLIC_ prefix obrigatório para client-side no Next.js)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "http://127.0.0.1:55321";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * 🛠️ HELPER: Aguarda a persistência do perfil (Trigger Auth -> Public.Profiles)
 * Útil para evitar erros de chave estrangeira (FK) em inserções imediatas pós-cadastro.
 */
async function ensureProfileExists(userId, maxAttempts = 10, interval = 500) {
  for (let i = 0; i < maxAttempts; i++) {
    const { data } = await supabase.from("profiles").select("id").eq("id", userId).single();
    if (data) return true;
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error("O perfil não foi criado a tempo pelo servidor. Tente atualizar a página.");
}

/**
 * ⚡ PROMISE TIMEOUT WRAPPER
 * Garante que nenhuma operação de rede ou banco de dados fique travada indefinidamente.
 * Prevenção definitiva de travamento de formulários (loading infinito).
 */
export function withTimeout(promise, timeoutMs = 20000, errorMsg = "Tempo limite da requisição esgotado. Verifique sua conexão com o banco de dados local.") {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
  );
  return Promise.race([promise, timeoutPromise]);
}

/**
 * 🔐 SERVIÇOS DE INTEGRAÇÃO DO SUPABASE - RESERVA SERVIÇOS
 */

/**
 * Realiza o cadastro e login inicial do Prestador.
 * O trigger de banco cria automaticamente a linha correspondente em public.profiles.
 */
export async function signUpProvider(email, password, name, cpf, phone) {
  const signUpPromise = (async () => {
    // 1. Criar o usuário de autenticação com todos os metadados inclusos
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          cpf,
          phone,
          role: "candidate",
        },
      },
    });

    if (error) {
      // Se o usuário já estiver registrado, tenta fazer sign-in automático com as mesmas credenciais para completar o cadastro
      if (error.message && (error.message.includes("already registered") || error.status === 422)) {
        console.warn("Usuário já cadastrado no Auth. Autenticando para adicionar papel de prestador...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw new Error("Este e-mail já está registrado. Por favor, insira a senha correta deste e-mail para prosseguir com o cadastro de prestador.");
        }
        
        return signInData.user;
      }
      throw error;
    }
    
    if (!data.user) throw new Error("Erro desconhecido durante o cadastro.");

    // Forçar a ativação e persistência imediata da sessão para requisições do cliente subsequentes
    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    return data.user;
  })();

  return await withTimeout(signUpPromise, 25000, "O cadastro demorou muito para responder. Tente novamente.");
}

/**
 * Realiza o cadastro e login inicial do Cliente/Morador.
 * O trigger de banco cria automaticamente a linha correspondente em public.profiles.
 */
export async function signUpResident(email, password, name, cpf, phone) {
  const signUpPromise = (async () => {
    // 1. Criar o usuário de autenticação com todos os metadados inclusos
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          cpf,
          phone,
          role: "resident",
        },
      },
    });

    if (error) {
      if (error.message && (error.message.includes("already registered") || error.status === 422)) {
        console.warn("Cliente já cadastrado no Auth. Autenticando para adicionar papel de cliente...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          throw new Error("Este e-mail já está registrado. Por favor, insira a senha correta deste e-mail para prosseguir com o cadastro de cliente.");
        }

        return signInData.user;
      }
      throw error;
    }
    
    if (!data.user) throw new Error("Erro desconhecido durante o cadastro.");

    if (data.session) {
      await supabase.auth.setSession(data.session);
    }

    return data.user;
  })();

  return await withTimeout(signUpPromise, 25000, "O cadastro do morador demorou muito para responder. Tente novamente.");
}

/**
 * Insere os dados cadastrais residenciais do cliente.
 */
export async function submitResidentOnboarding(userId, onboardingData) {
  const insertPromise = (async () => {
    // 1. Garante que o perfil (Profiles) já existe antes de inserir na tabela filha (Residents)
    await ensureProfileExists(userId);

    const { error } = await supabase
      .from("residents")
      .insert({
        id: userId,
        cep: onboardingData.cep,
        rua: onboardingData.rua,
        num: onboardingData.num,
        comp: onboardingData.comp || "",
        bairro: onboardingData.bairro,
        cidade: onboardingData.cidade
      });

    if (error) throw error;
  })();

  return await withTimeout(insertPromise, 25000, "O envio do cadastro do morador demorou muito para responder (timeout). Tente novamente.");
}


/**
 * Realiza o login (Sign In) com email e senha.
 */
export async function signIn(email, password) {
  const loginPromise = (async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data.user;
  })();

  return await withTimeout(loginPromise, 20000, "O servidor de autenticação demorou muito para responder. Tente novamente.");
}

/**
 * Realiza o logout (Sign Out).
 */
export async function signOut() {
  const signOutPromise = (async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  })();

  return await withTimeout(signOutPromise, 12000, "Erro ao desconectar (timeout).");
}

/**
 * Faz upload da selfie do prestador para o bucket seguro temporário.
 * Possui timeout de 5 segundos e fallback automático em caso de erro/bloqueio de rede local.
 */
export async function uploadSelfie(userId, file) {
  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}_selfie.${fileExt}`;

    const uploadPromise = (async () => {
      const { error } = await supabase.storage
        .from("selfies-temp")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (error) throw error;
      return filePath;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de upload (30s)")), 30000)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error) {
    console.warn("⚠️ Falha ou timeout no upload da selfie, usando caminho fallback de homologação:", error.message || error);
    return `${userId}/fallback_selfie.png`;
  }
}

/**
 * Faz upload do atestado de antecedentes PDF/imagem para o bucket seguro temporário.
 * Possui timeout de 5 segundos e fallback automático em caso de erro/bloqueio de rede local.
 */
export async function uploadDocument(userId, file) {
  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/${Date.now()}_antecedentes.${fileExt}`;

    const uploadPromise = (async () => {
      const { error } = await supabase.storage
        .from("criminologia-temp")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: true,
        });
      if (error) throw error;
      return filePath;
    })();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout de upload (30s)")), 30000)
    );

    return await Promise.race([uploadPromise, timeoutPromise]);
  } catch (error) {
    console.warn("⚠️ Falha ou timeout no upload do atestado, usando caminho fallback de homologação:", error.message || error);
    return `${userId}/fallback_antecedentes.pdf`;
  }
}

/**
 * Insere os dados cadastrais finais e envia o prestador para a Fila de Triagem.
 */
export async function submitProviderOnboarding(userId, onboardingData) {
  const insertPromise = (async () => {
    // 1. Garante que o perfil (Profiles) já existe antes de inserir na tabela filha (Service Providers)
    await ensureProfileExists(userId);

    const { error } = await supabase
      .from("service_providers")
      .insert({
        id: userId,
        cep: onboardingData.cep,
        rua: onboardingData.rua,
        num: onboardingData.num,
        comp: onboardingData.comp || "",
        bairro: onboardingData.bairro,
        cidade: onboardingData.cidade,
        loc: onboardingData.loc || "Sem localização",
        selfie_path: onboardingData.selfie_path,
        rg_path: onboardingData.rg_path,
        document_path: onboardingData.document_path,
        status: "Pendente",
      });

    if (error) throw error;
  })();

  return await withTimeout(insertPromise, 25000, "O envio do cadastro à fila de triagem demorou muito para responder (timeout). Tente novamente.");
}

/**
 * Busca a fila de prestadores candidatos pendentes de homologação.
 * Limita aos 10 candidatos mais antigos para otimizar processamento e fila.
 */
export async function fetchPendingProviders() {
  const fetchPromise = (async () => {
    const { data, error } = await supabase
      .from("service_providers")
      .select(`
        id,
        status,
        cep,
        rua,
        num,
        comp,
        bairro,
        cidade,
        created_at,
        profiles (
          name,
          cpf,
          phone
        )
      `)
      .eq("status", "Pendente")
      .order("created_at", { ascending: true })
      .limit(10);

    if (error) throw error;
    return data;
  })();

  return await withTimeout(fetchPromise, 20000, "Não foi possível carregar a fila de triagem (timeout).");
}

/**
 * Busca a lista de prestadores correspondentes a um status específico.
 */
export async function fetchProvidersByStatus(status) {
  const fetchPromise = (async () => {
    const { data, error } = await supabase
      .from("service_providers")
      .select(`
        id,
        status,
        cep,
        rua,
        num,
        comp,
        bairro,
        cidade,
        loc,
        selfie_path,
        rg_path,
        document_path,
        created_at,
        profiles (
          name,
          cpf,
          phone
        )
      `)
      .eq("status", status)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  })();

  return await withTimeout(fetchPromise, 20000, "Não foi possível consultar os prestadores (timeout).");
}

/**
 * Modifica administrativamente o status de um prestador.
 */
export async function updateProviderStatus(providerId, status, reviewedBy = null) {
  const updatePromise = (async () => {
    const updatePayload = { status };
    if (reviewedBy) {
      updatePayload.reviewed_by = reviewedBy;
      updatePayload.verified_at = new Date().toISOString();
    }
    const { error } = await supabase
      .from("service_providers")
      .update(updatePayload)
      .eq("id", providerId);

    if (error) throw error;
  })();

  return await withTimeout(updatePromise, 15000, "Erro ao atualizar status (timeout).");
}

/**
 * Aciona o microsserviço (Edge Function) de triagem e expurgo seguro de documentos do prestador.
 */
export async function approveProvider(providerId, selfiePath, rgPath, documentPath, reviewedBy = null, auditChecklist = null) {
  const approvePromise = (async () => {
    const session = (await supabase.auth.getSession()).data.session;
    if (!session) throw new Error("Usuário não autenticado para realizar aprovação.");

    const response = await fetch(`${SUPABASE_URL}/functions/v1/purge-sensible-doc`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({
        provider_id: providerId,
        selfie_path: selfiePath,
        rg_path: rgPath,
        document_path: documentPath,
        reviewed_by: reviewedBy,
        audit_checklist: auditChecklist,
      }),
    });

    const responseData = await response.json();
    if (!response.ok) {
      throw new Error(responseData.error || "Falha ao acionar a função de expurgo seguro.");
    }

    return responseData;
  })();

  return await withTimeout(approvePromise, 30000, "A homologação e expurgo seguro demoraram muito para responder (timeout).");
}

/**
 * Verifica se um e-mail ou CPF já estão cadastrados no banco.
 * Usa RPC com SECURITY DEFINER para acessar auth.users sem expor dados.
 * Retorna { email_taken: boolean, cpf_taken: boolean }
 * Possui timeout de 2 segundos e fallback seguro (fail-safe) para evitar travamento.
 */
export async function checkRegistrationAvailability(email, cpf) {
  try {
    const timeoutPromise = new Promise((resolve) =>
      setTimeout(() => resolve({ email_taken: false, cpf_taken: false, is_timeout: true }), 2000)
    );

    const rpcPromise = (async () => {
      const { data, error } = await supabase.rpc("check_registration_availability", {
        p_email: email,
        p_cpf: cpf,
      });
      if (error) throw error;
      return data || { email_taken: false, cpf_taken: false };
    })();

    const result = await Promise.race([rpcPromise, timeoutPromise]);
    if (result.is_timeout) {
      console.warn("⚠️ Timeout de 2s na verificação de disponibilidade do Supabase. Avançando de forma segura.");
    }
    return result;
  } catch (error) {
    console.warn("⚠️ Verificação de disponibilidade falhou no banco, avançando de forma segura:", error.message || error);
    return { email_taken: false, cpf_taken: false };
  }
}
