import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { email, password, name, cpf, phone, role } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "E-mail, senha e nome são obrigatórios." },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Variáveis de ambiente do Supabase não configuradas no servidor." },
        { status: 500 }
      );
    }

    // Inicializa o cliente do Supabase com a chave service_role para ter privilégios admin
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    console.log(`[API Auth Signup] Criando usuário confirmado: ${email}`);

    // Cria o usuário com o e-mail pré-confirmado para evitar envio de e-mails de validação/limites do SMTP
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        cpf,
        phone,
        role: role || "candidate",
      },
    });

    if (error) {
      console.error("[API Auth Signup] Erro do Supabase:", error.message);
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 400 }
      );
    }

    return NextResponse.json({ user: data.user });
  } catch (err) {
    console.error("[API Auth Signup] Erro interno:", err.message || err);
    return NextResponse.json(
      { error: err.message || "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
