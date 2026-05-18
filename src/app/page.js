"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signUpProvider,
  uploadSelfie,
  uploadDocument,
  submitProviderOnboarding,
  checkRegistrationAvailability,
  supabase,
} from "../services/supabase";
import { formatCPF, formatCEP, formatPhone } from "../utils/formatters";
import { validateCPF, validateEmail } from "../utils/validators";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";

export default function ResidentHubLanding() {
  const router = useRouter();

  // Wizard state: 0 = Landing/Estimator, 1 = Address Form, 2 = Selfie/Document, 3 = Safety Upload, 4 = Waiting Queue
  const [step, setStep] = useState(0);

  // Estimador Ganhos
  const [simCategory, setSimCategory] = useState("diarista"); // "diarista", "marido"
  const [simDiaristaDias, setSimDiaristaDias] = useState(4);
  const [simDiaristaValor, setSimDiaristaValor] = useState(250);
  const [simMaridoDias, setSimMaridoDias] = useState(5);
  const [simMaridoServs, setSimMaridoServs] = useState(3);
  const [simMaridoValor, setSimMaridoValor] = useState(100);
  const [estimatedIncome, setEstimatedIncome] = useState(3200);

  // Dados Cadastrais Form (Step 1)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");
  const [cep, setCep] = useState("");
  const [bairro, setBairro] = useState("");
  const [rua, setRua] = useState("");
  const [num, setNum] = useState("");
  const [cidade, setCidade] = useState("São Paulo / SP");
  const [comp, setComp] = useState("");

  // Validação de Erros Local
  const [errors, setErrors] = useState({});

  // Arquivos (Step 2 & 3)
  const [selfieFile, setSelfieFile] = useState(null);
  const [rgFile, setRgFile] = useState(null);
  const [atestadoFile, setAtestadoFile] = useState(null);
  const [selfieName, setSelfieName] = useState("");
  const [rgName, setRgName] = useState("");
  const [atestadoName, setAtestadoName] = useState("");

  // Controladores do Cookies e Modais Legais
  const [showCookies, setShowCookies] = useState(true);
  const [legalModalType, setLegalModalType] = useState(null); // "terms", "privacy", null
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  // Indicador de carregamento / submissão geral
  const [submitting, setSubmitting] = useState(false);
  // Verificação assíncrona de email/CPF no Step 1
  const [checkingStep1, setCheckingStep1] = useState(false);

  // Sessão ativa de candidato
  const [hasCandidateSession, setHasCandidateSession] = useState(false);

  // Recupera sessão prévia de triagem se existir (ou se houver uma sessão ativa de candidato no Supabase)
  useEffect(() => {
    const checkActiveSession = async () => {
      const prevSession = localStorage.getItem("candidate_session");
      if (prevSession) {
        try {
          const payload = JSON.parse(prevSession);
          if (payload.status === "Pendente") {
            const { data } = await supabase.auth.getSession();
            if (data?.session) {
              setName(payload.name);
              setHasCandidateSession(true);
              setStep(4);
              return;
            } else {
              localStorage.removeItem("candidate_session");
            }
          }
        } catch (e) {
          localStorage.removeItem("candidate_session");
        }
      }

      // Se não houver session no localStorage, mas o usuário estiver autenticado no Supabase como candidato
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const userId = data.session.user.id;
        const { data: userProfile } = await supabase
          .from("profiles")
          .select("role, name")
          .eq("id", userId)
          .single();

        if (userProfile && userProfile.role === "candidate") {
          const { data: provider } = await supabase
            .from("service_providers")
            .select("status")
            .eq("id", userId)
            .single();

          if (provider) {
            const payload = {
              id: userId,
              name: userProfile.name || "Prestador",
              status: provider.status,
              timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
            };
            localStorage.setItem("candidate_session", JSON.stringify(payload));
            setName(userProfile.name);
            setHasCandidateSession(true);
            setStep(4);
          }
        }
      }
    };

    checkActiveSession();
  }, []);

  // Simula o cálculo de ganhos com base nos estados
  useEffect(() => {
    if (simCategory === "diarista") {
      // Recebe 80% do valor bruto
      const monthlyBruto = simDiaristaDias * simDiaristaValor * 4;
      setEstimatedIncome(Math.round(monthlyBruto * 0.8));
    } else {
      const monthlyBruto = simMaridoDias * simMaridoServs * simMaridoValor * 4;
      setEstimatedIncome(Math.round(monthlyBruto * 0.8));
    }
  }, [simCategory, simDiaristaDias, simDiaristaValor, simMaridoDias, simMaridoServs, simMaridoValor]);

  // Handler do auto-preenchimento rápido de CEP
  const handleCepChange = async (value) => {
    const formatted = formatCEP(value);
    setCep(formatted);

    // CEP específico do Reserva Raposo para simulação rápida
    if (formatted === "05386-300") {
      setBairro("Jardim Raposo Tavares");
      setRua("Av. Engenheiro Heitor Antônio Eiras Garcia");
      setCidade("São Paulo / SP");
      return;
    }

    // Busca assíncrona real via API ViaCEP
    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        
        if (data && !data.erro) {
          if (data.bairro) setBairro(data.bairro);
          if (data.logradouro) setRua(data.logradouro);
          if (data.localidade && data.uf) {
            setCidade(`${data.localidade} / ${data.uf}`);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar o CEP na API ViaCEP:", err);
      }
    }
  };

  // Validador rápido da Etapa 1
  const isStep1Valid = () => {
    return (
      name.length > 4 &&
      validateEmail(email) &&
      password.length >= 6 &&
      validateCPF(cpf) &&
      phone.replace(/\D/g, "").length >= 10 &&
      cep.replace(/\D/g, "").length === 8 &&
      bairro.length > 2 &&
      rua.length > 3 &&
      num.length > 0 &&
      cidade.length > 2
    );
  };

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  // Envio final de Onboarding para o Supabase
  const submitOnboarding = async () => {
    setSubmitting(true);
    try {
      // 0. Limpa apenas o localStorage local (signOut é tratado pelo AuthContext)
      localStorage.removeItem("candidate_session");

      // 1. Cadastra o usuário de autenticação no Supabase
      const user = await signUpProvider(email, password, name, cpf, phone);

      // 2. Upload dos arquivos obrigatórios de KYC
      let selfiePath = null;
      let rgPath = null;
      let documentPath = null;

      if (selfieFile) {
        selfiePath = await uploadSelfie(user.id, selfieFile);
      }
      if (rgFile) {
        rgPath = await uploadDocument(user.id, rgFile);
      }
      if (atestadoFile) {
        documentPath = await uploadDocument(user.id, atestadoFile);
      }

      // 3. Enviar para a fila de triagem
      const onboardingData = {
        cep: cep.replace(/\D/g, ""),
        rua,
        num,
        comp,
        bairro,
        cidade,
        loc: `${rua}, ${num}${comp ? ` - ${comp}` : ""} - ${bairro}, ${cidade} - CEP: ${cep}`,
        selfie_path: selfiePath,
        rg_path: rgPath,
        document_path: documentPath,
      };

      await submitProviderOnboarding(user.id, onboardingData);

      // 4. Grava no local storage para visualização da Fila
      const sessionPayload = {
        id: user.id,
        name: name,
        status: "Pendente",
        timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      localStorage.setItem("candidate_session", JSON.stringify(sessionPayload));

      // 5. Ir para etapa de sucesso
      setStep(4);
    } catch (err) {
      console.error("Erro na submissão de cadastro:", err);
      // AuthRetryableFetchError não tem .message direto — extrai de forma segura
      const friendlyMsg =
        err?.message ||
        err?.cause?.message ||
        (typeof err === "string" ? err : null) ||
        (err?.name === "AuthRetryableFetchError"
          ? "Não foi possível conectar ao servidor. Verifique se o Supabase local está ativo (porta 55321) e tente novamente."
          : "Houve uma falha ao enviar sua documentação. Tente novamente.");
      showCustomAlert("Erro de Cadastro", friendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Mock de captura ou upload rápido de arquivos para fins de demonstração fluida
  const handleFileMock = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (field === "selfie") {
      setSelfieFile(file);
      setSelfieName(file.name);
    } else if (field === "rg") {
      setRgFile(file);
      setRgName(file.name);
    } else if (field === "atestado") {
      setAtestadoFile(file);
      setAtestadoName(file.name);
    }
  };

  return (
    <div className="main-container">
      
      {/* Sidebar Onboarding Desktop */}
      <div className="onboarding-sidebar">
        <div className="sidebar-brand" style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "1px", marginBottom: "40px" }}>
          <span style={{ color: "var(--color-accent-light)", fontWeight: 800 }}>RESERVA</span> SERVIÇOS
        </div>
        
        <div className="sidebar-headline" style={{ fontFamily: "Outfit", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.25, color: "#fff", marginBottom: "14px" }}>
          Sua Renda Multiplicada Perto de Casa
        </div>
        
        <p className="sidebar-subtext" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "40px", fontWeight: 300 }}>
          Atenda centenas de moradores do megacomplexo Reserva Raposo. Tenha flexibilidade de horários, faturamento imediato livre de taxas e proteção garantida.
        </p>

        {/* Progresso de Steps */}
        <div className="sidebar-progress-steps" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "auto" }}>
          <div className={`side-step ${step >= 1 ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "16px", transition: "var(--transition-smooth)" }}>
            <span className="side-step-indicator" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= 1 ? "var(--color-brand)" : "var(--bg-tertiary)", color: "#fff", border: "2px solid var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.85rem", boxShadow: step >= 1 ? "0 0 12px rgba(5, 150, 105, 0.4)" : "none" }}>1</span>
            <div className="side-step-text">
              <h5 style={{ fontFamily: "Outfit", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Dados Cadastrais</h5>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Contato e endereço de triagem</p>
            </div>
          </div>
          <div className={`side-step ${step >= 2 ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "16px", transition: "var(--transition-smooth)" }}>
            <span className="side-step-indicator" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= 2 ? "var(--color-brand)" : "var(--bg-tertiary)", color: "#fff", border: "2px solid var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.85rem", boxShadow: step >= 2 ? "0 0 12px rgba(5, 150, 105, 0.4)" : "none" }}>2</span>
            <div className="side-step-text">
              <h5 style={{ fontFamily: "Outfit", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Identificação & Biometria</h5>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Selfie e documento oficial</p>
            </div>
          </div>
          <div className={`side-step ${step >= 3 ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "16px", transition: "var(--transition-smooth)" }}>
            <span className="side-step-indicator" style={{ width: "32px", height: "32px", borderRadius: "50%", backgroundColor: step >= 3 ? "var(--color-brand)" : "var(--bg-tertiary)", color: "#fff", border: "2px solid var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.85rem", boxShadow: step >= 3 ? "0 0 12px rgba(5, 150, 105, 0.4)" : "none" }}>3</span>
            <div className="side-step-text">
              <h5 style={{ fontFamily: "Outfit", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>Segurança Local</h5>
              <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>Antecedentes e homologação</p>
            </div>
          </div>
        </div>

        {/* Depoimento Testimonial */}
        <div className="sidebar-testimonial" style={{ backgroundColor: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)", borderRadius: "12px", padding: "16px", marginTop: "20px" }}>
          <div style={{ fontSize: "0.8rem", marginBottom: "6px" }}>⭐⭐⭐⭐⭐</div>
          <p style={{ fontSize: "0.72rem", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "6px" }}>
            "Faturar no Reserva Raposo mudou minha rotina. Faço diárias perto de casa, sem custo de transporte, e recebo livre de taxas em minutos!"
          </p>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)" }}>— Maria S., Diarista Parceira</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="onboarding-content-area">
        <div className="form-wrapper">
          
          {/* STEP 0: Landing / Ganhos Estimator */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              {hasCandidateSession && (
                <div
                  onClick={() => setStep(4)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 14px",
                    backgroundColor: "rgba(16, 185, 129, 0.08)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "10px",
                    marginBottom: "20px",
                    cursor: "pointer",
                    transition: "var(--transition-smooth)",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.14)")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.08)")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--color-brand-light)", display: "inline-block", animation: "pulse 1.2s infinite" }}></span>
                    <span style={{ fontSize: "0.72rem", color: "var(--color-brand-light)", fontWeight: 500 }}>
                      Você possui um cadastro ativo sob triagem.
                    </span>
                  </div>
                  <span style={{ fontSize: "0.7rem", color: "var(--color-brand-light)", fontWeight: 700, display: "flex", alignItems: "center", gap: "2px" }}>
                    Acompanhar Status ➔
                  </span>
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", marginBottom: "24px", paddingBottom: "12px", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "0.9rem", color: "#fff", letterSpacing: "0.5px" }}>
                  <span style={{ color: "var(--color-accent-light)", fontWeight: 800 }}>RESERVA</span> SERVIÇOS
                </div>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    localStorage.removeItem("candidate_session");
                    setHasCandidateSession(false);
                    router.push("/login");
                  }}
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--color-accent-light)",
                    textDecoration: "none",
                    fontWeight: 600,
                    fontFamily: "Outfit",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "6px 12px",
                    borderRadius: "8px",
                    backgroundColor: "rgba(217,119,6,0.08)",
                    border: "1px solid rgba(217,119,6,0.15)",
                    cursor: "pointer",
                  }}
                >
                  Já tenho cadastro
                </button>
              </div>

              <div style={{ textAlign: "center", marginBottom: "16px" }}>
                <Badge variant="accent" style={{ marginBottom: "10px" }}>
                  GANHE ATÉ R$ 7.220/MÊS
                </Badge>
                <h2 style={{ fontSize: "1.65rem", fontFamily: "Outfit", fontWeight: 700, color: "#fff", lineHeight: 1.25 }}>
                  Sua Renda Multiplicada Perto de Casa
                </h2>
                <p style={{ color: "var(--text-secondary)", fontSize: "0.82rem", marginTop: "8px", fontWeight: 300 }}>
                  Atenda clientes a poucos passos de casa no complexo residencial, livre de trânsito ou custos de transporte.
                </p>
              </div>

              {/* Simulador Interativo */}
              <div style={{ background: "linear-gradient(135deg, rgba(15,19,31,0.9) 0%, rgba(7,9,14,0.95) 100%)", border: "1px solid rgba(217, 119, 6, 0.25)", borderRadius: "16px", padding: "18px", marginBottom: "20px", textAlign: "center" }}>
                <h4 style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px", fontWeight: 600 }}>
                  Simule Seus Ganhos Mensais
                </h4>

                <div style={{ display: "flex", gap: "4px", marginBottom: "14px", backgroundColor: "rgba(255,255,255,0.03)", border: "var(--border-thin)", borderRadius: "10px", padding: "3px" }}>
                  <button
                    onClick={() => setSimCategory("diarista")}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      fontSize: "0.68rem",
                      fontFamily: "Outfit",
                      fontWeight: 600,
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: simCategory === "diarista" ? "var(--color-accent)" : "transparent",
                      color: simCategory === "diarista" ? "var(--color-accent)" : "transparent",
                      color: simCategory === "diarista" ? "var(--bg-primary)" : "var(--text-secondary)",
                    }}
                  >
                    Diarista / Doméstica
                  </button>
                  <button
                    onClick={() => setSimCategory("marido")}
                    style={{
                      flex: 1,
                      padding: "6px 4px",
                      fontSize: "0.68rem",
                      fontFamily: "Outfit",
                      fontWeight: 600,
                      borderRadius: "7px",
                      border: "none",
                      cursor: "pointer",
                      backgroundColor: simCategory === "marido" ? "var(--color-accent)" : "transparent",
                      color: simCategory === "marido" ? "var(--bg-primary)" : "var(--text-secondary)",
                    }}
                  >
                    Marido de Aluguel
                  </button>
                </div>

                {simCategory === "diarista" ? (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ textAlign: "left" }}>
                      <label style={{ fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Diárias / Semana</label>
                      <select value={simDiaristaDias} onChange={(e) => setSimDiaristaDias(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "var(--bg-tertiary)", border: "var(--border-thin)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                        <option value={1}>1 Diária / semana</option>
                        <option value={2}>2 Diárias / semana</option>
                        <option value={3}>3 Diárias / semana</option>
                        <option value={4}>4 Diárias / semana</option>
                        <option value={5}>5 Diárias / semana</option>
                      </select>
                    </div>
                    <div style={{ textAlign: "left" }}>
                      <label style={{ fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Valor Médio</label>
                      <select value={simDiaristaValor} onChange={(e) => setSimDiaristaValor(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "var(--bg-tertiary)", border: "var(--border-thin)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                        <option value={200}>R$ 200 (Básica)</option>
                        <option value={250}>R$ 250 (Padrão)</option>
                        <option value={300}>R$ 300 (Completa)</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "12px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <div style={{ textAlign: "left" }}>
                        <label style={{ fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Dias / Semana</label>
                        <select value={simMaridoDias} onChange={(e) => setSimMaridoDias(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "var(--bg-tertiary)", border: "var(--border-thin)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                          <option value={1}>1 dia / semana</option>
                          <option value={2}>2 dias / semana</option>
                          <option value={3}>3 dias / semana</option>
                          <option value={4}>4 dias / semana</option>
                          <option value={5}>5 dias / semana</option>
                        </select>
                      </div>
                      <div style={{ textAlign: "left" }}>
                        <label style={{ fontSize: "0.58rem", fontWeight: 600, textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>Serviços / Dia</label>
                        <select value={simMaridoServs} onChange={(e) => setSimMaridoServs(Number(e.target.value))} style={{ width: "100%", padding: "6px 10px", backgroundColor: "var(--bg-tertiary)", border: "var(--border-thin)", borderRadius: "8px", color: "#fff", fontSize: "0.72rem" }}>
                          <option value={1}>1 Serviço / dia</option>
                          <option value={2}>2 Serviços / dia</option>
                          <option value={3}>3 Serviços / dia</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ margin: "12px 0", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "12px" }}>
                  <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", textTransform: "uppercase" }}>Ganhos Líquidos Estimados</span>
                  <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--color-accent-light)", fontFamily: "Outfit", margin: "4px 0" }}>
                    R$ {estimatedIncome.toLocaleString("pt-BR")}
                    <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 400 }}>/mês</span>
                  </div>
                </div>
                <p style={{ fontSize: "0.68rem", color: "var(--text-secondary)", fontWeight: 300 }}>
                  Você recebe <strong style={{ color: "#fff" }}>80% do valor do serviço</strong> livre de taxas administrativas direto na sua conta.
                </p>
              </div>

              {/* Botões do Rodapé Legal */}
              <div style={{ textAlign: "center", marginBottom: "18px", fontSize: "0.72rem", color: "var(--text-muted)" }}>
                Ao se cadastrar, você concorda com nossos{" "}
                <span onClick={() => setLegalModalType("terms")} style={{ color: "var(--color-accent-light)", textDecoration: "underline", cursor: "pointer" }}>Termos de Uso</span> e{" "}
                <span onClick={() => setLegalModalType("privacy")} style={{ color: "var(--color-accent-light)", textDecoration: "underline", cursor: "pointer" }}>Política de Privacidade & LGPD</span>.
              </div>

              <Button variant="accent" onClick={() => setStep(1)} style={{ animation: "pulse-glow 2s infinite" }}>
                COMEÇAR A FATURAR AGORA
              </Button>
            </div>
          )}

          {/* STEP 1: Address Form */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0 auto 20px auto", width: "100%", maxWidth: "160px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>1</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>2</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>3</span>
              </div>

              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Ficha Cadastral</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: 300 }}>
                Preencha seus contatos e seu endereço completo para homologação condominial.
              </p>

              <div style={{ overflowY: "auto", maxHeight: "420px", paddingRight: "4px" }}>
                <Input
                  label="Nome Completo"
                  id="reg-name"
                  placeholder="Ex: Carlos Santos"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                
                <div className="responsive-grid">
                  <Input
                    label="E-mail de Acesso"
                    id="reg-email"
                    type="email"
                    placeholder="seuemail@exemplo.com"
                    value={email}
                    error={errors.email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                  />
                  <Input
                    label="Senha de Acesso"
                    id="reg-password"
                    type="password"
                    placeholder="Mínimo 6 dígitos"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="responsive-grid">
                  <Input
                    label="CPF do Profissional"
                    id="reg-cpf"
                    placeholder="000.000.000-00"
                    value={cpf}
                    error={errors.cpf}
                    onChange={(e) => {
                      setCpf(formatCPF(e.target.value));
                      if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: undefined }));
                    }}
                    maxLength={14}
                  />
                  <Input
                    label="WhatsApp de Contato"
                    id="reg-phone"
                    placeholder="(11) 99999-9999"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone(e.target.value))}
                    maxLength={15}
                  />
                </div>

                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.08)", padding: "12px 0 6px 0", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 style={{ fontSize: "0.75rem", color: "var(--color-accent-light)", fontWeight: 600 }}>ENDEREÇO HIPERLOCAL</h4>
                </div>

                <div className="responsive-grid">
                  <Input
                    label="CEP Residencial"
                    id="reg-cep"
                    placeholder="00000-000"
                    value={cep}
                    onChange={(e) => handleCepChange(e.target.value)}
                    maxLength={9}
                  />
                  <Input
                    label="Bairro"
                    id="reg-bairro"
                    placeholder="Bairro"
                    value={bairro}
                    onChange={(e) => setBairro(e.target.value)}
                  />
                </div>

                <Input
                  label="Logradouro (Rua / Avenida)"
                  id="reg-rua"
                  placeholder="Rua ou Avenida"
                  value={rua}
                  onChange={(e) => setRua(e.target.value)}
                />

                <div className="responsive-grid">
                  <Input
                    label="Número"
                    id="reg-num"
                    placeholder="Número"
                    value={num}
                    onChange={(e) => setNum(e.target.value)}
                  />
                  <Input
                    label="Cidade / UF"
                    id="reg-cidade"
                    placeholder="Cidade"
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                  />
                </div>

                <Input
                  label="Complemento (Torre, Apto, Bloco)"
                  id="reg-comp"
                  placeholder="Ex: Torre 4, Apto 112"
                  value={comp}
                  onChange={(e) => setComp(e.target.value)}
                />

                {/* Dica de CEP Autofill */}
                <div style={{ backgroundColor: "rgba(5, 150, 105, 0.04)", border: "1px solid rgba(5, 150, 105, 0.15)", borderRadius: "8px", padding: "10px", fontSize: "0.68rem", color: "var(--color-brand-light)", marginBottom: "12px", display: "flex", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span>Dica: Digite o CEP <strong style={{ color: "#fff" }}>05386-300</strong> para preencher o endereço automaticamente.</span>
                </div>
              </div>

              <Button
                variant="brand"
                onClick={async () => {
                  setCheckingStep1(true);
                  // Limpa erros anteriores
                  setErrors({});
                  try {
                    const result = await checkRegistrationAvailability(email, cpf);
                    const newErrors = {};
                    if (result.email_taken) {
                      newErrors.email = "Este e-mail já possui um cadastro ativo. Acesse com sua conta ou use outro e-mail.";
                    }
                    if (result.cpf_taken) {
                      newErrors.cpf = "Este CPF já está vinculado a um cadastro. Cada profissional se cadastra apenas uma vez.";
                    }
                    if (Object.keys(newErrors).length > 0) {
                      setErrors(newErrors);
                    } else {
                      setStep(2);
                    }
                  } catch (err) {
                    // Se a verificação falhar (ex: RPC indisponível), avança mesmo assim
                    console.warn("Verificação de disponibilidade falhou, avançando sem checar:", err.message);
                    setStep(2);
                  } finally {
                    setCheckingStep1(false);
                  }
                }}
                loading={checkingStep1}
                disabled={!isStep1Valid() || checkingStep1}
                style={{ marginTop: "16px" }}
              >
                {checkingStep1 ? "Verificando dados..." : "Continuar para Identidade"}
              </Button>
            </div>
          )}

          {/* STEP 2: Selfie / CNH */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0 auto 20px auto", width: "100%", maxWidth: "160px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>✓</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>2</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--bg-tertiary)", color: "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem" }}>3</span>
              </div>

              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Biometria & Identidade</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: 300 }}>
                Carregue uma selfie nítida do seu rosto e um documento oficial para controle físico de portaria.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>1. Selfie Facial Nítida</label>
                  <label className="upload-area" style={{ display: "flex" }}>
                    <input type="file" accept="image/*" onChange={(e) => handleFileMock("selfie", e)} style={{ display: "none" }} />
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path></svg>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {selfieName ? `Selfie Selecionada: ${selfieName}` : "Carregar ou Tirar Selfie"}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Selfie correspondente ao documento civil</span>
                  </label>
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>2. CNH ou RG (Frente e Verso)</label>
                  <label className="upload-area" style={{ display: "flex" }}>
                    <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileMock("rg", e)} style={{ display: "none" }} />
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"></path></svg>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                      {rgName ? `Documento Selecionado: ${rgName}` : "Carregar RG ou CNH"}
                    </span>
                    <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Foto ou PDF nítido do documento</span>
                  </label>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="danger" onClick={() => setStep(1)} style={{ flex: 0.3 }}>Voltar</Button>
                <Button variant="brand" onClick={() => setStep(3)} disabled={!selfieFile || !rgFile} style={{ flex: 1 }}>Continuar</Button>
              </div>
            </div>
          )}

          {/* STEP 3: Safety Atestado */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "0 auto 20px auto", width: "100%", maxWidth: "160px" }}>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>✓</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-success)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>✓</span>
                <span style={{ width: "24px", height: "24px", borderRadius: "50%", backgroundColor: "var(--color-brand)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 600 }}>3</span>
              </div>

              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Segurança Condominial</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 300 }}>
                O Atestado de Antecedentes Criminais é exigido para liberação de portaria física nas torres residenciais.
              </p>

              <div style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "8px", lineHeight: "1.4" }}>
                  <strong>Ainda não tem o atestado criminal em mãos?</strong> Você pode emiti-lo na hora gratuitamente pela Polícia Civil de SP:
                </p>
                <a
                  href="https://www2.ssp.sp.gov.br/aacweb/carrega-formulario"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    backgroundColor: "var(--color-accent)",
                    color: "var(--bg-primary)",
                    borderRadius: "8px",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    textDecoration: "none",
                    fontFamily: "Outfit",
                  }}
                >
                  EMITIR ATESTADO DE GRAÇA
                </a>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Atestado Criminal (Foto ou PDF)</label>
                <label className="upload-area" style={{ display: "flex" }}>
                  <input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileMock("atestado", e)} style={{ display: "none" }} />
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
                    {atestadoName ? `Atestado Selecionado: ${atestadoName}` : "Carregar Atestado Criminal"}
                  </span>
                  <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Emitido nos últimos 90 dias úteis</span>
                </label>
              </div>

              {/* Shredder Alert Banner */}
              <div style={{ display: "flex", gap: "8px", padding: "10px", backgroundColor: "rgba(217,119,6,0.05)", border: "1px solid rgba(217,119,6,0.12)", borderRadius: "8px", marginBottom: "20px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p style={{ fontSize: "0.65rem", color: "var(--color-accent-light)", lineHeight: 1.3 }}>
                  <strong>Travas LGPD de Expugo Seguro:</strong> Para resguardar sua privacidade, todos os arquivos sensíveis de CNH/RG e atestado criminal são <strong>apagados de forma definitiva e irrecuperável</strong> no momento em que nossa equipe concluir a triagem cadastral.
                </p>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="danger" onClick={() => setStep(2)} style={{ flex: 0.3 }}>Voltar</Button>
                <Button variant="brand" onClick={submitOnboarding} loading={submitting} disabled={!atestadoFile} style={{ flex: 1 }}>Finalizar e Enviar</Button>
              </div>
            </div>
          )}

          {/* STEP 4: Waiting Queue */}
          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeIn 0.3s ease" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(5,150,105,0.06)", border: "2px solid var(--color-brand-light)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", animation: "radar 2s infinite" }}>
                <svg width="36" height="36" fill="none" stroke="var(--color-brand-light)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>

              <h2 style={{ fontSize: "1.45rem", fontFamily: "Outfit", color: "#fff", marginBottom: "8px" }}>Cadastro Recebido!</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
                Olá, <strong style={{ color: "#fff" }}>{name || "Profissional"}</strong>. Suas certidões e contatos estão alocados na fila de auditoria local e estão sob conferência.
              </p>

              <div style={{ width: "100%", padding: "16px", borderRadius: "12px", border: "var(--border-thin)", backgroundColor: "rgba(255,255,255,0.01)", textAlign: "left", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--color-accent-light)", display: "inline-block", animation: "pulse 1s infinite" }}></span>
                  <span style={{ fontSize: "0.72rem", color: "var(--color-accent-light)", fontWeight: 600, textTransform: "uppercase" }}>Triagem Ativa Local</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  Nossa equipe condominial avaliará seu cadastro e antecedentes. O prazo regulamentar para aprovação é de <strong>até 48 horas úteis</strong>, contudo a nossa média histórica de liberação é de <strong>apenas 1 hora</strong>.
                </p>
              </div>

              <div style={{ width: "100%", padding: "12px", borderRadius: "10px", backgroundColor: "rgba(16,185,129,0.04)", border: "1px solid rgba(16,185,129,0.12)", textAlign: "left", display: "flex", gap: "8px", marginBottom: "24px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-light)" strokeWidth="2" style={{ width: "18px", height: "18px", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                <p style={{ fontSize: "0.65rem", color: "var(--color-brand-light)", lineHeight: 1.4 }}>
                  Ambiente seguro em conformidade com a LGPD. Seus dados e arquivos estão protegidos.
                </p>
              </div>

              <Button variant="brand" onClick={() => setStep(0)} style={{ width: "100%" }}>
                Voltar para a Página Inicial
              </Button>
            </div>
          )}

        </div>
      </div>

      {/* Cookies Consent Banner */}
      {showCookies && (
        <div className="cookies-banner" style={{ width: "360px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-light)" strokeWidth="2" style={{ width: "18px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" /></svg>
            <h4 style={{ fontSize: "0.8rem", fontWeight: 600, color: "#fff", fontFamily: "Outfit" }}>Privacidade & Segurança</h4>
          </div>
          <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", lineHeight: 1.4, marginBottom: "12px" }}>
            Utilizamos cookies essenciais de sessão criptografada para resguardar sua triagem local em conformidade com as regras da LGPD.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button onClick={() => setShowCookies(false)} style={{ padding: "6px 12px", fontSize: "0.68rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}>Recusar</button>
            <button onClick={() => setShowCookies(false)} style={{ padding: "6px 14px", fontSize: "0.68rem", color: "#000", backgroundColor: "var(--color-accent-light)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: 600 }}>Aceitar Termos</button>
          </div>
        </div>
      )}

      {/* Legal Modals */}
      <Modal isOpen={legalModalType === "terms"} onClose={() => setLegalModalType(null)} title="Termos de Uso">
        <div style={{ overflowY: "auto", maxHeight: "250px", fontSize: "0.75rem", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>1. Parceria de Intermediação</h4>
          <p>O Reserva Serviços opera como um portal de intermediação tecnológica neutro (C2C) para a contratação de diaristas e técnicos locais sob demanda pelas unidades do Reserva Raposo.</p>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>2. Segurança e Conduta</h4>
          <p>Os prestadores parceiros são profissionais independentes e assumem plena responsabilidade civil pelos serviços agendados, portabilidade de chaves e zeladoria interna das torres.</p>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>3. Split Tributário Asaas</h4>
          <p>O repasse financeiro de 80% do valor bruto da diária é liquidado no momento da finalização do check-out operacional pelo parceiro autônomo.</p>
        </div>
      </Modal>

      <Modal isOpen={legalModalType === "privacy"} onClose={() => setLegalModalType(null)} title="Política de Privacidade & LGPD">
        <div style={{ overflowY: "auto", maxHeight: "250px", fontSize: "0.75rem", lineHeight: 1.5, display: "flex", flexDirection: "column", gap: "10px" }}>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>1. Minimização de Dados Sensíveis</h4>
          <p>Em conformidade estrita com o Art. 5 e 6 da LGPD (Lei 13.709/2018), coletamos apenas o mínimo necessário de dados de antecedentes criminais e identificação civil para controle de acesso físico condominial.</p>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>2. Descarte Permanente Exclusivo</h4>
          <p>Tanto a certidão policial em PDF de antecedentes quanto a imagem da CNH/RG são <strong>apagadas de forma permanente e irreversível do Supabase Storage</strong> no milissegundo em que a triagem local for homologada pelo gestor.</p>
          <h4 style={{ color: "#fff", fontWeight: 600 }}>3. Direitos dos Titulares</h4>
          <p>O titular tem direito de consultar seu cadastro e requerer a retificação, suspensão de matches locais ou inativação do perfil biométrico a qualquer instante.</p>
        </div>
      </Modal>

      {/* Alert Custom Modal */}
      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title={alertTitle}>
        <p>{alertMsg}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <Button variant="brand" onClick={() => setAlertOpen(false)} style={{ padding: "8px 24px", width: "auto" }}>
            Fechar Alerta
          </Button>
        </div>
      </Modal>
    </div>
  );
}
