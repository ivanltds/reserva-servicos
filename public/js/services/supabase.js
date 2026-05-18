import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Configurações do Supabase Local do Reserva Serviços (Remapeado para evitar conflitos)
export const SUPABASE_URL = "http://127.0.0.1:55321";
export const SUPABASE_ANON_KEY = "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

/**
 * 🔐 SERVIÇOS DE INTEGRAÇÃO DO SUPABASE - RESERVA SERVIÇOS
 */

/**
 * Realiza o cadastro e login inicial do Prestador.
 * O trigger de banco cria automaticamente a linha correspondente em public.profiles.
 */
export async function signUpProvider(email, password, name, cpf, phone) {
  // 1. Criar o usuário de autenticação
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role: "candidate",
      },
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error("Erro desconhecido durante o cadastro.");

  // 2. Atualizar os dados adicionais de CPF/Telefone em profiles
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ cpf, phone })
    .eq("id", data.user.id);

  if (profileError) throw profileError;

  return data.user;
}

/**
 * Realiza o login (Sign In) com email e senha.
 */
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data.user;
}

/**
 * Realiza o logout (Sign Out).
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Faz upload da selfie do prestador para o bucket seguro temporário.
 */
export async function uploadSelfie(userId, file) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}_selfie.${fileExt}`;

  const { error } = await supabase.storage
    .from("selfies-temp")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;
  return filePath;
}

/**
 * Faz upload do atestado de antecedentes PDF/imagem para o bucket seguro temporário.
 */
export async function uploadDocument(userId, file) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${userId}/${Date.now()}_antecedentes.${fileExt}`;

  const { error } = await supabase.storage
    .from("criminologia-temp")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) throw error;
  return filePath;
}

/**
 * Insere os dados cadastrais finais e envia o prestador para a Fila de Triagem.
 */
export async function submitProviderOnboarding(userId, onboardingData) {
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
      selfie_path: onboardingData.selfie_path || null,
      document_path: onboardingData.document_path || null,
      status: "Pendente",
      is_verified: false,
    });

  if (error) throw error;
}

/**
 * Busca a fila de prestadores candidatos pendentes de homologação.
 * Limita aos 10 candidatos mais antigos para otimizar processamento e fila.
 */
export async function fetchPendingProviders() {
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
}

/**
 * Busca a lista de prestadores correspondentes a um status específico.
 */
export async function fetchProvidersByStatus(status) {
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
}

/**
 * Modifica administrativamente o status de um prestador.
 */
export async function updateProviderStatus(providerId, status) {
  const { error } = await supabase
    .from("service_providers")
    .update({ status })
    .eq("id", providerId);

  if (error) throw error;
}

/**
 * Aciona o microsserviço (Edge Function) de triagem e expurgo seguro de documentos do prestador.
 */
export async function approveProvider(providerId, selfiePath, documentPath) {
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
      document_path: documentPath,
    }),
  });

  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.error || "Falha ao acionar a função de expurgo seguro.");
  }

  return responseData;
}
