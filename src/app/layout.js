"use client";

import React from "react";
import "./globals.css";
import { AuthProvider } from "../contexts/AuthContext";

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Reserva Serviços — Plataforma On-Demand</title>
        <meta
          name="description"
          content="A plataforma definitiva e hiperlocal de serviços residenciais sob demanda para o Reserva Raposo."
        />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
