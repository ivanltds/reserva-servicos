"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

export default function ClientePainelPage() {
  const router = useRouter();
  const { profile, signOut, loading } = useAuth();

  if (loading) return <div style={{ color: "#fff", padding: "20px" }}>Carregando seu painel...</div>;

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#07090e", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      {/* Header do Painel */}
      <nav style={{
        height: "72px",
        backgroundColor: "rgba(7, 9, 14, 0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px"
      }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.5px" }}>
          <span style={{ color: "#10b981" }}>RESERVA</span> SERVIÇOS
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Olá, {profile?.name?.split(" ")[0]}</span>
          <button 
            onClick={() => signOut()}
            style={{ background: "none", border: "1px solid #334155", color: "#f1f5f9", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", cursor: "pointer" }}
          >
            Sair
          </button>
        </div>
      </nav>

      <main style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        <header style={{ marginBottom: "40px" }}>
          <Badge variant="brand" style={{ marginBottom: "12px" }}>PAINEL DO CLIENTE</Badge>
          <h1 style={{ fontSize: "2rem", fontFamily: "Outfit", fontWeight: 700 }}>O que vamos facilitar hoje?</h1>
        </header>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {/* Card de Novo Agendamento (Placeholder para Milestone 2) */}
          <div style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.02) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(16, 185, 129, 0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
              <svg width="32" height="32" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>Novo Agendamento</h3>
            <p style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "24px", lineHeight: 1.5 }}>
              Solicite uma diarista ou técnico local agora mesmo.
            </p>
            <Button variant="brand" style={{ width: "100%", backgroundColor: "#10b981", color: "#061a14" }}>
              SOLICITAR SERVIÇO
            </Button>
          </div>

          {/* Card de Meus Pedidos */}
          <div style={{
            background: "rgba(30, 41, 59, 0.3)",
            border: "1px solid rgba(255, 255, 255, 0.05)",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center"
          }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", backgroundColor: "rgba(255, 255, 255, 0.05)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px auto" }}>
              <svg width="32" height="32" fill="none" stroke="#94a3b8" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "12px" }}>Meus Pedidos</h3>
            <p style={{ fontSize: "0.9rem", color: "#64748b", marginBottom: "24px", lineHeight: 1.5 }}>
              Você ainda não possui agendamentos ativos.
            </p>
            <Button variant="outline" disabled style={{ width: "100%", opacity: 0.5 }}>
              VER HISTÓRICO
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
