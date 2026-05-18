"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase, signIn } from "../../services/supabase";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Redirecionamento automático caso já esteja logado
  useEffect(() => {
    if (user && profile) {
      if (profile.role === "operator" || profile.role === "master") {
        router.push("/gestor/painel");
      } else {
        router.push("/");
      }
    }
  }, [user, profile, router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      // 1. Fazer login no Supabase
      const authenticatedUser = await signIn(email.trim(), password);

      // 2. Buscar o perfil para verificação de permissões e role
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", authenticatedUser.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error("Não foi possível carregar seu perfil de acesso.");
      }

      // 3. Redirecionamento baseado em regras de negócio
      if (userProfile.role === "operator" || userProfile.role === "master") {
        router.push("/gestor/painel");
      } else {
        // Se for prestador / candidato, buscar seu onboarding de serviço
        const { data: provider } = await supabase
          .from("service_providers")
          .select("status")
          .eq("id", authenticatedUser.id)
          .single();

        if (provider) {
          const payload = {
            id: authenticatedUser.id,
            name: authenticatedUser.user_metadata?.name || userProfile.name || "Prestador",
            status: provider.status,
            timestamp: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
          localStorage.setItem("candidate_session", JSON.stringify(payload));
        }

        router.push("/");
      }
    } catch (err) {
      console.error("Erro na autenticação:", err);
      setErrorMsg(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glows de Fundo Ambientais */}
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(16, 185, 129, 0.08) 0%, transparent 70%)",
          top: "-100px",
          left: "-100px",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "400px",
          height: "400px",
          background: "radial-gradient(circle, rgba(217, 119, 6, 0.06) 0%, transparent 70%)",
          bottom: "-100px",
          right: "-100px",
          pointerEvents: "none",
        }}
      />

      <div
        className="card-glass"
        style={{
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "rgba(15, 19, 31, 0.85)",
          padding: "40px 32px",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            fontFamily: "Outfit",
            fontWeight: 700,
            fontSize: "1.6rem",
            color: "#fff",
            marginBottom: "8px",
            letterSpacing: "0.5px",
          }}
        >
          <span style={{ color: "var(--color-accent-light)", fontWeight: 800 }}>RESERVA</span> SERVIÇOS
        </div>
        <div
          style={{
            fontSize: "0.88rem",
            color: "var(--text-secondary)",
            marginBottom: "32px",
            fontWeight: 300,
          }}
        >
          Faça login para gerenciar ou acompanhar sua conta
        </div>

        {/* Banner de Erros Customizado */}
        {errorMsg && (
          <div
            style={{
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "12px",
              padding: "12px 16px",
              color: "var(--color-error)",
              fontSize: "0.8rem",
              marginBottom: "24px",
              textAlign: "left",
              display: "flex",
              alignItems: "flex-start",
              gap: "8px",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "1px" }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Formulário Reativo */}
        <form onSubmit={handleLogin}>
          <Input
            label="Endereço de E-mail"
            id="login-email"
            type="email"
            required
            placeholder="seuemail@exemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Input
            label="Senha de Acesso"
            id="login-password"
            type="password"
            required
            placeholder="Sua senha secreta"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "32px" }}
          />

          <Button type="submit" variant="brand" loading={loading} style={{ width: "100%" }}>
            Entrar na Conta
          </Button>
        </form>

        <a
          onClick={() => router.push("/")}
          style={{
            display: "inline-block",
            marginTop: "28px",
            fontSize: "0.78rem",
            color: "var(--text-muted)",
            textDecoration: "none",
            cursor: "pointer",
            transition: "var(--transition-smooth)",
          }}
          onMouseEnter={(e) => (e.target.style.color = "#fff")}
          onMouseLeave={(e) => (e.target.style.color = "var(--text-muted)")}
        >
          Não tem uma conta?{" "}
          <strong style={{ color: "var(--color-accent-light)", fontWeight: 700 }}>
            Cadastre-se agora
          </strong>
        </a>
      </div>
    </div>
  );
}
