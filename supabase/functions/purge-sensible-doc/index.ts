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

    // 3. Decodificar JWT diretamente (já validado na borda pelo Edge Runtime via verifyJWT: true)
    const token = authHeader.replace("Bearer ", "").trim()
    let userId: string | null = null
    try {
      const parts = token.split('.')
      if (parts.length === 3) {
        const payload = parts[1]
        let base64 = payload.replace(/-/g, "+").replace(/_/g, "/")
        while (base64.length % 4) {
          base64 += "="
        }
        const decoded = JSON.parse(atob(base64))
        userId = decoded.sub
      }
    } catch (e) {
      console.error("Erro ao decodificar token JWT:", e)
    }

    if (!userId) {
      return new Response(JSON.stringify({ error: "Invalid user token format" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 4. Inicializar cliente Supabase Admin para operações privilegiadas
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)

    // Obter perfil e verificar se possui role de operador ('operator' ou 'master') de forma segura
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (profileError || !profile || !["operator", "master"].includes(profile.role)) {
      return new Response(JSON.stringify({ error: "Unauthorized: Operator or Master role required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 5. Obter parâmetros da requisição
    const { provider_id, selfie_path, rg_path, document_path, reviewed_by, audit_checklist } = await req.json()
    if (!provider_id) {
      return new Response(JSON.stringify({ error: "Missing provider_id parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    // 6. Remover fisicamente os arquivos sensíveis dos Buckets de Storage (CNH/RG e Antecedentes)
    // A selfie NÃO é deletada porque é usada como foto de identificação oficial no aplicativo.
    const errors = []
    
    if (rg_path) {
      const { error: rgError } = await adminClient.storage
        .from("criminologia-temp")
        .remove([rg_path])
      if (rgError) {
        console.error(`Failed to delete RG ${rg_path}:`, rgError)
        errors.push(`rg: ${rgError.message}`)
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

    // 7. Atualizar status e data de validação no banco de dados com auditoria
    const { error: dbError } = await adminClient
      .from("service_providers")
      .update({
        status: "Aprovado",
        is_verified: true,
        verified_at: new Date().toISOString(),
        reviewed_by: reviewed_by,
        audit_checklist: audit_checklist
      })
      .eq("id", provider_id)

    if (dbError) {
      throw new Error(`Database update failed: ${dbError.message}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        purged_files: {
          rg: !!rg_path,
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
