"use client";

import React, { useState } from "react";

export default function ClipboardCard({ name = "", phone = "", cpf = "" }) {
  const [tooltips, setTooltips] = useState({
    name: "Copiar",
    phone: "Copiar",
    cpf: "Copiar",
  });

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setTooltips((prev) => ({ ...prev, [field]: "Copiado!" }));
      setTimeout(() => {
        setTooltips((prev) => ({ ...prev, [field]: "Copiar" }));
      }, 1500);
    }).catch(err => {
      console.error("Erro ao copiar para área de transferência:", err);
    });
  };

  const containerStyle = {
    display: "block",
    background: "#18181b",
    border: "1px solid #27272a",
    borderRadius: "12px",
    padding: "1.25rem",
    fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
    color: "#e4e4e7",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
    boxSizing: "border-box",
  };

  const headerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontSize: "0.8rem",
    textTransform: "uppercase",
    color: "#71717a",
    marginBottom: "1rem",
    letterSpacing: "0.8px",
    fontWeight: "700",
    borderBottom: "1px solid #27272a",
    paddingBottom: "0.5rem",
  };

  const fieldStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.65rem 0",
    borderBottom: "1px solid #27272a",
  };

  const labelStyle = {
    fontSize: "0.85rem",
    color: "#a1a1aa",
  };

  const valueWrapperStyle = {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  };

  const valueStyle = {
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#ffffff",
    userSelect: "all",
  };

  const copyBtnStyle = {
    background: "none",
    border: "none",
    color: "#10b981",
    cursor: "pointer",
    fontFamily: "inherit",
    fontSize: "0.75rem",
    fontWeight: "600",
    padding: "0.35rem 0.6rem",
    borderRadius: "6px",
    background: "rgba(16, 185, 129, 0.08)",
    border: "1px solid rgba(16, 185, 129, 0.15)",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const tooltipStyle = (visible) => ({
    position: "absolute",
    bottom: "120%",
    left: "50%",
    transform: `translateX(-50%) translateY(${visible ? "-5px" : "-2px"})`,
    background: "#09090b",
    color: "#ffffff",
    fontSize: "0.7rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "4px",
    border: "1px solid #3f3f46",
    pointerEvents: "none",
    opacity: visible ? 1 : 0,
    transition: "opacity 0.2s, transform 0.2s",
    whiteSpace: "nowrap",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
  });

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <svg viewBox="0 0 24 24" style={{ width: "14px", height: "14px", fill: "currentColor" }}>
          <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
        </svg>
        <span>Ficha de Liberação Portaria</span>
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>Nome Completo</span>
        <div style={valueWrapperStyle}>
          <span style={valueStyle}>{name}</span>
          <button style={copyBtnStyle} onClick={() => copyToClipboard(name, "name")}>
            <span style={tooltipStyle(tooltips.name === "Copiado!")}>{tooltips.name}</span>
            COPIAR
          </button>
        </div>
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>Celular WhatsApp</span>
        <div style={valueWrapperStyle}>
          <span style={valueStyle}>{phone}</span>
          <button style={copyBtnStyle} onClick={() => copyToClipboard(phone, "phone")}>
            <span style={tooltipStyle(tooltips.phone === "Copiado!")}>{tooltips.phone}</span>
            COPIAR
          </button>
        </div>
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>CPF do Profissional</span>
        <div style={valueWrapperStyle}>
          <span style={valueStyle}>{cpf}</span>
          <button style={copyBtnStyle} onClick={() => copyToClipboard(cpf, "cpf")}>
            <span style={tooltipStyle(tooltips.cpf === "Copiado!")}>{tooltips.cpf}</span>
            COPIAR
          </button>
        </div>
      </div>
    </div>
  );
}
