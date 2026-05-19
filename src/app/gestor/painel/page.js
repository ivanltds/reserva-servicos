"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
  supabase,
  fetchProvidersByStatus,
  updateProviderStatus,
  approveProvider,
  SUPABASE_URL,
  updateServiceItemPrice,
} from "../../../services/supabase";

const PRICING_CATEGORIES = [
  { id: "limpeza_domestica", title: "Limpeza Doméstica" },
  { id: "pequenos_reparos_eletrica", title: "Pequenos Reparos (Elétrica)" },
  { id: "pequenos_reparos_hidraulica", title: "Pequenos Reparos (Hidráulica)" },
  { id: "pequenos_reparos_pintura", title: "Pequenos Reparos (Pintura)" },
  { id: "pequenos_reparos_alvenaria", title: "Pequenos Reparos (Alvenaria)" },
  { id: "montador_de_moveis", title: "Montador de Móveis e Instalações" },
  { id: "cuidado_de_animais", title: "Cuidado de Animais (Pet Care)" },
  { id: "cozinha_gastronomia", title: "Cozinha e Gastronomia" },
  { id: "telhados_calhas", title: "Telhados e Calhas" },
  { id: "apoio_mudancas", title: "Apoio em Mudanças (Carga/Descarga)" }
];
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ClipboardCard from "../../../components/shared/ClipboardCard";

export default function GestorPainelPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  // Estados Locais de Triagem e Listagem
  const [activeTab, setActiveTab] = useState("Pendente"); // "Pendente", "Aprovado", "Inativo", "Banido"
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [loadingList, setLoadingList] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  // Estados Locais de Precificação
  const [pricingItems, setPricingItems] = useState([]);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [selectedPricingCategoryId, setSelectedPricingCategoryId] = useState("limpeza_domestica");

  // URLs assinadas seguras (LGPD)
  const [selfieUrl, setSelfieUrl] = useState("");
  const [rgUrl, setRgUrl] = useState("");
  const [documentUrl, setDocumentUrl] = useState("");

  // Estados de Checklist de Triagem (4 diretrizes baseadas no escopo de onboarding ativo)
  const [chkSelfie, setChkSelfie] = useState(false);
  const [chkDocument, setChkDocument] = useState(false);
  const [chkBackground, setChkBackground] = useState(false);
  const [chkAddress, setChkAddress] = useState(false);

  // Estados do Modal de Visualização Ampliada e Zoom de Segurança
  const [zoomUrl, setZoomUrl] = useState(null);
  const [zoomType, setZoomType] = useState("image"); // "image" ou "pdf"
  const [zoomScale, setZoomScale] = useState(1);

  // Estados do Modal de Erro/Alerta Customizado
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  const activeTabRef = useRef(activeTab);

  // Sincroniza a ref com o estado da aba ativa
  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  const loadPricingItems = async () => {
    setLoadingPricing(true);
    try {
      const { data, error } = await supabase
        .from("service_items")
        .select("*")
        .order("name");
      if (error) throw error;
      setPricingItems(data || []);
    } catch (err) {
      console.error("Erro ao carregar itens de precificação:", err);
      showCustomAlert("Erro de Banco", "Não foi possível carregar os itens de serviço.");
    } finally {
      setLoadingPricing(false);
    }
  };

  // Carrega a lista de candidatos com base no status da aba ativa (ref estável para evitar loops de WebSocket)
  const loadCandidates = useCallback(async () => {
    setLoadingList(true);
    try {
      const data = await fetchProvidersByStatus(activeTabRef.current);
      setCandidates(data || []);
    } catch (err) {
      console.error("Erro ao listar prestadores:", err);
      showCustomAlert("Erro de Banco", "Não foi possível sincronizar a fila operacional com o banco.");
    } finally {
      setLoadingList(false);
    }
  }, []);

  // Carrega os detalhes do candidato selecionado
  const loadSelectedDetails = useCallback(async (id) => {
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          id,
          status,
          cep,
          rua,
          num,
          comp,
          bairro,
          cidade,
          loc,
          selfie_path,
          rg_path,
          document_path,
          profiles (
            name,
            cpf,
            phone
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      setSelectedCandidate(data);
      setChkSelfie(false);
      setChkDocument(false);
      setChkBackground(false);
      setChkAddress(false);

      // Gerar URLs assinadas temporárias ou carregar URLs públicas para visualização segura (LGPD/Private)
      if (data.selfie_path) {
        setSelfieUrl(`${SUPABASE_URL}/storage/v1/object/public/selfies-temp/${data.selfie_path}`);
      } else {
        setSelfieUrl("");
      }

      if (data.status === "Pendente") {
        if (data.rg_path) {
          const { data: rgData, error: rgErr } = await supabase.storage
            .from("criminologia-temp")
            .createSignedUrl(data.rg_path, 300);
          if (!rgErr && rgData) {
            setRgUrl(rgData.signedUrl);
          } else {
            setRgUrl("");
          }
        } else {
          setRgUrl("");
        }

        if (data.document_path) {
          const { data: docData, error: docErr } = await supabase.storage
            .from("criminologia-temp")
            .createSignedUrl(data.document_path, 300);
          if (!docErr && docData) {
            setDocumentUrl(docData.signedUrl);
          } else {
            setDocumentUrl("");
          }
        } else {
          setDocumentUrl("");
        }
      } else {
        setRgUrl("");
        setDocumentUrl("");
      }
    } catch (err) {
      console.error("Erro ao carregar detalhes:", err);
      showCustomAlert("Erro de Consulta", "Não foi possível carregar os detalhes do profissional.");
    }
  }, []);

  // Monitora a sessão e redireciona caso não autorizado
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (profile && profile.role !== "master" && profile.role !== "operator") {
        router.push("/login");
      }
    }
  }, [user, profile, authLoading, router]);

  // Carrega e assina atualizações do Postgres em tempo real (instalação estável única)
  useEffect(() => {
    if (user && (profile?.role === "master" || profile?.role === "operator")) {
      if (activeTab !== "Valores") {
        loadCandidates();
      } else {
        loadPricingItems();
      }

      const channel = supabase
        .channel("public:service_providers")
        .on("postgres_changes", { event: "*", schema: "public", table: "service_providers" }, () => {
          if (activeTabRef.current !== "Valores") {
            loadCandidates();
          }
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, profile, activeTab, loadCandidates]);

  // Manipulador de Aprovação / Purge de Segurança
  const handleApprove = async () => {
    if (!selectedCandidate) return;
    setProcessingAction(true);

    try {
      // Chama a Edge Function de expurgo seguro via cliente Supabase
      await approveProvider(
        selectedCandidate.id,
        selectedCandidate.selfie_path,
        selectedCandidate.rg_path,
        selectedCandidate.document_path,
        user.email,
        {
          selfie_matches_document: chkSelfie,
          document_data_matches: chkDocument,
          clean_background_check: chkBackground,
          address_consistent: chkAddress
        }
      );
      
      showCustomAlert(
        "Sucesso na Homologação",
        `O profissional ${selectedCandidate.profiles?.name} foi aprovado com sucesso! Os arquivos de KYC sensíveis foram expurgados permanentemente conforme as travas legais.`
      );
      
      setSelectedCandidate(null);
      await loadCandidates();
    } catch (err) {
      console.error("Erro na homologação:", err);
      showCustomAlert("Falha na Homologação", err.message || String(err));
    } finally {
      setProcessingAction(false);
    }
  };

  // Rejeição / Suspensão ou Banimento manual
  const handleUpdateStatus = async (status) => {
    if (!selectedCandidate) return;
    setProcessingAction(true);
    try {
      await updateProviderStatus(selectedCandidate.id, status, user.email);
      showCustomAlert(
        "Mudança de Status",
        `O perfil foi definido com sucesso como ${status.toUpperCase()}.`
      );
      setSelectedCandidate(null);
      await loadCandidates();
    } catch (err) {
      console.error("Erro ao alterar status:", err);
      showCustomAlert("Erro de Ação", "Não foi possível atualizar o status no banco.");
    } finally {
      setProcessingAction(false);
    }
  };

  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <div style={{ color: "var(--text-secondary)", fontFamily: "Outfit", fontSize: "1.2rem" }}>
          Autenticando sessão administrativa...
        </div>
      </div>
    );
  }

  if (!user || (profile && profile.role !== "master" && profile.role !== "operator")) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      {/* Navbar de Navegação Administrativa */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 32px",
          borderBottom: "var(--border-thin)",
          backgroundColor: "rgba(15, 19, 31, 0.4)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--color-brand-light)"
            strokeWidth="2"
            style={{ width: "24px", height: "24px" }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
          <div style={{ fontFamily: "Outfit", fontWeight: 700, fontSize: "1.1rem" }}>
            Reserva Serviços{" "}
            <span
              style={{
                fontSize: "0.68rem",
                color: "var(--color-brand-light)",
                textTransform: "uppercase",
                backgroundColor: "rgba(5, 150, 105, 0.12)",
                padding: "3px 8px",
                borderRadius: "12px",
                marginLeft: "6px",
              }}
            >
              Módulo Gestor
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ textAlign: "right" }}>
            <h4 style={{ fontSize: "0.85rem", fontWeight: 600 }}>{profile?.name || "Gestor"}</h4>
            <p style={{ fontSize: "0.68rem", color: "var(--color-brand-light)" }}>
              {profile?.role === "master" ? "Gestor Master" : "Operador de Suporte"}
            </p>
          </div>
          <button
            onClick={signOut}
            style={{
              padding: "6px 12px",
              backgroundColor: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "var(--color-error)",
              borderRadius: "8px",
              fontSize: "0.75rem",
              fontFamily: "Outfit",
              cursor: "pointer",
              transition: "var(--transition-smooth)",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "rgba(239, 68, 68, 0.15)")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "rgba(239, 68, 68, 0.08)")}
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Grid Central */}
      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", flex: 1 }}>
        
        {/* Painel Lateral - Fila de Candidatos */}
        <aside
          style={{
            borderRight: "var(--border-thin)",
            padding: "24px 16px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            backgroundColor: "rgba(7, 9, 14, 0.4)",
          }}
        >
          {/* Abas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "4px" }}>
            {["Pendente", "Aprovado", "Inativo", "Banido", "Valores"].map((status) => (
              <button
                key={status}
                onClick={() => {
                  setActiveTab(status);
                  setSelectedCandidate(null);
                  activeTabRef.current = status;
                  if (status !== "Valores") {
                    loadCandidates();
                  } else {
                    loadPricingItems();
                  }
                }}
                style={{
                  padding: "8px 2px",
                  borderRadius: "6px",
                  fontSize: "0.65rem",
                  fontFamily: "Outfit",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: activeTab === status ? "1px solid rgba(255,255,255,0.12)" : "none",
                  backgroundColor:
                    activeTab === status ? "var(--bg-tertiary)" : "rgba(255,255,255,0.01)",
                  color: activeTab === status ? "var(--text-primary)" : "var(--text-muted)",
                  transition: "var(--transition-smooth)",
                }}
              >
                {status}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              {activeTab === "Pendente"
                ? "Fila de Triagem"
                : activeTab === "Aprovado"
                ? "Prestadores Ativos"
                : activeTab === "Inativo"
                ? "Inativos"
                : activeTab === "Banido"
                ? "Banidos"
                : "Categorias"}
            </h3>
            <Badge variant={activeTab === "Pendente" ? "accent" : activeTab === "Aprovado" ? "success" : activeTab === "Valores" ? "brand" : "danger"}>
              {activeTab === "Valores" ? PRICING_CATEGORIES.length : candidates.length}
            </Badge>
          </div>

          {/* Fila */}
          <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: "10px" }}>
            {activeTab === "Valores" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {PRICING_CATEGORIES.map(cat => {
                  const isSelected = selectedPricingCategoryId === cat.id;
                  const count = pricingItems.filter(item => item.category_id === cat.id).length;
                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedPricingCategoryId(cat.id)}
                      style={{
                        padding: "12px",
                        borderRadius: "10px",
                        border: isSelected ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.02)",
                        backgroundColor: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                        cursor: "pointer",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        transition: "var(--transition-smooth)"
                      }}
                    >
                      <span style={{ fontSize: "0.78rem", fontWeight: isSelected ? 600 : 400 }}>{cat.title}</span>
                      <Badge variant="brand">{count || 12}</Badge>
                    </div>
                  );
                })}
              </div>
            ) : loadingList ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "20px" }}>
                Atualizando lista...
              </div>
            ) : candidates.length === 0 ? (
              <div style={{ textAlign: "center", color: "var(--text-muted)", fontSize: "0.75rem", padding: "20px" }}>
                Nenhum prestador encontrado.
              </div>
            ) : (
              candidates.map((c) => {
                const name = c.profiles?.name || "Candidato";
                const detail = c.rua ? `${c.rua}, ${c.num}` : (c.loc || "Sem endereço");
                const dateText = new Date(c.created_at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                });
                const isSelected = selectedCandidate?.id === c.id;

                return (
                  <div
                    key={c.id}
                    onClick={() => loadSelectedDetails(c.id)}
                    style={{
                      display: "flex",
                      gap: "12px",
                      padding: "12px",
                      borderRadius: "12px",
                      border: isSelected ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(255,255,255,0.02)",
                      backgroundColor: isSelected ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                      transition: "var(--transition-smooth)",
                    }}
                  >
                    {c.selfie_path ? (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          backgroundImage: `url('${SUPABASE_URL}/storage/v1/object/public/selfies-temp/${c.selfie_path}')`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          border: "var(--border-thin)",
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, var(--bg-tertiary) 0%, rgba(255,255,255,0.05) 100%)",
                          border: "var(--border-thin)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "0.85rem",
                          fontWeight: 700,
                          color: "var(--color-accent-light)",
                          flexShrink: 0,
                        }}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h4 style={{ fontSize: "0.8rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {name}
                      </h4>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {detail} • {dateText}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* Workspace Central */}
        <main style={{ padding: "32px", display: "flex", flexDirection: "column" }}>
          {activeTab === "Valores" ? (
            <PricingWorkspace
              pricingItems={pricingItems}
              selectedCategoryId={selectedPricingCategoryId}
              onUpdatePrice={async (itemId, defaultPrice, defaultDurationHours) => {
                const updated = await updateServiceItemPrice(itemId, defaultPrice, defaultDurationHours);
                if (updated) {
                  setPricingItems(prev => prev.map(item => item.id === itemId ? updated : item));
                }
              }}
              showCustomAlert={showCustomAlert}
            />
          ) : !selectedCandidate ? (
            /* Empty State */
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  backgroundColor: "rgba(255,255,255,0.01)",
                  border: "var(--border-thin)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--text-muted)",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "28px" }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <h3 style={{ fontFamily: "Outfit", fontSize: "1.3rem" }}>
                {activeTab === "Pendente" ? "Selecione um Candidato" : "Acompanhamento Cadastral"}
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", maxWidth: "360px", fontWeight: 300, lineHeight: 1.5 }}>
                {activeTab === "Pendente"
                  ? "Escolha um perfil na fila lateral para verificar selfies, documentos e antecedentes criminais antes de homologar."
                  : "Selecione um profissional na lista para ver avaliações, ficha condominial ativa e registros de ocorrências."}
              </p>
            </div>
          ) : selectedCandidate.status === "Pendente" ? (
            /* Triaging Workspace */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "var(--border-thin)", paddingBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontFamily: "Outfit" }}>
                    {selectedCandidate.profiles?.name}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
                    CPF: {selectedCandidate.profiles?.cpf} | CEP: {selectedCandidate.cep} | Local: {selectedCandidate.rua}, {selectedCandidate.num}{selectedCandidate.comp ? ` - ${selectedCandidate.comp}` : ""}, {selectedCandidate.bairro}, {selectedCandidate.cidade}
                  </p>
                </div>
                <Badge variant="accent">Triagem de Segurança</Badge>
              </div>

              {/* Box de Arquivos CNH/RG, Selfie e Atestado */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                
                {/* Selfie Card */}
                <div className="card-glass" style={{ textAlign: "center", padding: "20px" }}>
                  <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Selfie Capturada
                  </h4>
                  <div
                    onClick={() => { if (selfieUrl) { setZoomUrl(selfieUrl); setZoomType("image"); } }}
                    style={{
                      height: "220px",
                      borderRadius: "12px",
                      backgroundImage: selfieUrl ? `url('${selfieUrl}')` : "none",
                      backgroundColor: "rgba(255,255,255,0.01)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "var(--border-thin)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: selfieUrl ? "zoom-in" : "default",
                      transition: "var(--transition-smooth)"
                    }}
                    onMouseEnter={(e) => { if (selfieUrl) e.currentTarget.style.borderColor = "var(--color-brand-light)"; }}
                    onMouseLeave={(e) => { if (selfieUrl) e.currentTarget.style.borderColor = "var(--border-thin)"; }}
                  >
                    {!selfieUrl && (
                      <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Sem imagem</div>
                    )}
                  </div>
                </div>

                {/* RG Card */}
                <div className="card-glass" style={{ textAlign: "center", padding: "20px" }}>
                  <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                    CNH ou RG (Frente/Verso)
                  </h4>
                  {selectedCandidate.rg_path?.toLowerCase().endsWith(".pdf") ? (
                    <div
                      style={{
                        height: "220px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        background: "#121624",
                        borderRadius: "12px",
                        border: "var(--border-thin)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-light)" strokeWidth="2" style={{ width: "36px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: "0.74rem", fontWeight: 600 }}>Documento (PDF)</span>
                      {rgUrl ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <a
                            href={rgUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "var(--color-brand-light)", textDecoration: "underline" }}
                          >
                            Nova Guia
                          </a>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem" }}>|</span>
                          <button
                            onClick={() => { setZoomUrl(rgUrl); setZoomType("pdf"); }}
                            style={{ background: "none", border: "none", padding: 0, fontSize: "0.7rem", color: "var(--color-brand-light)", textDecoration: "underline", cursor: "pointer" }}
                          >
                            Abrir Aqui
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Carregando link...</span>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => { if (rgUrl) { setZoomUrl(rgUrl); setZoomType("image"); } }}
                      style={{
                        height: "220px",
                        borderRadius: "12px",
                        backgroundImage: rgUrl ? `url('${rgUrl}')` : "none",
                        backgroundColor: "rgba(255,255,255,0.01)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "var(--border-thin)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: rgUrl ? "zoom-in" : "default",
                        transition: "var(--transition-smooth)"
                      }}
                      onMouseEnter={(e) => { if (rgUrl) e.currentTarget.style.borderColor = "var(--color-brand-light)"; }}
                      onMouseLeave={(e) => { if (rgUrl) e.currentTarget.style.borderColor = "var(--border-thin)"; }}
                    >
                      {!rgUrl && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Sem documento</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Document Card */}
                <div className="card-glass" style={{ textAlign: "center", padding: "20px" }}>
                  <h4 style={{ fontSize: "0.85rem", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: "12px" }}>
                    Antecedentes Criminais
                  </h4>
                  {selectedCandidate.document_path?.toLowerCase().endsWith(".pdf") ? (
                    <div
                      style={{
                        height: "220px",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "10px",
                        background: "#121624",
                        borderRadius: "12px",
                        border: "var(--border-thin)",
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ width: "36px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span style={{ fontSize: "0.74rem", fontWeight: 600 }}>Atestado (PDF)</span>
                      {documentUrl ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <a
                            href={documentUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{ fontSize: "0.7rem", color: "var(--color-brand-light)", textDecoration: "underline" }}
                          >
                            Nova Guia
                          </a>
                          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: "0.7rem" }}>|</span>
                          <button
                            onClick={() => { setZoomUrl(documentUrl); setZoomType("pdf"); }}
                            style={{ background: "none", border: "none", padding: 0, fontSize: "0.7rem", color: "var(--color-brand-light)", textDecoration: "underline", cursor: "pointer" }}
                          >
                            Abrir Aqui
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>Carregando link...</span>
                      )}
                    </div>
                  ) : (
                    <div
                      onClick={() => { if (documentUrl) { setZoomUrl(documentUrl); setZoomType("image"); } }}
                      style={{
                        height: "220px",
                        borderRadius: "12px",
                        backgroundImage: documentUrl ? `url('${documentUrl}')` : "none",
                        backgroundColor: "rgba(255,255,255,0.01)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "var(--border-thin)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: documentUrl ? "zoom-in" : "default",
                        transition: "var(--transition-smooth)"
                      }}
                      onMouseEnter={(e) => { if (documentUrl) e.currentTarget.style.borderColor = "var(--color-brand-light)"; }}
                      onMouseLeave={(e) => { if (documentUrl) e.currentTarget.style.borderColor = "var(--border-thin)"; }}
                    >
                      {!documentUrl && (
                        <div style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>Sem documento</div>
                      )}
                    </div>
                  )}
                </div>
              </div>



              {/* Checklist de Validação Manual do Gestor com Auditoria Estrita */}
              <div
                className="card-glass"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  padding: "24px",
                  borderRadius: "16px",
                  border: "var(--border-thin)",
                }}
              >
                <div>
                  <h4 style={{ fontFamily: "Outfit", fontSize: "0.95rem", marginBottom: "4px" }}>
                    Ficha de Triagem Operacional & Auditoria de KYC
                  </h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    Verifique detalhadamente os documentos e imagens acima. A aprovação exige a validação e conformidade física de todas as 4 diretrizes do escopo ativo.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px 24px",
                    borderBottom: "1px solid rgba(255,255,255,0.06)",
                    paddingBottom: "20px"
                  }}
                >
                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={chkSelfie}
                      onChange={(e) => setChkSelfie(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--color-brand)", marginTop: "1px" }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, display: "block" }}>1. Confirmação Facial (Selfie vs Documento)</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>A fisionomia na selfie de alta nitidez bate perfeitamente com a identificação do RG/CNH anexado.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={chkDocument}
                      onChange={(e) => setChkDocument(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--color-brand)", marginTop: "1px" }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, display: "block" }}>2. Consistência do RG/CNH & Assinatura</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>Os dados de CPF e Nome coincidem exatamente com o documento físico e a assinatura confere.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={chkBackground}
                      onChange={(e) => setChkBackground(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--color-brand)", marginTop: "1px" }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, display: "block" }}>3. Atestado de Antecedentes Criminais</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>O documento de antecedentes está legível, sem ocorrências ativas e emitido há menos de 90 dias.</span>
                    </div>
                  </label>

                  <label style={{ display: "flex", alignItems: "flex-start", gap: "10px", fontSize: "0.78rem", cursor: "pointer", userSelect: "none" }}>
                    <input
                      type="checkbox"
                      checked={chkAddress}
                      onChange={(e) => setChkAddress(e.target.checked)}
                      style={{ width: "16px", height: "16px", accentColor: "var(--color-brand)", marginTop: "1px" }}
                    />
                    <div>
                      <span style={{ fontWeight: 600, display: "block" }}>4. Localização e Endereço Reserva Raposo</span>
                      <span style={{ color: "var(--text-muted)", fontSize: "0.7rem" }}>O endereço preenchido está completo e consistente com o bloco/apartamento cadastrado.</span>
                    </div>
                  </label>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "0.74rem", color: "var(--text-muted)" }}>
                    Auditor Responsável: <span style={{ color: "var(--color-brand-light)", fontWeight: 600 }}>{user?.email}</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px" }}>
                    <Button
                      variant="danger"
                      onClick={() => handleUpdateStatus("Banido")}
                      disabled={processingAction}
                      style={{ padding: "10px 24px" }}
                    >
                      Rejeitar Candidato
                    </Button>
                    <Button
                      variant="brand"
                      onClick={handleApprove}
                      disabled={!chkSelfie || !chkDocument || !chkBackground || !chkAddress || processingAction}
                      loading={processingAction}
                      style={{ padding: "10px 28px" }}
                    >
                      Aprovar e Ativar Prestador
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Homologated Workspace */
            <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "var(--border-thin)", paddingBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "1.6rem", fontFamily: "Outfit" }}>
                    {selectedCandidate.profiles?.name}
                  </h2>
                  <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
                    Código Profissional: #{selectedCandidate.id.substring(0, 8)}
                  </p>
                </div>
                <Badge variant={selectedCandidate.status === "Aprovado" ? "success" : "danger"}>
                  {selectedCandidate.status}
                </Badge>
              </div>

              {/* Colunas Cadastrais */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "24px" }}>
                
                {/* Perfil & Avatar */}
                <div className="card-glass" style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                  {selectedCandidate.selfie_path ? (
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        backgroundImage: `url('${SUPABASE_URL}/storage/v1/object/public/selfies-temp/${selectedCandidate.selfie_path}')`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        border: "2px solid var(--color-brand-light)",
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "120px",
                        height: "120px",
                        borderRadius: "50%",
                        background: "linear-gradient(135deg, rgba(5, 150, 105, 0.1) 0%, rgba(5, 150, 105, 0.02) 100%)",
                        border: "2px solid var(--color-brand-light)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="var(--color-brand-light)" strokeWidth="1.5" style={{ width: "48px", height: "48px" }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                      </svg>
                    </div>
                  )}
                  <div>
                    <h4 style={{ fontFamily: "Outfit", fontSize: "1.1rem" }}>{selectedCandidate.profiles?.name}</h4>
                    <p style={{ fontSize: "0.74rem", color: "var(--text-muted)", marginTop: "4px" }}>
                      Prestador Ativo Residencial
                    </p>
                  </div>
                </div>

                {/* Ficha Condominial */}
                <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontFamily: "Outfit", fontSize: "0.95rem", borderBottom: "var(--border-thin)", paddingBottom: "8px" }}>
                    Ficha Cadastral Condominial (LGPD Protegido)
                  </h4>
                  
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", fontSize: "0.8rem" }}>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>CPF do Profissional</span>
                      <p style={{ marginTop: "4px", fontWeight: 600 }}>{selectedCandidate.profiles?.cpf}</p>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>WhatsApp de Contato</span>
                      <p style={{ marginTop: "4px", fontWeight: 600 }}>{selectedCandidate.profiles?.phone}</p>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Cidade Base</span>
                      <p style={{ marginTop: "4px", fontWeight: 600 }}>{selectedCandidate.cidade}</p>
                    </div>
                    <div>
                      <span style={{ color: "var(--text-muted)" }}>Bairro</span>
                      <p style={{ marginTop: "4px", fontWeight: 600 }}>{selectedCandidate.bairro}</p>
                    </div>
                  </div>

                  <div>
                    <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>Endereço Completo no Reserva Raposo</span>
                    <p style={{ marginTop: "4px", fontSize: "0.8rem", fontWeight: 600 }}>
                      {selectedCandidate.rua}, {selectedCandidate.num}
                      {selectedCandidate.comp ? ` - ${selectedCandidate.comp}` : ""}
                      {selectedCandidate.bairro ? ` - ${selectedCandidate.bairro}` : ""}
                      {selectedCandidate.cidade ? `, ${selectedCandidate.cidade}` : ""}
                      {selectedCandidate.cep ? ` (CEP: ${selectedCandidate.cep})` : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Liberação de Acesso */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: "24px" }}>
                
                {/* Clipboard Condominial */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <h4 style={{ fontSize: "0.82rem", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    Liberação Rápida de Portaria
                  </h4>
                  <ClipboardCard
                    name={selectedCandidate.profiles?.name}
                    cpf={selectedCandidate.profiles?.cpf}
                    phone={selectedCandidate.profiles?.phone}
                  />
                </div>

                {/* Painel de Gestão e Ocorrências */}
                <div className="card-glass" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <h4 style={{ fontFamily: "Outfit", fontSize: "0.88rem" }}>Controle Operacional Administrativo</h4>
                  <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)" }}>
                    Como administrador, você pode alterar suspensões ou desativar acessos deste prestador a qualquer momento em caso de desalinhamento de conduta.
                  </p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
                    {selectedCandidate.status !== "Aprovado" && (
                      <Button variant="brand" onClick={() => handleUpdateStatus("Aprovado")} disabled={processingAction}>
                        Reativar Profissional
                      </Button>
                    )}
                    {selectedCandidate.status !== "Inativo" && (
                      <Button variant="glass" onClick={() => handleUpdateStatus("Inativo")} disabled={processingAction}>
                        Inativar Acesso
                      </Button>
                    )}
                    {selectedCandidate.status !== "Banido" && (
                      <Button variant="danger" onClick={() => handleUpdateStatus("Banido")} disabled={processingAction}>
                        Banir Credenciais
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Alerta / Sucesso customizado */}
      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title={alertTitle}>
        <p>{alertMsg}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <Button variant="brand" onClick={() => setAlertOpen(false)} style={{ padding: "8px 24px", width: "auto" }}>
            Fechar Alerta
          </Button>
        </div>
      </Modal>

      {/* Modal de Zoom/Visualização de Documentos com Controles Premium */}
      {zoomUrl && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(3, 5, 8, 0.95)",
            zIndex: 1000,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            animation: "fadeIn 0.3s ease",
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Header do visualizador */}
          <div
            style={{
              width: "100%",
              maxWidth: "1000px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
              borderBottom: "var(--border-thin)",
              paddingBottom: "12px",
            }}
          >
            <div>
              <h3 style={{ fontFamily: "Outfit", fontSize: "1.2rem", color: "var(--text-primary)" }}>
                Visualizador de Segurança (Zoom Ampliado)
              </h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "2px" }}>
                Use os botões de controle para zoom ou arraste para inspecionar assinaturas e detalhes.
              </p>
            </div>
            
            {/* Controles de Zoom */}
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                onClick={() => setZoomScale(prev => Math.max(0.5, prev - 0.25))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "var(--border-thin)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "Outfit",
                  transition: "var(--transition-smooth)"
                }}
              >
                🔍- Out
              </button>
              <button
                onClick={() => setZoomScale(1)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "var(--border-thin)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "Outfit",
                  transition: "var(--transition-smooth)"
                }}
              >
                Reset ({Math.round(zoomScale * 100)}%)
              </button>
              <button
                onClick={() => setZoomScale(prev => Math.min(3, prev + 0.25))}
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "var(--border-thin)",
                  backgroundColor: "var(--bg-secondary)",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "Outfit",
                  transition: "var(--transition-smooth)"
                }}
              >
                🔍+ In
              </button>
              <button
                onClick={() => { setZoomUrl(null); setZoomScale(1); }}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  backgroundColor: "var(--color-error)",
                  border: "none",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  fontFamily: "Outfit",
                  fontWeight: 600,
                  transition: "var(--transition-smooth)"
                }}
              >
                Fechar
              </button>
            </div>
          </div>

          {/* Área de Visualização */}
          <div
            style={{
              flex: 1,
              width: "100%",
              maxWidth: "1000px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "auto",
              backgroundColor: "rgba(0,0,0,0.3)",
              borderRadius: "16px",
              border: "var(--border-thin)",
              padding: "20px",
            }}
          >
            {zoomType === "pdf" ? (
              <iframe
                src={zoomUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  border: "none",
                  borderRadius: "8px",
                  transform: `scale(${zoomScale})`,
                  transformOrigin: "center center",
                  transition: "transform 0.2s ease"
                }}
              />
            ) : (
              <img
                src={zoomUrl}
                alt="Zoom do Documento"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  borderRadius: "8px",
                  transform: `scale(${zoomScale})`,
                  transition: "transform 0.2s ease"
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PricingWorkspace({ pricingItems, selectedCategoryId, onUpdatePrice, showCustomAlert }) {
  const items = pricingItems.filter(item => item.category_id === selectedCategoryId);
  const categoryTitle = items[0]?.category_title || "Itens de Serviço";

  // Local state for editing fields to avoid slow typing due to state updates
  const [editValues, setEditValues] = useState({});
  const [savingId, setSavingId] = useState(null);

  // Sync editValues with items whenever selectedCategoryId or items change
  useEffect(() => {
    const initialValues = {};
    items.forEach(item => {
      initialValues[item.id] = {
        price: item.default_price.toString(),
        duration: item.default_duration_hours.toString()
      };
    });
    setEditValues(initialValues);
  }, [selectedCategoryId, pricingItems]);

  const handleChange = (itemId, field, value) => {
    setEditValues(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }));
  };

  const handleSave = async (itemId) => {
    const val = editValues[itemId];
    if (!val) return;
    
    const priceNum = parseFloat(val.price);
    const durationNum = parseFloat(val.duration);

    if (isNaN(priceNum) || priceNum < 0) {
      showCustomAlert("Valor Inválido", "Por favor, insira um preço válido (maior ou igual a 0).");
      return;
    }

    if (isNaN(durationNum) || durationNum <= 0) {
      showCustomAlert("Duração Inválida", "Por favor, insira uma duração estimada maior que 0.");
      return;
    }

    setSavingId(itemId);
    try {
      await onUpdatePrice(itemId, priceNum, durationNum);
    } catch (err) {
      showCustomAlert("Erro ao salvar", err.message || "Não foi possível salvar a alteração.");
    } finally {
      setTimeout(() => setSavingId(null), 800);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", animation: "fadeIn 0.3s ease", height: "100%", overflow: "hidden" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "var(--border-thin)", paddingBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "1.6rem", fontFamily: "Outfit", fontWeight: 700 }}>
            Tabela de Preços e Tempos Estimados
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "4px" }}>
            Categoria Ativa: <span style={{ color: "var(--theme-primary)", fontWeight: 600 }}>{categoryTitle}</span> ({items.length} sub-blocos)
          </p>
        </div>
        <Badge variant="brand">Gestão de Precificação</Badge>
      </div>

      <div style={{ flex: 1, overflowY: "auto", paddingRight: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 8px" }}>
          <thead>
            <tr style={{ color: "var(--text-muted)", fontSize: "0.75rem", textTransform: "uppercase" }}>
              <th style={{ textAlign: "left", padding: "12px 16px" }}>Atividade (Sub-bloco)</th>
              <th style={{ textAlign: "center", padding: "12px 16px", width: "180px" }}>Tempo Estimado (h)</th>
              <th style={{ textAlign: "center", padding: "12px 16px", width: "180px" }}>Preço Padrão (R$)</th>
              <th style={{ textAlign: "center", padding: "12px 16px", width: "120px" }}>Ação</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const currentEdit = editValues[item.id] || { price: "", duration: "" };
              const isSaving = savingId === item.id;
              
              return (
                <tr 
                  key={item.id} 
                  style={{ 
                    backgroundColor: "rgba(255, 255, 255, 0.01)", 
                    borderRadius: "10px",
                    transition: "var(--transition-smooth)"
                  }}
                >
                  <td style={{ padding: "16px", borderTopLeftRadius: "10px", borderBottomLeftRadius: "10px" }}>
                    <span style={{ fontSize: "0.88rem", fontWeight: 600, color: "#fff" }}>{item.name}</span>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={currentEdit.duration}
                      onChange={(e) => handleChange(item.id, "duration", e.target.value)}
                      style={{
                        width: "80px",
                        padding: "8px",
                        textAlign: "center",
                        borderRadius: "6px",
                        border: "1px solid rgba(255,255,255,0.08)",
                        backgroundColor: "rgba(0,0,0,0.2)",
                        color: "#fff",
                        fontSize: "0.85rem"
                      }}
                    />
                  </td>
                  <td style={{ padding: "16px", textAlign: "center" }}>
                    <div style={{ position: "relative", display: "inline-block" }}>
                      <span style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", fontSize: "0.85rem", color: "var(--text-muted)" }}>R$</span>
                      <input
                        type="number"
                        step="5"
                        min="0"
                        value={currentEdit.price}
                        onChange={(e) => handleChange(item.id, "price", e.target.value)}
                        style={{
                          width: "110px",
                          padding: "8px 8px 8px 30px",
                          borderRadius: "6px",
                          border: "1px solid rgba(255,255,255,0.08)",
                          backgroundColor: "rgba(0,0,0,0.2)",
                          color: "#fff",
                          fontSize: "0.85rem"
                        }}
                      />
                    </div>
                  </td>
                  <td style={{ padding: "16px", textAlign: "center", borderTopRightRadius: "10px", borderBottomRightRadius: "10px" }}>
                    <button
                      onClick={() => handleSave(item.id)}
                      disabled={isSaving}
                      style={{
                        padding: "8px 16px",
                        borderRadius: "8px",
                        border: "none",
                        backgroundColor: isSaving ? "rgba(16, 185, 129, 0.15)" : "var(--theme-primary)",
                        color: isSaving ? "var(--theme-primary)" : "#061a14",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        cursor: "pointer",
                        width: "80px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      {isSaving ? "Salvo ✓" : "Salvar"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

