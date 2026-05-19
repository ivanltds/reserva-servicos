"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";

export default function EscolhaPerfilPage() {
  const router = useRouter();
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#07090e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
        Carregando opções...
      </div>
    );
  }

  // Se não for híbrido, manda pro lugar certo (fallback de segurança)
  if (profile && !profile.is_hybrid && !(profile.is_client && profile.is_provider)) {
    if (profile.is_provider) router.push("/prestador/painel");
    else router.push("/cliente/painel"); // Cliente
    return null;
  }

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#07090e", 
      color: "#f8fafc", 
      fontFamily: "Inter, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.5rem", letterSpacing: "1px", marginBottom: "16px" }}>
          <span style={{ color: "#10b981" }}>RESERVA</span> SERVIÇOS
        </div>
        <h1 style={{ fontSize: "1.8rem", fontFamily: "Outfit", fontWeight: 700, marginBottom: "8px" }}>
          Olá, {profile?.name?.split(" ")[0]}!
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.95rem" }}>
          Como você deseja utilizar a plataforma hoje?
        </p>
      </div>

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1fr", 
        gap: "24px", 
        maxWidth: "800px", 
        width: "100%" 
      }}>
        
        {/* OPÇÃO CONTRATAR (CLIENTE) */}
        <div 
          onClick={() => router.push("/cliente/painel")}
          style={{
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.05) 0%, rgba(6, 78, 59, 0.1) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.2)",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = "rgba(16, 185, 129, 0.2)";
          }}
        >
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            backgroundColor: "rgba(16, 185, 129, 0.1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <svg width="28" height="28" fill="none" stroke="#10b981" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <Badge variant="brand" style={{ marginBottom: "12px" }}>CONTRATAR</Badge>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>Quero Ajuda</h3>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5 }}>
            Solicite diaristas e técnicos para cuidar do seu lar.
          </p>
        </div>

        {/* OPÇÃO TRABALHAR (PRESTADOR) */}
        <div 
          onClick={() => router.push("/prestador/painel")}
          style={{
            background: "linear-gradient(180deg, rgba(245, 158, 11, 0.05) 0%, rgba(120, 53, 15, 0.1) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "24px",
            padding: "32px",
            textAlign: "center",
            cursor: "pointer",
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            alignItems: "center"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-5px)";
            e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.4)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "none";
            e.currentTarget.style.borderColor = "rgba(245, 158, 11, 0.2)";
          }}
        >
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            backgroundColor: "rgba(245, 158, 11, 0.1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            marginBottom: "20px"
          }}>
            <svg width="28" height="28" fill="none" stroke="#f59e0b" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <Badge variant="accent" style={{ marginBottom: "12px" }}>TRABALHAR</Badge>
          <h3 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "8px" }}>Quero Atender</h3>
          <p style={{ fontSize: "0.85rem", color: "#94a3b8", lineHeight: 1.5 }}>
            Veja novos chamados e gerencie seus serviços na região.
          </p>
        </div>

      </div>

      <button
        onClick={() => router.push("/login")}
        style={{
          marginTop: "48px",
          background: "none",
          border: "none",
          color: "#64748b",
          fontSize: "0.85rem",
          cursor: "pointer",
          textDecoration: "underline"
        }}
      >
        Sair da conta
      </button>

      {/* Styled overrides for responsiveness */}
      <style jsx>{`
        @media (max-width: 640px) {
          div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
