// ⚡ Microsserviço de Expurgo Seguro (LGPD) - Supabase Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

serve(async (req) => {
  // 1. Tratar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // 2. Extrair cabeçalho de Autorização para validação de JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 3. Inicializar cliente Supabase com JWT do usuário para checar a role
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    // Obter perfil e verificar se possui role de operador ('operator' ou 'master')
    const { data: profile, error: profileError } = await userClient
      .from("profiles")
      .select("role")
      .single()

    if (profileError || !profile || !["operator", "master"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Unauthorized: Operator or Master role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 4. Inicializar cliente Supabase Admin para operações privilegiadas
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // 5. Obter parâmetros da requisição
    const { provider_id, selfie_path, document_path } = await req.json()
    if (!provider_id) {
      return new Response(JSON.stringify({ error: "Missing provider_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 6. Remover fisicamente os arquivos sensíveis dos Buckets de Storage
    const errors = []
    
    if (selfie_path) {
      const { error: selfieError } = await adminClient.storage
        .from("selfies-temp")
        .remove([selfie_path])
      if (selfieError) {
        console.error(`Failed to delete selfie ${selfie_path}:`, selfieError)
        errors.push(`selfie: ${selfieError.message}`)
      }
    }

    if (document_path) {
      const { error: docError } = await adminClient.storage
        .from("criminologia-temp")
        .remove([document_path])
      if (docError) {
        console.error(`Failed to delete document ${document_path}:`, docError)
        errors.push(`document: ${docError.message}`)
      }
    }

    // 7. Atualizar status e data de validação no banco de dados
    const { error: dbError } = await adminClient
      .from("service_providers")
      .update({
        status: "Aprovado",
        is_verified: true,
        verified_at: new Date().toISOString()
      })
      .eq("id", provider_id)

    if (dbError) {
      throw new Error(`Database update failed: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        purged_files: {
          selfie: !!selfie_path,
          document: !!document_path
        },
        warnings: errors.length > 0 ? errors : undefined
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    )

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})
