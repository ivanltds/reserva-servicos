"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Badge from "../components/ui/Badge";

export default function CommercialLanding() {
  const router = useRouter();

  // --- BACKGROUND VIDEO CAROUSEL STATES ---
  const [isMobile, setIsMobile] = useState(false);
  const [activePlayer, setActivePlayer] = useState(1); // 1 or 2
  const [src1, setSrc1] = useState("");
  const [src2, setSrc2] = useState("");
  const [playlist, setPlaylist] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const videoRef1 = useRef(null);
  const videoRef2 = useRef(null);

  // Detect mobile device width dynamically
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Initialize playlist based on device width
  useEffect(() => {
    const list = isMobile
      ? ["/videos/mobile-1.mp4", "/videos/desktop-2.mp4", "/videos/desktop-3.mp4"]
      : ["/videos/desktop-1.mp4", "/videos/desktop-2.mp4", "/videos/desktop-3.mp4"];
    setPlaylist(list);
    setCurrentIndex(0);
    setSrc1(list[0] || "");
    if (list.length > 1) {
      setSrc2(list[1] || "");
    } else {
      setSrc2("");
    }
    setActivePlayer(1);
  }, [isMobile]);

  // Handle smooth pre-buffering transitions every 8 seconds
  useEffect(() => {
    if (playlist.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % playlist.length;
      const prepareIndex = (currentIndex + 2) % playlist.length;

      if (activePlayer === 1) {
        // Start playing video player 2 in background
        if (videoRef2.current) {
          videoRef2.current.currentTime = 0;
          videoRef2.current.play().catch(() => {});
        }
        setActivePlayer(2);
        setCurrentIndex(nextIndex);
        
        // Wait for the fade out to complete, then pause player 1 and load its next source
        setTimeout(() => {
          if (videoRef1.current) videoRef1.current.pause();
          setSrc1(playlist[prepareIndex]);
        }, 1500); 
      } else {
        // Start playing video player 1 in background
        if (videoRef1.current) {
          videoRef1.current.currentTime = 0;
          videoRef1.current.play().catch(() => {});
        }
        setActivePlayer(1);
        setCurrentIndex(nextIndex);
        
        // Wait for the fade out to complete, then pause player 2 and load its next source
        setTimeout(() => {
          if (videoRef2.current) videoRef2.current.pause();
          setSrc2(playlist[prepareIndex]);
        }, 1500);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [playlist, currentIndex, activePlayer]);

  // Explicitly force autoplay via ref call when sources are assigned, handling potential browser blocks
  useEffect(() => {
    const playActive = async () => {
      try {
        if (videoRef1.current) {
          videoRef1.current.muted = true;
          videoRef1.current.defaultMuted = true;
        }
        if (videoRef2.current) {
          videoRef2.current.muted = true;
          videoRef2.current.defaultMuted = true;
        }

        if (activePlayer === 1 && videoRef1.current) {
          await videoRef1.current.play();
        } else if (activePlayer === 2 && videoRef2.current) {
          await videoRef2.current.play();
        }
      } catch (err) {
        console.warn("Autoplay was blocked or failed initially:", err);
      }
    };
    playActive();
  }, [activePlayer, src1, src2]);

  // --- MORADOR (CLIENT) BUDGET ESTIMATOR STATES ---
  const [clientCategory, setClientCategory] = useState("diarista"); // "diarista", "marido"
  const [clientFrequency, setClientFrequency] = useState("avulso"); // "avulso", "quinzenal", "semanal"
  const [clientDiaristaTamanho, setClientDiaristaTamanho] = useState(250); // 200, 250, 300
  const [clientMaridoTipo, setClientMaridoTipo] = useState(150); // 100, 150, 200
  const [estimatedBudget, setEstimatedBudget] = useState(250);
  const [showClientTooltip, setShowClientTooltip] = useState(false);

  // --- PRESTADOR (PROVIDER) REVENUE ESTIMATOR STATES ---
  const [providerCategory, setProviderCategory] = useState("diarista"); // "diarista", "marido"
  const [providerDiaristaDias, setProviderDiaristaDias] = useState(4);
  const [providerDiaristaValor, setProviderDiaristaValor] = useState(250);
  const [providerMaridoDias, setProviderMaridoDias] = useState(5);
  const [providerMaridoServs, setProviderMaridoServs] = useState(3);
  const [providerMaridoValor, setProviderMaridoValor] = useState(150); // 150 default matching client
  const [estimatedIncome, setEstimatedIncome] = useState(3200);
  const [showProviderTooltip, setShowProviderTooltip] = useState(false);

  // Active View on Mobile (to avoid long page scrolling)
  // "split" = both side-by-side (default for desktop), "client" = client focus, "provider" = provider focus
  const [mobileTab, setMobileTab] = useState("client");

  // Estado para o Modal de Cadastro
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Recalcular orçamento do morador
  useEffect(() => {
    let base = clientCategory === "diarista" ? clientDiaristaTamanho : clientMaridoTipo;

    let discount = 0;
    if (clientFrequency === "quinzenal") {
      discount = 0.05;
    } else if (clientFrequency === "semanal") {
      discount = 0.10;
    }

    setEstimatedBudget(Math.round(base * (1 - discount)));
  }, [clientCategory, clientFrequency, clientDiaristaTamanho, clientMaridoTipo]);

  // Recalcular ganhos do prestador
  useEffect(() => {
    if (providerCategory === "diarista") {
      const monthlyBruto = providerDiaristaDias * providerDiaristaValor * 4;
      setEstimatedIncome(Math.round(monthlyBruto * 0.8));
    } else {
      const monthlyBruto = providerMaridoDias * providerMaridoServs * providerMaridoValor * 4;
      setEstimatedIncome(Math.round(monthlyBruto * 0.8));
    }
  }, [providerCategory, providerDiaristaDias, providerDiaristaValor, providerMaridoDias, providerMaridoServs, providerMaridoValor]);

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#07090e", color: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      
      {/* Immersive Video Hero Outer Wrapper */}
      <div style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        borderBottom: "1px solid rgba(255, 255, 255, 0.03)",
        background: "#07090e"
      }}>
        {/* Background Immersive Video Carousel */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 1,
          pointerEvents: "none",
          overflow: "hidden"
        }}>
          {/* Radial & Linear Dark Gradient Overlays for Flawless Readability */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "radial-gradient(circle at center, rgba(7, 9, 14, 0.3) 0%, rgba(7, 9, 14, 0.8) 100%)",
            zIndex: 3
          }} />
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "linear-gradient(180deg, rgba(7, 9, 14, 0.1) 0%, #07090e 100%)",
            zIndex: 3
          }} />

          {/* Video Player 1 */}
          {src1 && (
            <video
              ref={videoRef1}
              src={src1}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/lp_cliente_hero.png"
              loop={playlist.length <= 1}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: activePlayer === 1 ? 1 : 0,
                transition: "opacity 1.5s ease-in-out",
                zIndex: 1
              }}
            />
          )}

          {/* Video Player 2 */}
          {src2 && (
            <video
              ref={videoRef2}
              src={src2}
              autoPlay
              muted
              playsInline
              preload="auto"
              poster="/lp_prestador_hero.png"
              loop={playlist.length <= 1}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: activePlayer === 2 ? 1 : 0,
                transition: "opacity 1.5s ease-in-out",
                zIndex: 2
              }}
            />
          )}
        </div>

        {/* Top Header inside the Video container - NAVBAR PREMIUM */}
        <header style={{
          padding: "16px 24px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
          background: "rgba(7, 9, 14, 0.65)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "1px", cursor: "pointer" }} onClick={() => router.push("/")}>
              <span style={{ color: "#10b981" }}>RESERVA</span> SERVIÇOS
            </div>
            <div className="hide-mobile" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <Badge variant="brand" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)", fontSize: "0.65rem" }}>
                PLATAFORMA INDEPENDENTE
              </Badge>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button 
              onClick={() => router.push("/login")}
              style={{
                background: "none",
                border: "none",
                color: "#cbd5e1",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "8px 12px",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.color = "#fff"}
              onMouseLeave={(e) => e.target.style.color = "#cbd5e1"}
            >
              Entrar
            </button>
            <button 
              onClick={() => setShowRegisterModal(true)}
              style={{
                backgroundColor: "#10b981",
                color: "#061a14",
                border: "none",
                borderRadius: "8px",
                padding: "8px 18px",
                fontSize: "0.85rem",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(16, 185, 129, 0.2)",
                transition: "transform 0.2s"
              }}
              onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
              onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
            >
              Cadastrar
            </button>
          </div>
        </header>

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
                  onClick={() => router.push("/cliente/cadastro")}
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
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Quero Contratar</div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Para quem busca ajuda qualificada e segura.</p>
                  </div>
                </div>

                <div 
                  onClick={() => router.push("/prestador/cadastro")}
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
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontSize: "1.05rem", fontWeight: 700, color: "#fff", marginBottom: "2px" }}>Quero Trabalhar</div>
                    <p style={{ fontSize: "0.78rem", color: "#94a3b8" }}>Para profissionais que moram na região.</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "32px", textAlign: "center" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  Já possui uma conta? <span style={{ color: "#10b981", fontWeight: 600, cursor: "pointer", textDecoration: "underline" }} onClick={() => router.push("/login")}>Faça Login</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Hero Central Intro Section inside the Video container */}
        <section style={{
          padding: "70px 24px 50px 24px",
          textAlign: "center",
          maxWidth: "800px",
          margin: "0 auto",
          position: "relative",
          zIndex: 10,
          animation: "fadeIn 0.5s ease"
        }}>
          <h1 style={{
            fontSize: "2.4rem",
            fontFamily: "Outfit",
            fontWeight: 800,
            lineHeight: 1.2,
            color: "#fff",
            textShadow: "0 4px 15px rgba(0, 0, 0, 0.7)",
            marginBottom: "16px"
          }}>
            Serviços de Confiança, <br />
            <span style={{ background: "linear-gradient(90deg, #34d399 0%, #fbbf24 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Bem do seu Lado</span>
          </h1>
          <p style={{
            fontSize: "1.05rem",
            color: "#cbd5e1",
            lineHeight: 1.6,
            fontWeight: 300,
            textShadow: "0 2px 8px rgba(0, 0, 0, 0.6)",
            marginBottom: "28px"
          }}>
            A plataforma oficial de serviços na sua vizinhança. Conectamos você a profissionais que moram perto da sua casa para um atendimento rápido, seguro e sem taxas abusivas.
          </p>

          {/* Mobile View Toggle */}
          <div className="mobile-tabs-toggle" style={{
            display: "none", // Will be shown in CSS via media queries
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            padding: "4px",
            borderRadius: "10px",
            maxWidth: "340px",
            margin: "0 auto 16px auto"
          }}>
            <button
              onClick={() => setMobileTab("client")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.75rem",
                fontFamily: "Outfit",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: mobileTab === "client" ? "#10b981" : "transparent",
                color: mobileTab === "client" ? "#061a14" : "#cbd5e1",
                transition: "all 0.2s ease"
              }}
            >
              Sou Morador (Contratar)
            </button>
            <button
              onClick={() => setMobileTab("provider")}
              style={{
                flex: 1,
                padding: "8px",
                borderRadius: "8px",
                border: "none",
                fontSize: "0.75rem",
                fontFamily: "Outfit",
                fontWeight: 600,
                cursor: "pointer",
                backgroundColor: mobileTab === "provider" ? "#f59e0b" : "transparent",
                color: mobileTab === "provider" ? "#061a14" : "#cbd5e1",
                transition: "all 0.2s ease"
              }}
            >
              Sou Prestador (Trabalhar)
            </button>
          </div>
        </section>
      </div>

      {/* Main Split Grid (Morador vs Prestador) */}
      <main style={{
        maxWidth: "1280px",
        margin: "0 auto",
        padding: "0 24px 64px 24px",
      }}>
        <div className="split-grid-layout" style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "32px"
        }}>
          
          {/* LADO MORADOR (CLIENT HUB) */}
          <div className={`split-card client-card ${mobileTab !== "client" ? "hide-mobile" : ""}`} style={{
            background: "linear-gradient(180deg, rgba(16, 185, 129, 0.03) 0%, rgba(6, 78, 59, 0.05) 100%)",
            border: "1px solid rgba(16, 185, 129, 0.15)",
            borderRadius: "24px",
            padding: "32px",
            display: isMobile && mobileTab !== "client" ? "none" : "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease"
          }}>
            <Badge variant="accent" style={{ alignSelf: "flex-start", marginBottom: "16px", backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
              CONTRATAR AJUDA
            </Badge>

            <h2 style={{ fontSize: "1.75rem", fontFamily: "Outfit", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
              Ajuda de Confiança, bem do seu lado
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.5, fontWeight: 300, marginBottom: "20px" }}>
              Receba profissionais que moram perto de você para cuidar do seu lar. Praticidade total, agendamento simples e a segurança de contar com quem conhece a sua região.
            </p>

            {/* Generated Image Mock */}
            <div style={{
              width: "100%",
              height: "180px",
              borderRadius: "16px",
              backgroundImage: "url('/lp_cliente_hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginBottom: "24px",
              border: "1px solid rgba(217, 119, 6, 0.3)"
            }} />

            {/* Interactive Morador Budget Simulator */}
            <div style={{
              backgroundColor: "rgba(14, 10, 7, 0.8)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <h4 style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", fontWeight: 600 }}>
                Simulador de Orçamento do Serviço
              </h4>

              {/* Service categories toggle */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
                <button
                  onClick={() => setClientCategory("diarista")}
                  style={{
                    flex: 1,
                    padding: "6px",
                    fontSize: "0.68rem",
                    fontFamily: "Outfit",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: clientCategory === "diarista" ? "#10b981" : "transparent",
                    color: clientCategory === "diarista" ? "#000" : "#94a3b8"
                  }}
                >
                  Diarista / Doméstica
                </button>
                <button
                  onClick={() => setClientCategory("marido")}
                  style={{
                    flex: 1,
                    padding: "6px",
                    fontSize: "0.68rem",
                    fontFamily: "Outfit",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: clientCategory === "marido" ? "#10b981" : "transparent",
                    color: clientCategory === "marido" ? "#000" : "#94a3b8"
                  }}
                >
                  Marido de Aluguel
                </button>
              </div>

              {clientCategory === "diarista" ? (
                <div style={{ textAlign: "left", marginBottom: "12px" }}>
                  <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Porte do Serviço / Faxina</label>
                  <select value={clientDiaristaTamanho} onChange={(e) => setClientDiaristaTamanho(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "#0f131f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                    <option value={200}>Faxina Compacta (Apartamento 1 quarto) - R$ 200</option>
                    <option value={250}>Faxina Padrão (Apartamento 2-3 quartos) - R$ 250</option>
                    <option value={300}>Faxina Completa (Apartamento grande / Pesada) - R$ 300</option>
                  </select>
                </div>
              ) : (
                <div style={{ textAlign: "left", marginBottom: "12px" }}>
                  <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Complexidade do Serviço</label>
                  <select value={clientMaridoTipo} onChange={(e) => setClientMaridoTipo(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "#0f131f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                    <option value={100}>Instalação Simples (chuveiro, lâmpada, etc.) - R$ 100</option>
                    <option value={150}>Pequeno Reparo (fechadura, torneira, prateleira) - R$ 150</option>
                    <option value={200}>Reparo Complexo (Instalação hidráulica ou elétrica) - R$ 200</option>
                  </select>
                </div>
              )}

              {/* Frequência */}
              <div style={{ textAlign: "left", marginBottom: "12px" }}>
                <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Frequência do Serviço</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px" }}>
                  {["avulso", "quinzenal", "semanal"].map((freq) => (
                    <button
                      key={freq}
                      onClick={() => setClientFrequency(freq)}
                      style={{
                        padding: "6px",
                        fontSize: "0.65rem",
                        borderRadius: "6px",
                        border: "1px solid",
                        cursor: "pointer",
                        backgroundColor: clientFrequency === freq ? "#0f131f" : "transparent",
                        borderColor: clientFrequency === freq ? "#10b981" : "rgba(255,255,255,0.05)",
                        color: "#fff"
                      }}
                    >
                      {freq === "avulso" ? "Avulso" : freq === "quinzenal" ? "Quinzenal (-5%)" : "Semanal (-10%)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Budget result */}
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: "12px", marginTop: "12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase" }}>Valor Estimado da Visita</span>
                  <div 
                    onMouseEnter={() => setShowClientTooltip(true)}
                    onMouseLeave={() => setShowClientTooltip(false)}
                    style={{ position: "relative", cursor: "pointer", display: "inline-flex" }}
                  >
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border: "1px solid #94a3b8",
                      color: "#94a3b8",
                      fontSize: "0.55rem",
                      fontWeight: "bold"
                    }}>i</span>
                    {showClientTooltip && (
                      <div style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "220px",
                        backgroundColor: "#07090e",
                        border: "1px solid rgba(217, 119, 6, 0.3)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        color: "#cbd5e1",
                        fontSize: "0.6rem",
                        fontWeight: 300,
                        lineHeight: "1.3",
                        textAlign: "center",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
                        zIndex: 100,
                        pointerEvents: "none"
                      }}>
                        Valores fictícios baseados em médias de mercado para fins de simulação. O valor final é definido no momento do agendamento.
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ fontSize: "1.75rem", fontFamily: "Outfit", fontWeight: 800, color: "#10b981", margin: "4px 0" }}>
                  R$ {estimatedBudget.toLocaleString("pt-BR")}
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400 }}> /visita</span>
                </div>

                {/* Subtly and elegantly display the split / margin */}
                <p style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 400, marginBottom: "8px" }}>
                  Profissional recebe R$ {Math.round(estimatedBudget * 0.8).toLocaleString("pt-BR")} (80%) · Taxa de intermediação R$ {Math.round(estimatedBudget * 0.2).toLocaleString("pt-BR")} (20%) para seguro e suporte.
                </p>

                <p style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 300 }}>
                  Valores médios para fins de simulação e contratação facilitada. Sujeito aos <span style={{ textDecoration: "underline", cursor: "pointer" }} onClick={() => router.push("/termos")}>Termos de Uso</span>.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/cliente/cadastro")}
              style={{
                marginTop: "auto",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.95rem",
                fontFamily: "Outfit",
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                color: "#000",
                boxShadow: "0 4px 15px rgba(16, 185, 129, 0.2)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
            >
              CADASTRAR E CONTRATAR
            </button>
          </div>

          {/* LADO PRESTADOR (PROVIDER HUB) */}
          <div className={`split-card provider-card ${mobileTab !== "provider" ? "hide-mobile" : ""}`} style={{
            background: "linear-gradient(180deg, rgba(245, 158, 11, 0.03) 0%, rgba(67, 30, 3, 0.05) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.15)",
            borderRadius: "24px",
            padding: "32px",
            display: isMobile && mobileTab !== "provider" ? "none" : "flex",
            flexDirection: "column",
            boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
            transition: "all 0.3s ease"
          }}>
            <Badge variant="success" style={{ alignSelf: "flex-start", marginBottom: "16px", backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#f59e0b", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
              PRESTAR SERVIÇOS
            </Badge>

            <h2 style={{ fontSize: "1.75rem", fontFamily: "Outfit", fontWeight: 700, color: "#fff", marginBottom: "8px" }}>
              Trabalhe Perto de Casa
            </h2>
            <p style={{ fontSize: "0.88rem", color: "#cbd5e1", lineHeight: 1.5, fontWeight: 300, marginBottom: "20px" }}>
              Encontre oportunidades de trabalho na sua própria região. Multiplique sua renda atendendo vizinhos, livre de trânsito e com repasse justo de 80% imediato.
            </p>

            {/* Generated Image Mock */}
            <div style={{
              width: "100%",
              height: "180px",
              borderRadius: "16px",
              backgroundImage: "url('/lp_prestador_hero.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              marginBottom: "24px",
              border: "1px solid rgba(245, 158, 11, 0.3)"
            }} />

            {/* Interactive Prestador Income Simulator */}
            <div style={{
              backgroundColor: "rgba(7, 14, 10, 0.8)",
              border: "1px solid rgba(245, 158, 11, 0.2)",
              borderRadius: "16px",
              padding: "20px",
              marginBottom: "24px",
              textAlign: "center"
            }}>
              <h4 style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", fontWeight: 600 }}>
                Simulador de Renda Mensal
              </h4>

              {/* Service categories toggle */}
              <div style={{ display: "flex", gap: "4px", marginBottom: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: "8px", padding: "3px" }}>
                <button
                  onClick={() => setProviderCategory("diarista")}
                  style={{
                    key: "p-dia",
                    flex: 1,
                    padding: "6px",
                    fontSize: "0.68rem",
                    fontFamily: "Outfit",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: providerCategory === "diarista" ? "#f59e0b" : "transparent",
                    color: providerCategory === "diarista" ? "#000" : "#94a3b8"
                  }}
                >
                  Diarista / Doméstica
                </button>
                <button
                  onClick={() => setProviderCategory("marido")}
                  style={{
                    key: "p-mari",
                    flex: 1,
                    padding: "6px",
                    fontSize: "0.68rem",
                    fontFamily: "Outfit",
                    fontWeight: 600,
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: providerCategory === "marido" ? "#f59e0b" : "transparent",
                    color: providerCategory === "marido" ? "#000" : "#94a3b8"
                  }}
                >
                  Marido de Aluguel
                </button>
              </div>

              {providerCategory === "diarista" ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "12px" }}>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Dias / Semana</label>
                    <select value={providerDiaristaDias} onChange={(e) => setProviderDiaristaDias(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "#0f131f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                      <option value={1}>1 Dia / Semana</option>
                      <option value={2}>2 Dias / Semana</option>
                      <option value={3}>3 Dias / Semana</option>
                      <option value={4}>4 Dias / Semana</option>
                      <option value={5}>5 Dias / Semana</option>
                    </select>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Valor Diária</label>
                    <select value={providerDiaristaValor} onChange={(e) => setProviderDiaristaValor(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "#0f131f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                      <option value={200}>R$ 200 (Básica)</option>
                      <option value={250}>R$ 250 (Padrão)</option>
                      <option value={300}>R$ 300 (Completa)</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "6px", marginBottom: "12px" }}>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Dias / Sem.</label>
                    <select value={providerMaridoDias} onChange={(e) => setProviderMaridoDias(Number(e.target.value))} style={{ width: "100%", padding: "6px 6px", backgroundColor: "#0f131f", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.68rem" }}>
                      <option value={1}>1 Dia</option>
                      <option value={2}>2 Dias</option>
                      <option value={3}>3 Dias</option>
                      <option value={4}>4 Dias</option>
                      <option value={5}>5 Dias</option>
                    </select>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Servs. / Dia</label>
                    <select value={providerMaridoServs} onChange={(e) => setProviderMaridoServs(Number(e.target.value))} style={{ width: "100%", padding: "6px 6px", backgroundColor: "#0f131f", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.68rem" }}>
                      <option value={1}>1 Serv.</option>
                      <option value={2}>2 Serv.</option>
                      <option value={3}>3 Serv.</option>
                    </select>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <label style={{ fontSize: "0.6rem", fontWeight: 600, color: "#94a3b8", display: "block", marginBottom: "4px" }}>Valor Médio</label>
                    <select value={providerMaridoValor} onChange={(e) => setProviderMaridoValor(Number(e.target.value))} style={{ width: "100%", padding: "6px 6px", backgroundColor: "#0f131f", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", color: "#fff", fontSize: "0.68rem" }}>
                      <option value={100}>R$ 100 (Simples)</option>
                      <option value={150}>R$ 150 (Médio)</option>
                      <option value={200}>R$ 200 (Complexo)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Revenue result */}
              <div style={{ borderTop: "1px dashed rgba(255,255,255,0.05)", paddingTop: "12px", marginTop: "12px", position: "relative" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <span style={{ fontSize: "0.65rem", color: "#94a3b8", textTransform: "uppercase" }}>Ganhos Líquidos Estimados</span>
                  <div 
                    onMouseEnter={() => setShowProviderTooltip(true)}
                    onMouseLeave={() => setShowProviderTooltip(false)}
                    style={{ position: "relative", cursor: "pointer", display: "inline-flex" }}
                  >
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border: "1px solid #94a3b8",
                      color: "#94a3b8",
                      fontSize: "0.55rem",
                      fontWeight: "bold"
                    }}>i</span>
                    {showProviderTooltip && (
                      <div style={{
                        position: "absolute",
                        bottom: "20px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "220px",
                        backgroundColor: "#07090e",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        padding: "8px 12px",
                        borderRadius: "8px",
                        color: "#cbd5e1",
                        fontSize: "0.6rem",
                        fontWeight: 300,
                        lineHeight: "1.3",
                        textAlign: "center",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.8)",
                        zIndex: 100,
                        pointerEvents: "none"
                      }}>
                        Valores fictícios baseados em simulações de ganhos. O faturamento real depende da disponibilidade e volume de atendimentos.
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ fontSize: "1.75rem", fontFamily: "Outfit", fontWeight: 800, color: "#10b981", margin: "4px 0" }}>
                  R$ {estimatedIncome.toLocaleString("pt-BR")}
                  <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 400 }}> /mês</span>
                </div>

                <p style={{ fontSize: "0.62rem", color: "#64748b", fontWeight: 400, marginBottom: "8px" }}>
                  Valor líquido estimado. A taxa de intermediação de 20% cobre seguro e suporte da plataforma.
                </p>

                <p style={{ fontSize: "0.62rem", color: "#94a3b8", fontWeight: 300 }}>
                  Ganhos simulados para fins ilustrativos. Receba 80% do valor bruto de cada serviço.
                </p>
              </div>
            </div>

            <button
              onClick={() => router.push("/prestador/cadastro")}
              style={{
                marginTop: "auto",
                padding: "14px",
                borderRadius: "12px",
                border: "none",
                fontSize: "0.95rem",
                fontFamily: "Outfit",
                fontWeight: 700,
                cursor: "pointer",
                background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                color: "#000",
                boxShadow: "0 4px 15px rgba(245, 158, 11, 0.2)",
                transition: "all 0.2s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-1px)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "none"}
            >
              CADASTRAR E TRABALHAR
            </button>
          </div>

        </div>
      </main>

      {/* Styled overrides inside the component for perfect responsiveness */}
      <style jsx global>{`
        @media (max-width: 768px) {
          .split-grid-layout {
            grid-template-columns: 1fr !important;
            gap: 20px !important;
          }
          
          .mobile-tabs-toggle {
            display: flex !important;
          }
          
          .hide-mobile {
            display: none !important;
          }
          
          h1 {
            font-size: 1.65rem !important;
          }
        }
      `}</style>
    </div>
  );
}
