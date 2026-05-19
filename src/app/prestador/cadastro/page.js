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
} from "../../../services/supabase";
import { formatCPF, formatCEP, formatPhone } from "../../../utils/formatters";
import { validateCPF, validateEmail } from "../../../utils/validators";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";


export default function ProviderOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
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
  const [errors, setErrors] = useState({});

  const [selfieFile, setSelfieFile] = useState(null);
  const [rgFile, setRgFile] = useState(null);
  const [atestadoFile, setAtestadoFile] = useState(null);
  const [selfieName, setSelfieName] = useState("");
  const [rgName, setRgName] = useState("");
  const [atestadoName, setAtestadoName] = useState("");

  const [legalModalType, setLegalModalType] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingStep1, setCheckingStep1] = useState(false);

  const handleFileMock = (field, e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (field === "selfie") { setSelfieFile(file); setSelfieName(file.name); }
    if (field === "rg") { setRgFile(file); setRgName(file.name); }
    if (field === "atestado") { setAtestadoFile(file); setAtestadoName(file.name); }
  };

  const handleCepChange = async (value) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    if (formatted === "05386-300") {
      setBairro("Jardim Raposo Tavares");
      setRua("Av. Engenheiro Heitor Antônio Eiras Garcia");
      setCidade("São Paulo / SP");
      return;
    }
    const cleanCep = formatted.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (data && !data.erro) {
          if (data.bairro) setBairro(data.bairro);
          if (data.logradouro) setRua(data.logradouro);
          if (data.localidade && data.uf) setCidade(`${data.localidade} / ${data.uf}`);
        }
      } catch (err) { console.error("Erro ao buscar o CEP:", err); }
    }
  };

  const isStep1Valid = () => (
    name.length > 4 && validateEmail(email) && password.length >= 6 &&
    validateCPF(cpf) && phone.replace(/\D/g, "").length >= 10 &&
    cep.replace(/\D/g, "").length === 8 && bairro.length > 2 &&
    rua.length > 3 && num.length > 0 && cidade.length > 2
  );

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  const submitOnboarding = async () => {
    setSubmitting(true);
    try {
      localStorage.removeItem("candidate_session");
      const user = await signUpProvider(email, password, name, cpf, phone);
      
      let selfiePath = null, rgPath = null, documentPath = null;
      if (selfieFile) selfiePath = await uploadSelfie(user.id, selfieFile);
      if (rgFile) rgPath = await uploadDocument(user.id, rgFile);
      if (atestadoFile) documentPath = await uploadDocument(user.id, atestadoFile);

      const onboardingData = {
        cep: cep.replace(/\D/g, ""), rua, num, comp, bairro, cidade,
        loc: `${rua}, ${num}${comp ? ` - ${comp}` : ""} - ${bairro}, ${cidade} - CEP: ${cep}`,
        selfie_path: selfiePath, rg_path: rgPath, document_path: documentPath,
      };
      await submitProviderOnboarding(user.id, onboardingData);

      const sessionPayload = { id: user.id, name, status: "Pendente", timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
      localStorage.setItem("candidate_session", JSON.stringify(sessionPayload));
      setStep(4);
    } catch (err) {
      console.error("Erro na submissão de cadastro:", err);
      const friendlyMsg = err?.message || err?.cause?.message || "Houve uma falha ao enviar sua documentação. Tente novamente.";
      showCustomAlert("Erro de Cadastro", friendlyMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-container provider-theme">
      <div className="onboarding-sidebar themed">
        <div className="sidebar-brand" style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "1px", marginBottom: "40px" }}>
          <span className="sidebar-brand-accent">RESERVA</span> SERVIÇOS
        </div>
        <div className="sidebar-headline" style={{ fontFamily: "Outfit", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.25, color: "#fff", marginBottom: "14px" }}>
          Trabalhe Perto de Casa, na sua Região
        </div>
        <p className="sidebar-subtext" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "40px", fontWeight: 300 }}>
          Atenda clientes na sua vizinhança sem gastar tempo ou dinheiro com transporte.
        </p>
        <div className="sidebar-progress-steps" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "auto" }}>
          {[
            { num: 1, title: "Dados Cadastrais", subtitle: "Contato e endereço de triagem" },
            { num: 2, title: "Identificação & Biometria", subtitle: "Selfie e documento oficial" },
            { num: 3, title: "Segurança Local", subtitle: "Antecedentes e homologação" },
          ].map(s => (
            <div key={s.num} className={`side-step ${step >= s.num ? "active" : ""}`} style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              <span className="side-step-indicator" style={{ width: "32px", height: "32px", borderRadius: "50%", border: "2px solid var(--bg-secondary)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 600, fontSize: "0.85rem" }}>{step > s.num ? '✓' : s.num}</span>
              <div className="side-step-text">
                <h5 style={{ fontFamily: "Outfit", fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{s.title}</h5>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "2px" }}>{s.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="sidebar-testimonial" style={{ marginTop: "20px", padding: "16px", borderRadius: "12px" }}>
          <div style={{ fontSize: "0.8rem", marginBottom: "6px" }}>⭐⭐⭐⭐⭐</div>
          <p style={{ fontSize: "0.72rem", fontStyle: "italic", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "6px" }}>
            "Faço diárias perto de casa, sem custo de transporte, e recebo livre de taxas em minutos!"
          </p>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)" }}>— Maria S., Diarista Parceira</span>
        </div>
      </div>

      <div className="onboarding-content-area">
        <div className="form-wrapper">
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Sua Renda em Primeiro Lugar</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: 300 }}>
                Preencha seus dados para habilitar seus agendamentos na sua região.
              </p>
              <div className="fields-container" style={{ overflowY: "auto", maxHeight: "65vh", paddingRight: "8px", marginBottom: "12px" }}>
                <Input label="Nome Completo" id="reg-name" placeholder="Ex: Carlos Santos" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="responsive-grid">
                  <Input label="E-mail de Acesso" id="reg-email" type="email" placeholder="seuemail@exemplo.com" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); if(errors.email) setErrors(p => ({...p, email: undefined})); }} />
                  <Input label="Senha de Acesso" id="reg-password" type="password" placeholder="Mínimo 6 dígitos" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="responsive-grid">
                  <Input label="CPF do Profissional" id="reg-cpf" placeholder="000.000.000-00" value={cpf} error={errors.cpf} onChange={(e) => { setCpf(formatCPF(e.target.value)); if(errors.cpf) setErrors(p => ({...p, cpf: undefined})); }} maxLength={14} />
                  <Input label="WhatsApp de Contato" id="reg-phone" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15} />
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.08)", padding: "12px 0 6px 0", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 className="text-theme-brand" style={{ fontSize: "0.75rem", fontWeight: 600 }}>ENDEREÇO HIPERLOCAL</h4>
                </div>
                <div className="responsive-grid">
                  <Input label="CEP Residencial" id="reg-cep" placeholder="00000-000" value={cep} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} />
                  <Input label="Bairro" id="reg-bairro" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <Input label="Logradouro (Rua / Avenida)" id="reg-rua" placeholder="Rua ou Avenida" value={rua} onChange={(e) => setRua(e.target.value)} />
                <div className="responsive-grid">
                  <Input label="Número" id="reg-num" placeholder="Número" value={num} onChange={(e) => setNum(e.target.value)} />
                  <Input label="Cidade / UF" id="reg-cidade" placeholder="Cidade" value={cidade} onChange={(e) => setCidade(e.target.value)} />
                </div>
                <Input label="Complemento (Torre, Apto, Bloco)" id="reg-comp" placeholder="Ex: Torre 4, Apto 112" value={comp} onChange={(e) => setComp(e.target.value)} />
                <div className="bg-theme-subtle border-theme-subtle" style={{ borderRadius: "8px", padding: "10px", fontSize: "0.68rem", marginBottom: "12px", display: "flex", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-theme-brand" style={{ width: "16px", height: "16px", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-theme-brand">Dica: Digite o CEP <strong style={{ color: "#fff" }}>05386-300</strong> para preencher o endereço automaticamente.</span>
                </div>
              </div>
              <Button
                variant="brand"
                onClick={async () => {
                  setCheckingStep1(true);
                  setErrors({});
                  try {
                    const res = await checkRegistrationAvailability(email, cpf);
                    const newErrs = {};
                    if (res.email_taken) newErrs.email = "Este e-mail já possui cadastro.";
                    if (res.cpf_taken) newErrs.cpf = "Este CPF já possui cadastro.";
                    if (Object.keys(newErrs).length > 0) setErrors(newErrs);
                    else setStep(2);
                  } catch (err) { setStep(2); } finally { setCheckingStep1(false); }
                }}
                loading={checkingStep1}
                disabled={!isStep1Valid() || checkingStep1}
                style={{ marginTop: "16px" }}
              >
                {checkingStep1 ? "Verificando..." : "Continuar para Identidade"}
              </Button>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Biometria & Identidade</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: 300 }}>
                Carregue uma selfie nítida e um documento oficial para controle de portaria.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px" }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>1. Selfie Facial Nítida</label>
                  <label className="upload-area"><input type="file" accept="image/*" onChange={(e) => handleFileMock("selfie", e)} style={{ display: "none" }} /><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 0 1 2-2h.93a2 2 0 0 0 1.664-.89l.812-1.22A2 2 0 0 1 10.07 4h3.86a2 2 0 0 1 1.664.89l.812 1.22A2 2 0 0 0 18.07 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"></path></svg><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{selfieName || "Carregar ou Tirar Selfie"}</span><span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Selfie correspondente ao documento</span></label>
                </div>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>2. CNH ou RG (Frente e Verso)</label>
                  <label className="upload-area"><input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileMock("rg", e)} style={{ display: "none" }} /><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16m-2-2l1.586-1.586a2 2 0 0 1 2.828 0L20 14m-6-6h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"></path></svg><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{rgName || "Carregar RG ou CNH"}</span><span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Foto ou PDF nítido do documento</span></label>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="danger" onClick={() => setStep(1)} style={{ flex: 0.3 }}>Voltar</Button>
                <Button variant="brand" onClick={() => setStep(3)} disabled={!selfieFile || !rgFile} style={{ flex: 1 }}>Continuar</Button>
              </div>
            </div>
          )}

          {step === 3 && (
             <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Segurança Condominial</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "16px", fontWeight: 300 }}>O Atestado de Antecedentes é exigido para liberação de portaria.</p>
              <div style={{ backgroundColor: "rgba(255,255,255,0.01)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px", marginBottom: "16px", textAlign: "center" }}>
                <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", marginBottom: "8px", lineHeight: "1.4" }}><strong>Não tem o atestado?</strong> Emita-o gratuitamente pela Polícia Civil de SP:</p>
                <a href="https://www2.ssp.sp.gov.br/aacweb/carrega-formulario" target="_blank" rel="noreferrer" className="btn btn-accent" style={{width: 'auto', padding: '8px 16px', fontSize: '0.72rem', textDecoration: 'none'}}>EMITIR ATESTADO DE GRAÇA</a>
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px", display: "block" }}>Atestado Criminal (Foto ou PDF)</label>
                <label className="upload-area"><input type="file" accept="image/*,application/pdf" onChange={(e) => handleFileMock("atestado", e)} style={{ display: "none" }} /><svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2z"></path></svg><span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{atestadoName ? `Atestado: ${atestadoName}` : "Carregar Atestado"}</span><span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>Emitido nos últimos 90 dias</span></label>
              </div>
              <div className="bg-theme-subtle border-theme-subtle" style={{ display: "flex", gap: "8px", padding: "10px", borderRadius: "8px", marginBottom: "20px" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-theme-brand" style={{ width: "16px", height: "16px", flexShrink: 0, marginTop: "2px" }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <p className="text-theme-brand" style={{ fontSize: "0.65rem", lineHeight: 1.3 }}><strong>Travas LGPD:</strong> Seus arquivos sensíveis (CNH/RG, atestado) são <strong>apagados de forma definitiva</strong> após a conclusão da triagem.</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <Button variant="danger" onClick={() => setStep(2)} style={{ flex: 0.3 }}>Voltar</Button>
                <Button variant="brand" onClick={submitOnboarding} loading={submitting} disabled={!atestadoFile} style={{ flex: 1 }}>Finalizar e Enviar</Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeIn 0.3s ease" }}>
              <div className="border-theme-subtle" style={{ width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", animation: "radar 2s infinite" }}>
                <svg width="36" height="36" fill="none" stroke="var(--theme-primary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 style={{ fontSize: "1.45rem", fontFamily: "Outfit", color: "#fff", marginBottom: "8px" }}>Cadastro Recebido!</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
                Olá, <strong style={{ color: "#fff" }}>{name || "Profissional"}</strong>. Seus documentos estão na fila de auditoria e conferência.
              </p>
              <div className="bg-theme-subtle border-theme-subtle" style={{ width: "100%", padding: "16px", borderRadius: "12px", textAlign: "left", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span className="text-theme-brand" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "currentColor", display: "inline-block", animation: "pulse 1s infinite" }}></span>
                  <span className="text-theme-brand" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>Triagem Ativa</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  O prazo para aprovação é de <strong>até 48 horas úteis</strong>. Nossa média de liberação é de <strong>1 hora</strong>.
                </p>
              </div>
              <Button variant="brand" onClick={() => router.push("/")}>Voltar para a Página Inicial</Button>
            </div>
          )}
        </div>
      </div>
      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title={alertTitle}>
        <p>{alertMsg}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <Button variant="brand" onClick={() => setAlertOpen(false)} style={{ padding: "8px 24px", width: "auto" }}>Fechar</Button>
        </div>
      </Modal>
    </div>
  );
}
