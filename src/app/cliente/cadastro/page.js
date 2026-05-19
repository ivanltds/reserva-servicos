"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  signUpResident,
  submitResidentOnboarding,
  checkRegistrationAvailability,
  supabase,
} from "../../../services/supabase";
import { formatCPF, formatCEP, formatPhone } from "../../../utils/formatters";
import { validateCPF, validateEmail } from "../../../utils/validators";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badge";
import Modal from "../../../components/ui/Modal";

const isCidadePermitida = (cidadeText) => {
  if (!cidadeText) return false;
  const normalized = cidadeText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (
    normalized.includes("sao paulo") ||
    normalized.includes("osasco") ||
    normalized.includes("cotia") ||
    normalized.includes("taboao")
  );
};


export default function ClientHubLanding() {
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
  const [legalModalType, setLegalModalType] = useState(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [checkingStep1, setCheckingStep1] = useState(false);

  const handleCepChange = async (value) => {
    const formatted = formatCEP(value);
    setCep(formatted);
    if (formatted === "05386-300") {
      setBairro("Jardim Raposo Tavares");
      setRua("Av. Engenheiro Heitor Antônio Eiras Garcia");
      setCidade("São Paulo / SP");
      setErrors((p) => ({ ...p, cidade: undefined }));
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
          if (data.localidade && data.uf) {
            const cidadeString = `${data.localidade} / ${data.uf}`;
            setCidade(cidadeString);
            if (isCidadePermitida(cidadeString)) {
              setErrors((p) => ({ ...p, cidade: undefined }));
            } else {
              setErrors((p) => ({ ...p, cidade: "Nossa plataforma atende apenas São Paulo, Osasco, Cotia e Taboão da Serra no momento." }));
            }
          }
        }
      } catch (err) { console.error("Erro ao buscar o CEP:", err); }
    }
  };

  const isStep1Valid = () => (
    name.length > 4 &&
    validateEmail(email) &&
    password.length >= 6 &&
    validateCPF(cpf) &&
    phone.replace(/\D/g, "").length >= 10 &&
    cep.replace(/\D/g, "").length === 8 &&
    bairro.length > 2 &&
    rua.length > 3 &&
    num.length > 0 &&
    cidade.length > 2 &&
    isCidadePermitida(cidade)
  );

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  const submitOnboarding = async () => {
    setSubmitting(true);
    try {
      localStorage.removeItem("resident_session");
      const user = await signUpResident(email, password, name, cpf, phone);
      const onboardingData = { cep: cep.replace(/\D/g, ""), rua, num, comp, bairro, cidade };
      await submitResidentOnboarding(user.id, onboardingData);
      const sessionPayload = { id: user.id, name, status: "Aprovado", timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) };
      localStorage.setItem("resident_session", JSON.stringify(sessionPayload));
      setStep(2);
      setTimeout(() => router.push("/login"), 3500);
    } catch (err) {
      console.error("Erro no cadastro do cliente:", err);
      showCustomAlert("Erro de Cadastro", err?.message || "Houve uma falha ao cadastrar seu perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-container client-theme">
      <div className="onboarding-sidebar themed">
        <div className="sidebar-brand" style={{ fontFamily: "Outfit", fontSize: "1.25rem", fontWeight: 800, letterSpacing: "1px", marginBottom: "40px" }}>
          <span className="sidebar-brand-accent">RESERVA</span> SERVIÇOS
        </div>
        <div className="sidebar-headline" style={{ fontFamily: "Outfit", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.25, color: "#fff", marginBottom: "14px" }}>
          Ajuda de Confiança, bem do seu lado
        </div>
        <p className="sidebar-subtext" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: "40px", fontWeight: 300 }}>
          Encontre profissionais que moram na sua região e já atendem a sua vizinhança.
        </p>
        <div className="sidebar-progress-steps" style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "auto" }}>
          {[
            { num: 1, title: "Identificação e Contato", subtitle: "Dados para agendamento seguro" },
            { num: 2, title: "Conclusão do Acesso", subtitle: "Ativação instantânea de cliente" }
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
            "Chamei um técnico para conserto e em 15 minutos ele bateu na porta. Super prático!"
          </p>
          <span style={{ fontSize: "0.65rem", fontWeight: 600, color: "var(--text-muted)" }}>— Fernando K., Cliente</span>
        </div>
      </div>

      <div className="onboarding-content-area">
        <div className="form-wrapper">
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", animation: "fadeIn 0.3s ease" }}>
              <h2 style={{ fontSize: "1.2rem", fontFamily: "Outfit", marginBottom: "4px" }}>Ficha Cadastral do Cliente</h2>
              <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", marginBottom: "20px", fontWeight: 300 }}>
                Preencha seus dados para habilitar o agendamento no seu endereço.
              </p>
              <div className="fields-container" style={{ overflowY: "auto", maxHeight: "65vh", paddingRight: "8px", marginBottom: "12px" }}>
                <Input label="Nome Completo do Cliente" id="reg-name" placeholder="Ex: Amanda Silva Correia" value={name} onChange={(e) => setName(e.target.value)} />
                <div className="responsive-grid">
                  <Input label="E-mail Pessoal" id="reg-email" type="email" placeholder="seuemail@exemplo.com" value={email} error={errors.email} onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }} />
                  <Input label="Senha de Acesso" id="reg-password" type="password" placeholder="Mínimo 6 dígitos" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
                <div className="responsive-grid">
                  <Input label="CPF do Titular" id="reg-cpf" placeholder="000.000.000-00" value={cpf} error={errors.cpf} onChange={(e) => { setCpf(formatCPF(e.target.value)); if (errors.cpf) setErrors((p) => ({ ...p, cpf: undefined })); }} maxLength={14} />
                  <Input label="WhatsApp de Contato" id="reg-phone" placeholder="(11) 99999-9999" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} maxLength={15} />
                </div>
                <div style={{ borderTop: "1px dashed rgba(255,255,255,0.08)", padding: "12px 0 6px 0", marginTop: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <h4 className="text-theme-brand" style={{ fontSize: "0.75rem", fontWeight: 600 }}>ENDEREÇO NO COMPLEXO</h4>
                </div>
                <div className="responsive-grid">
                  <Input label="CEP do Complexo" id="reg-cep" placeholder="05386-300" value={cep} onChange={(e) => handleCepChange(e.target.value)} maxLength={9} />
                  <Input label="Bairro" id="reg-bairro" placeholder="Bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                </div>
                <Input label="Logradouro (Rua / Avenida)" id="reg-rua" placeholder="Rua ou Avenida" value={rua} onChange={(e) => setRua(e.target.value)} />
                <div className="responsive-grid">
                  <Input label="Número" id="reg-num" placeholder="Número" value={num} onChange={(e) => setNum(e.target.value)} />
                  <Input 
                    label="Cidade / UF" 
                    id="reg-cidade" 
                    placeholder="Cidade" 
                    value={cidade} 
                    error={errors.cidade} 
                    onChange={(e) => {
                      const val = e.target.value;
                      setCidade(val);
                      if (isCidadePermitida(val)) {
                        setErrors((p) => ({ ...p, cidade: undefined }));
                      } else {
                        setErrors((p) => ({ ...p, cidade: "Nossa plataforma atende apenas São Paulo, Osasco, Cotia e Taboão da Serra no momento." }));
                      }
                    }} 
                  />
                </div>
                <Input label="Complemento (Torre, Apto, Bloco)" id="reg-comp" placeholder="Ex: Torre 2, Apto 402" value={comp} onChange={(e) => setComp(e.target.value)} />
                <div className="bg-theme-subtle border-theme-subtle" style={{ borderRadius: "8px", padding: "10px", fontSize: "0.68rem", marginBottom: "12px", display: "flex", gap: "6px" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-theme-brand" style={{ width: "16px", height: "16px", flexShrink: 0 }}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-theme-brand">Dica: Digite o CEP <strong style={{ color: "#fff" }}>05386-300</strong> para preencher automaticamente.</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                <Button variant="danger" onClick={() => router.push('/')} style={{ flex: 0.3 }}>Voltar</Button>
                <Button variant="brand" onClick={async () => {
                  setCheckingStep1(true);
                  setErrors({});
                  try {
                    const res = await checkRegistrationAvailability(email, cpf);
                    const newErrs = {};
                    if (res.email_taken) newErrs.email = "Este e-mail já possui cadastro.";
                    if (res.cpf_taken) newErrs.cpf = "Este CPF já possui cadastro.";
                    if (Object.keys(newErrs).length > 0) setErrors(newErrs);
                    else await submitOnboarding();
                  } catch (err) { await submitOnboarding(); } finally { setCheckingStep1(false); }
                }} loading={submitting || checkingStep1} disabled={!isStep1Valid() || submitting || checkingStep1} style={{ flex: 1 }}>
                  {submitting ? "Finalizando..." : checkingStep1 ? "Validando..." : "Cadastrar Perfil"}
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", animation: "fadeIn 0.3s ease" }}>
              <div className="border-theme-subtle" style={{ width: "80px", height: "80px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px", animation: "radar 2s infinite" }}>
                <svg width="36" height="36" fill="none" stroke="var(--theme-primary)" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <h2 style={{ fontSize: "1.45rem", fontFamily: "Outfit", color: "#fff", marginBottom: "8px" }}>Cadastro de Cliente Concluído!</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "20px" }}>
                Olá, <strong style={{ color: "#fff" }}>{name || "Cliente"}</strong>. Seu acesso foi criado. Você será redirecionado para o login...
              </p>
              <div className="bg-theme-subtle border-theme-subtle" style={{ width: "100%", padding: "16px", borderRadius: "12px", textAlign: "left", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                  <span className="text-theme-brand" style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "currentColor", display: "inline-block", animation: "pulse 1s infinite" }}></span>
                  <span className="text-theme-brand" style={{ fontSize: "0.72rem", fontWeight: 600, textTransform: "uppercase" }}>Redirecionando</span>
                </div>
                <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", lineHeight: 1.45 }}>
                  Use seu e-mail e senha para acessar seu painel e solicitar seu primeiro serviço.
                </p>
              </div>
              <Button variant="brand" onClick={() => router.push("/login")}>IR PARA LOGIN AGORA</Button>
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
