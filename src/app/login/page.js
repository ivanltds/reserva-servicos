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
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Redirecionamento automático caso já esteja logado
  useEffect(() => {
    if (user && profile) {
      if (profile.role === "operator" || profile.role === "master") {
        router.push("/gestor/painel");
      } else if (profile.is_hybrid || (profile.is_client && profile.is_provider)) {
        router.push("/login/escolha");
      } else if (profile.is_provider) {
        router.push("/prestador/painel");
      } else {
        router.push("/cliente/painel"); // Redireciona para o Dashboard exclusivo
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

      // 2. Buscar o perfil completo e híbrido (AuthContext já cuida do carregamento via loadProfile no onAuthStateChange)
      // Mas aqui fazemos uma verificação local rápida para redirecionamento imediato
      const { data: userProfile, error: profileError } = await supabase
        .from("profiles")
        .select("role, name")
        .eq("id", authenticatedUser.id)
        .single();

      if (profileError || !userProfile) {
        throw new Error("Não foi possível carregar seu perfil de acesso.");
      }

      // 3. Verifica existência nas tabelas vinculadas para decisão de rota
      const [resResident, resProvider] = await Promise.all([
        supabase.from("residents").select("id").eq("id", authenticatedUser.id).maybeSingle(),
        supabase.from("service_providers").select("id").eq("id", authenticatedUser.id).maybeSingle(),
      ]);

      const isClient = !!resResident.data;
      const isProvider = !!resProvider.data;

      // 4. Redirecionamento baseado em regras de negócio
      if (userProfile.role === "operator" || userProfile.role === "master") {
        router.push("/gestor/painel");
      } else if (isClient && isProvider) {
        router.push("/login/escolha");
      } else if (isProvider) {
        // Se for apenas prestador, garante a sessão de triagem se necessário
        const { data: provider } = await supabase
          .from("service_providers")
          .select("status")
          .eq("id", authenticatedUser.id)
          .single();

        if (provider) {
          const payload = {
            id: authenticatedUser.id,
            name: userProfile.name || "Prestador",
            status: provider.status,
            timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
          };
          localStorage.setItem("candidate_session", JSON.stringify(payload));
        }
        router.push("/prestador/painel");
      } else {
        router.push("/cliente/painel"); // Redireciona para o Dashboard exclusivo
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
          onClick={() => setShowRegisterModal(true)}
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

        {/* MODAL DE ESCOLHA DE CADASTRO */}
        {showRegisterModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
            padding: "20px"
          }} onClick={() => setShowRegisterModal(false)}>
            <div style={{
              width: "100%",
              maxWidth: "460px",
              backgroundColor: "#0f172a",
              borderRadius: "28px",
              border: "1px solid rgba(255,255,255,0.08)",
              padding: "40px 32px",
              position: "relative",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
              animation: "fadeIn 0.3s ease"
            }} onClick={(e) => e.stopPropagation()}>
              <button 
                onClick={() => setShowRegisterModal(false)}
                style={{ position: "absolute", top: "24px", right: "24px", background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
              
              <div style={{ textAlign: "center", marginBottom: "32px" }}>
                <div style={{ fontSize: "0.7rem", color: "#10b981", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "8px" }}>
                  Comece Agora
                </div>
                <h2 style={{ fontSize: "1.75rem", fontFamily: "Outfit", fontWeight: 700, color: "#fff" }}>
                  Como deseja se cadastrar?
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div 
                  onClick={() => {
                    setShowRegisterModal(false);
                    router.push("/cliente/cadastro");
                  }}
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(16, 185, 129, 0.15)",
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.02) 100%)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(5px)";
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.15)";
                    e.currentTarget.style.background = "rgba(16, 185, 129, 0.08)";
                  }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                  </div>
                  <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Quero Contratar</div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Para quem busca ajuda qualificada e segura.</p>
                  </div>
                </div>

                <div 
                  onClick={() => {
                    setShowRegisterModal(false);
                    router.push("/prestador/cadastro");
                  }}
                  style={{
                    padding: "24px",
                    borderRadius: "20px",
                    border: "1px solid rgba(245, 158, 11, 0.15)",
                    background: "linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(245, 158, 11, 0.02) 100%)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "20px"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateX(5px)";
                    e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.12)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.15)";
                    e.currentTarget.style.background = "rgba(245, 158, 11, 0.08)";
                  }}
                >
                  <div style={{ width: "48px", height: "48px", borderRadius: "14px", backgroundColor: "rgba(245, 158, 11, 0.1)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div style={{ textAlign: "left", display: "flex", flexDirection: "column" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Quero Trabalhar</div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Para profissionais que moram na região.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Já possui uma conta? <span style={{ color: "#10b981", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowRegisterModal(false)}>Faça Login</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
