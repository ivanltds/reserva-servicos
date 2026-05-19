"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase, fetchServiceItems } from "../../../services/supabase";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

// Constantes de habilidades padrões estruturadas com imagens e sub-blocos
const SKILL_CATEGORIES = [
  {
    id: "limpeza_domestica",
    title: "Limpeza Doméstica",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Limpeza Geral Padrão",
      "Limpeza Profunda / Faxina Pesada",
      "Passar Roupas",
      "Lavar Roupas",
      "Limpeza de Vidros e Janelas",
      "Organização de Armários e Closets",
      "Limpeza de Geladeira e Forno Interno",
      "Limpeza de Sacadas e Varandas",
      "Arrumação de Camas e Troca de Emxoval",
      "Limpeza de Tapetes e Estofados",
      "Limpeza Pós-Mudança / Pós-Obra",
      "Limpeza de Paredes e Azulejos de Cozinha/Área"
    ]
  },
  {
    id: "pequenos_reparos_eletrica",
    title: "Pequenos Reparos (Elétrica)",
    image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Trocar Resistência de Chuveiro",
      "Trocar Tomada ou Interruptor",
      "Instalar Luminária ou Lustre",
      "Instalar Ventilador de Teto",
      "Trocar Disjuntor no Quadro",
      "Instalar Campainha",
      "Trocar Reator de Lâmpada",
      "Instalar Fita LED",
      "Passar Cabo de Rede/Telefone",
      "Instalar Suporte de TV com Passagem de Cabos",
      "Reparo em Fiação Rompida de Eletrodoméstico",
      "Instalar Sensor de Presença"
    ]
  },
  {
    id: "pequenos_reparos_hidraulica",
    title: "Pequenos Reparos (Hidráulica)",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Consertar Torneira Pingando",
      "Reparo em Válvula Hydra ou Caixa Acoplada",
      "Desentupir Pia de Cozinha ou Banheiro",
      "Desentupir Vaso Sanitário",
      "Trocar Sifão de Pia",
      "Trocar Flexível de Ducha ou Torneira",
      "Instalar Filtro de Água",
      "Instalar Máquina de Lavar Roupa/Louça",
      "Trocar Reparo de Registro",
      "Instalar Chuveiro Novo (Instalação Hidráulica)",
      "Eliminar Vazamento em Conexão Exposta",
      "Limpeza de Caixa de Gordura"
    ]
  },
  {
    id: "pequenos_reparos_pintura",
    title: "Pequenos Reparos (Pintura)",
    image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Pintura de Parede Única (Destaque)",
      "Pintura de Cômodo Completo",
      "Aplicação de Textura ou Grafiato",
      "Pequenos Retoques de Massa Corrida",
      "Verniz ou Pintura em Portas e Portais",
      "Pintura de Grelhas e Grades Metálicas",
      "Tratamento e Pintura Anti-mofo",
      "Lixamento e Preparação de Paredes",
      "Pintura de Teto",
      "Pintura de Rodapés e Guarnições",
      "Pintura de Portão Externo",
      "Pintura de Azulejos (Tinta Epóxi)"
    ]
  },
  {
    id: "pequenos_reparos_alvenaria",
    title: "Pequenos Reparos (Alvenaria)",
    image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Fixação de Prateleiras e Nichos",
      "Instalar Suporte de TV em Parede de Alvenaria",
      "Troca de Azulejo ou Cerâmica Quebrada",
      "Rejuntamento de Pisos e Azulejos",
      "Pequeno Reparo de Reboco ou Reboco Caído",
      "Fixação de Acessórios de Banheiro",
      "Instalar Varal de Teto ou Parede",
      "Instalação de Espelhos Grandes na Parede",
      "Chumbamento de Caixa de Luz ou Suporte",
      "Fechamento de Furos e Rasgos de Tubulação",
      "Instalação de Ralo Grelha ou Ralo Linear",
      "Assentamento de Soleira ou Pingadeira"
    ]
  },
  {
    id: "montador_de_moveis",
    title: "Montador de Móveis e Instalações",
    image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Montagem de Guarda-Roupa Solteiro",
      "Montagem de Guarda-Roupa Casal Grande",
      "Montagem de Cama Casal/Solteiro",
      "Montagem de Mesa de Jantar com Cadeiras",
      "Montagem de Painel de TV ou Rack",
      "Montagem de Escrivaninha ou Cadeira de Escritório",
      "Instalação de Cortinas e Persianas",
      "Fixação de Quadros, Espelhos e Varões",
      "Montagem de Armário de Cozinha Aéreo",
      "Montagem de Comoda ou Criado-Mudo",
      "Reparo em Portas de Armário (Dobradiças/Regulagem)",
      "Desmontagem de Móveis para Mudança"
    ]
  },
  {
    id: "cuidado_de_animais",
    title: "Cuidado de Animais (Pet Care)",
    image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Passeio com Cão Pequeno / Médio (Dog Walking)",
      "Passeio com Cão Grande / Porte Gigante",
      "Hospedagem Domiciliar de Cão (Diária)",
      "Hospedagem Domiciliar de Gato (Diária)",
      "Pet Sitting (Visita de 1 hora para Alimentar e Limpar)",
      "Banho Domiciliar em Cão Pequeno",
      "Escovação e Higiene Oral Domiciliar",
      "Administração de Medicamentos / Curativos",
      "Transporte de Pet para Veterinário ou Petshop",
      "Adestramento Básico / Comportamento (Sessão)",
      "Corte de Unhas e Limpeza de Ouvidos de Pet",
      "Hospedagem de Pet por Turno / Day Care (Até 12h)"
    ]
  },
  {
    id: "cozinha_gastronomia",
    title: "Cozinha e Gastronomia",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Preparo de Almoço Familiar Padrão (Até 4 pessoas)",
      "Preparo de Marmitas Saudáveis para a Semana (10 potes)",
      "Serviço de Cozinheiro para Jantar Especial",
      "Preparo de Salgadinhos para Festas (Cento)",
      "Confeitaria: Bolo de Aniversário Simples (2kg)",
      "Preparo de Sopas e Caldos de Inverno",
      "Cozinha Vegetariana / Vegana (Preparo Completo)",
      "Organização e Higienização da Despensa e Geladeira",
      "Preparo de Café da Manhã Premium ou Brunch",
      "Preparo de Docinhos Tradicionais (Cento)",
      "Auxiliar de Cozinha para Eventos (Limpeza e Apoio)",
      "Preparo de Petiscos e Tábua de Frios Gourmet"
    ]
  },
  {
    id: "telhados_calhas",
    title: "Telhados e Calhas",
    image: "https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Limpeza de Calhas e Condutores",
      "Substituição de Telhas Quebradas (Cerâmica)",
      "Aplicação de Manta Asfáltica Autoadesiva",
      "Impermeabilização com Manta Líquida",
      "Desobstrução de Condutores de Água Pluvial",
      "Conserto de Rufo ou Pingadeira Metálica",
      "Instalação de Tela Protetora Contra Folhas",
      "Pintura Impermeabilizante de Telhado",
      "Vedação de Parafusos em Telhas de Fibrocimento/Zinco",
      "Fixação de Calha Desprendida",
      "Inspeção Completa de Infiltração em Forros/Telhados",
      "Instalação de Calha Nova (Metro Linear)"
    ]
  },
  {
    id: "apoio_mudancas",
    title: "Apoio em Mudanças (Carga/Descarga)",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=400&auto=format&fit=crop",
    subBlocks: [
      "Ajudante de Carga e Descarga (Até 4h)",
      "Ajudante de Carga e Descarga (Período de 8h)",
      "Embalagem de Louças, Livros e Objetos Frágeis",
      "Montagem e Fechamento de Caixas (Kit Mudança)",
      "Transporte Interno de Móveis Pesados",
      "Carregamento de Entulho ou Sobras (Sacos)",
      "Organização de Caixas Pós-Mudança nos Cômodos",
      "Proteção de Móveis com Plástico Bolha",
      "Apoio no Içamento Manual Simples",
      "Descarte Ecológico de Móveis Velhos",
      "Ajudante para Pequeno Carreto / Transporte",
      "Desmontagem e Proteção de Eletrodomésticos para Transporte"
    ]
  }
];

// Dados simulados padrão atualizados para os tipos de sub-blocos corretos
const DEFAULT_MOCK_SERVICES = [
  {
    id: "mock-srv-1",
    service_type: "Limpeza Geral Padrão",
    neighborhood: "Jardim Raposo Tavares",
    address: "Av. Eng. Heitor Antônio Eiras Garcia, 4500 - Bloco B, Apto 124",
    scheduled_at: "Amanhã às 09:00",
    duration_hours: 4,
    value: 120.00,
    status: "Solicitado (Pagamento aprovado)",
    notes: "Limpeza padrão de apartamento de 2 quartos. Possuímos aspirador e produtos."
  },
  {
    id: "mock-srv-2",
    service_type: "Trocar Resistência de Chuveiro",
    neighborhood: "Reserva Raposo - Bloco D",
    address: "Rua Cândido Portinari, 120 - Bloco D, Apto 42",
    scheduled_at: "Quinta-feira às 14:00",
    duration_hours: 2,
    value: 85.00,
    status: "Solicitado (Pagamento aprovado)",
    notes: "Instalação de chuveiro novo e troca de resistência."
  },
  {
    id: "mock-srv-3",
    service_type: "Passar Roupas",
    neighborhood: "Reserva Raposo - Bloco A",
    address: "Av. Eng. Heitor Antônio Eiras Garcia, 4200 - Bloco A, Apto 1801",
    scheduled_at: "Sábado às 10:00",
    duration_hours: 3,
    value: 70.00,
    status: "Solicitado (Pagamento aprovado)",
    notes: "Aproximadamente duas cestas de roupas simples para passar."
  },
  {
    id: "mock-srv-4",
    service_type: "Pintura de Parede Única (Destaque)",
    neighborhood: "Reserva Raposo - Bloco B",
    address: "Av. Eng. Heitor Antônio Eiras Garcia, 4300 - Bloco B, Apto 502",
    scheduled_at: "Segunda-feira às 08:30",
    duration_hours: 6,
    value: 180.00,
    status: "Solicitado (Pagamento aprovado)",
    notes: "Pintura simples de uma parede de destaque na sala."
  },
  {
    id: "mock-srv-5",
    service_type: "Fixação de Prateleiras e Nichos",
    neighborhood: "Reserva Raposo - Bloco C",
    address: "Rua Cândido Portinari, 150 - Bloco C, Apto 904",
    scheduled_at: "Terça-feira às 10:00",
    duration_hours: 2,
    value: 90.00,
    status: "Solicitado (Pagamento aprovado)",
    notes: "Fixar 3 prateleiras de MDF na parede da sala."
  }
];

export default function PrestadorPainelPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, signOut } = useAuth();

  // Estados do prestador
  const [providerDetails, setProviderDetails] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [pixType, setPixType] = useState("cpf");
  const [pixKey, setPixKey] = useState("");
  const [isOnline, setIsOnline] = useState(true);

  // Estados dos serviços
  const [availableServices, setAvailableServices] = useState([]);
  const [activeService, setActiveService] = useState(null);
  const [serviceHistory, setServiceHistory] = useState([]);

  // Modais e UI
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [savingSkills, setSavingSkills] = useState(false);
  const [savingPix, setSavingPix] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");
  const [isDbMode, setIsDbMode] = useState(false); // Flag para indicar se estamos operando no banco ou em mock
  const [expandedCategoryId, setExpandedCategoryId] = useState(null); // ID da categoria expandida de pequenos reparos
  const [skillCategories, setSkillCategories] = useState(SKILL_CATEGORIES);

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  // Carrega configurações iniciais
  useEffect(() => {
    if (!authLoading && user) {
      loadProviderProfile();
      loadDbSkillCategories();
    }
  }, [user, authLoading]);

  const loadDbSkillCategories = async () => {
    const dbItems = await fetchServiceItems();
    if (dbItems && dbItems.length > 0) {
      const map = {};
      dbItems.forEach(item => {
        if (!map[item.category_id]) {
          map[item.category_id] = {
            id: item.category_id,
            title: item.category_title,
            image: item.category_image || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
            subBlocks: []
          };
        }
        map[item.category_id].subBlocks.push(item.name);
      });
      if (map["apoio_mudancas"]) {
        map["apoio_mudancas"].image = "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop";
      }
      setSkillCategories(Object.values(map));
    }
  };

  // Busca detalhes do prestador na tabela service_providers
  const loadProviderProfile = async () => {
    setLoadingDetails(true);
    try {
      const { data, error } = await supabase
        .from("service_providers")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setProviderDetails(data);
        setSelectedSkills(data.skills || []);
        if (data.pix_key_type) setPixType(data.pix_key_type);
        if (data.pix_key) setPixKey(data.pix_key);
        setIsOnline(data.status === "Aprovado");
        setIsDbMode(true);
        loadServices(data.skills || []);
      } else {
        // Fallback para mock local
        setIsDbMode(false);
        initMockData();
      }
    } catch (err) {
      console.warn("Usando modo de simulação (Mock). Colunas ou tabelas pendentes de migração:", err.message);
      setIsDbMode(false);
      initMockData();
    } finally {
      setLoadingDetails(false);
    }
  };

  // Inicializa dados mockados
  const initMockData = () => {
    // Tenta carregar do localStorage para manter persistência local
    const cachedSkills = localStorage.getItem(`provider_skills_${user?.id}`);
    const cachedPixType = localStorage.getItem(`provider_pix_type_${user?.id}`);
    const cachedPixKey = localStorage.getItem(`provider_pix_key_${user?.id}`);
    const cachedActive = localStorage.getItem(`provider_active_srv_${user?.id}`);
    const cachedHistory = localStorage.getItem(`provider_history_${user?.id}`);

    const skills = cachedSkills ? JSON.parse(cachedSkills) : ["Limpeza Residencial"];
    setSelectedSkills(skills);
    if (cachedPixType) setPixType(cachedPixType);
    if (cachedPixKey) setPixKey(cachedPixKey);
    
    if (cachedActive) {
      setActiveService(JSON.parse(cachedActive));
    }
    if (cachedHistory) {
      setServiceHistory(JSON.parse(cachedHistory));
    }

    setProviderDetails({
      status: "Aprovado",
      cep: "05386-300",
      rua: "Av. Engenheiro Heitor Antônio Eiras Garcia",
      num: "4500",
      bairro: "Jardim Raposo Tavares",
      cidade: "São Paulo"
    });

    filterMockServices(skills);
  };

  // Filtra serviços mockados baseados nas habilidades selecionadas
  const filterMockServices = (skillsList) => {
    const list = DEFAULT_MOCK_SERVICES.filter(srv => skillsList.includes(srv.service_type));
    setAvailableServices(list);
  };

  // Carrega solicitações de serviços (banco ou local)
  const loadServices = async (skillsList) => {
    if (!isDbMode) {
      filterMockServices(skillsList);
      return;
    }

    try {
      // Busca solicitações criadas
      const { data: requests, error } = await supabase
        .from("service_requests")
        .select(`
          *,
          client:client_id (
            name,
            phone
          )
        `)
        .is("provider_id", null)
        .eq("status", "Solicitado (Pagamento aprovado)");

      if (error) throw error;

      // Filtra por habilidades no client-side
      const filtered = requests.filter(req => skillsList.includes(req.service_type));
      setAvailableServices(filtered);

      // Busca também se o prestador tem algum serviço ativo alocado a ele
      const { data: active, error: activeErr } = await supabase
        .from("service_requests")
        .select(`
          *,
          client:client_id (
            name,
            phone
          )
        `)
        .eq("provider_id", user.id)
        .not("status", "in", '("serviço finalizado", "serviço executado (aprovado)", "Serviço finalizado")')
        .maybeSingle();

      if (!activeErr && active) {
        setActiveService(active);
      }
    } catch (err) {
      console.error("Erro ao carregar serviços do banco:", err);
    }
  };

  // Salvar Habilidades
  const handleSaveSkills = async () => {
    setSavingSkills(true);
    try {
      if (isDbMode) {
        const { error } = await supabase
          .from("service_providers")
          .update({ skills: selectedSkills })
          .eq("id", user.id);

        if (error) throw error;
        loadServices(selectedSkills);
      } else {
        localStorage.setItem(`provider_skills_${user.id}`, JSON.stringify(selectedSkills));
        filterMockServices(selectedSkills);
      }
      showCustomAlert("Habilidades Atualizadas", "Suas categorias de atuação foram salvas com sucesso!");
    } catch (err) {
      showCustomAlert("Erro ao salvar", err.message);
    } finally {
      setSavingSkills(false);
    }
  };

  // Salvar Chave PIX
  const handleSavePix = async () => {
    if (!pixKey.trim()) {
      showCustomAlert("Campo Obrigatório", "Por favor, digite a sua chave PIX.");
      return;
    }
    setSavingPix(true);
    try {
      if (isDbMode) {
        const { error } = await supabase
          .from("service_providers")
          .update({
            pix_key_type: pixType,
            pix_key: pixKey.trim()
          })
          .eq("id", user.id);

        if (error) throw error;
      } else {
        localStorage.setItem(`provider_pix_type_${user.id}`, pixType);
        localStorage.setItem(`provider_pix_key_${user.id}`, pixKey.trim());
      }
      showCustomAlert("PIX Configurado", "Sua chave de recebimento foi atualizada!");
    } catch (err) {
      showCustomAlert("Erro ao salvar", err.message);
    } finally {
      setSavingPix(false);
    }
  };

  // Alterar Status de Disponibilidade
  const handleToggleOnline = async () => {
    const nextStatus = isOnline ? "Inativo" : "Aprovado";
    try {
      if (isDbMode) {
        const { error } = await supabase
          .from("service_providers")
          .update({ status: nextStatus })
          .eq("id", user.id);

        if (error) throw error;
      }
      setIsOnline(!isOnline);
      showCustomAlert("Status Alterado", `Você agora está ${!isOnline ? "ONLINE" : "OFFLINE"}.`);
    } catch (err) {
      showCustomAlert("Erro ao alterar status", err.message);
    }
  };

  // Toggle de seleção de habilidades individual
  const handleToggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Manifestar interesse / Selecionar serviço
  const handleSelectService = async (service) => {
    if (!pixKey) {
      showCustomAlert("Atenção", "Você precisa cadastrar sua chave PIX antes de aceitar serviços.");
      return;
    }

    try {
      if (isDbMode) {
        const { error } = await supabase
          .from("service_requests")
          .update({
            provider_id: user.id,
            status: "aguardando prestador (selecionado mas pendente confirmação pro gestor)"
          })
          .eq("id", service.id);

        if (error) throw error;
        loadServices(selectedSkills);
      } else {
        const updated = {
          ...service,
          status: "aguardando prestador (selecionado mas pendente confirmação pro gestor)"
        };
        setActiveService(updated);
        localStorage.setItem(`provider_active_srv_${user.id}`, JSON.stringify(updated));
      }
      showCustomAlert("Interesse Manifestado", "Solicitação enviada ao gestor. Aguardando confirmação.");
    } catch (err) {
      showCustomAlert("Erro ao selecionar", err.message);
    }
  };

  // Simulação de Aprovação do Gestor (apenas no modo simulado para testar fluxo)
  const handleSimulateManagerApproval = () => {
    if (!activeService) return;
    const updated = {
      ...activeService,
      status: "agendado (prestador a caminho)"
    };
    setActiveService(updated);
    localStorage.setItem(`provider_active_srv_${user.id}`, JSON.stringify(updated));
    showCustomAlert("Simulação", "Gestor aprovou! O endereço e horário do serviço agora estão revelados.");
  };

  // Ações do Serviço Ativo
  const handleUpdateActiveStatus = (nextStatus) => {
    if (!activeService) return;
    const updated = {
      ...activeService,
      status: nextStatus
    };
    setActiveService(updated);

    if (nextStatus === "serviço finalizado" || nextStatus === "Serviço finalizado") {
      // Move para histórico
      const newHistory = [
        { ...updated, completed_at: new Date().toLocaleDateString("pt-BR") },
        ...serviceHistory
      ];
      setServiceHistory(newHistory);
      setActiveService(null);
      localStorage.removeItem(`provider_active_srv_${user.id}`);
      localStorage.setItem(`provider_history_${user.id}`, JSON.stringify(newHistory));
      filterMockServices(selectedSkills);
      showCustomAlert("Serviço Concluído", "Parabéns! Serviço finalizado e enviado para repasse.");
    } else {
      localStorage.setItem(`provider_active_srv_${user.id}`, JSON.stringify(updated));
    }
  };

  if (authLoading || loadingDetails) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)"
      }}>
        <div style={{ color: "var(--text-secondary)", fontFamily: "Outfit", fontSize: "1.2rem" }}>
          Carregando painel operacional...
        </div>
      </div>
    );
  }

  const isPending = providerDetails?.status === "Pendente";

  return (
    <div className="provider-theme" style={{ minHeight: "100vh", backgroundColor: "var(--bg-primary)", color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}>
      
      {/* Navbar Superior */}
      <nav style={{
        height: "72px",
        backgroundColor: "rgba(15, 19, 31, 0.4)",
        backdropFilter: "blur(12px)",
        borderBottom: "var(--border-thin)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.5px" }}>
          <span style={{ color: "var(--theme-primary)" }}>RESERVA</span> SERVIÇOS
        </div>
        
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "right", display: "none", md: "block" }}>
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", display: "block" }}>Olá, {profile?.name?.split(" ")[0]}</span>
            <span style={{ fontSize: "0.68rem", color: "var(--theme-primary)" }}>
              {isOnline ? "🟢 Disponível" : "🔴 Indisponível"}
            </span>
          </div>
          <button 
            onClick={signOut}
            style={{ 
              background: "rgba(239, 68, 68, 0.08)", 
              border: "1px solid rgba(239, 68, 68, 0.2)", 
              color: "var(--color-error)", 
              padding: "6px 12px", 
              borderRadius: "8px", 
              fontSize: "0.75rem", 
              cursor: "pointer",
              fontFamily: "Outfit",
              transition: "var(--transition-smooth)"
            }}
          >
            Sair
          </button>
        </div>
      </nav>

      {/* Grid Principal */}
      <main style={{ padding: "32px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Banner de Status de Triagem se Pendente */}
        {isPending && (
          <div style={{
            background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1) 0%, rgba(245, 158, 11, 0.02) 100%)",
            border: "1px solid rgba(245, 158, 11, 0.2)",
            borderRadius: "20px",
            padding: "24px",
            marginBottom: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "var(--theme-primary)", display: "inline-block", animation: "pulse 1s infinite" }}></span>
              <h3 style={{ fontSize: "1.1rem", fontFamily: "Outfit", fontWeight: 700, color: "var(--theme-primary)" }}>Cadastro em Análise Criminológica</h3>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
              Sua conta ainda está na fila de homologação condominial do Reserva Raposo. Você pode configurar suas habilidades e dados de pagamento abaixo, mas a lista de serviços só será liberada após aprovação.
            </p>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", lg: "340px 1fr", gap: "32px" }}>
          
          {/* Coluna Esquerda: Configurações do Profissional */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Toggle de Disponibilidade */}
            <div className="card-glass" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontFamily: "Outfit", marginBottom: "16px" }}>Minha Disponibilidade</h3>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                  {isOnline ? "Online (Recebendo chamados)" : "Offline (Inativo)"}
                </span>
                <button
                  onClick={handleToggleOnline}
                  disabled={isPending}
                  style={{
                    width: "50px",
                    height: "26px",
                    borderRadius: "15px",
                    backgroundColor: isOnline ? "var(--theme-primary)" : "var(--bg-tertiary)",
                    border: "none",
                    cursor: isPending ? "not-allowed" : "pointer",
                    position: "relative",
                    transition: "var(--transition-smooth)",
                    opacity: isPending ? 0.5 : 1
                  }}
                >
                  <div style={{
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    backgroundColor: "#07090e",
                    position: "absolute",
                    top: "3px",
                    left: isOnline ? "27px" : "3px",
                    transition: "var(--transition-smooth)"
                  }} />
                </button>
              </div>
            </div>

            {/* Habilidades configuradas no painel da direita */}

            {/* Configuração do PIX */}
            <div className="card-glass" style={{ padding: "24px" }}>
              <h3 style={{ fontSize: "1rem", fontFamily: "Outfit", marginBottom: "8px" }}>Chave PIX de Recebimento</h3>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "16px" }}>
                Onde você quer receber seus repasses líquidos imediatos.
              </p>

              <div className="input-group" style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "0.7rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>TIPO DE CHAVE</label>
                <select 
                  value={pixType} 
                  onChange={(e) => setPixType(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "var(--bg-tertiary)",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "0.85rem",
                    outline: "none"
                  }}
                >
                  <option value="cpf">CPF</option>
                  <option value="phone">Celular</option>
                  <option value="email">E-mail</option>
                  <option value="random">Chave Aleatória</option>
                </select>
              </div>

              <Input 
                id="pix-key-val"
                placeholder={
                  pixType === "cpf" ? "000.000.000-00" :
                  pixType === "phone" ? "(11) 99999-9999" :
                  pixType === "email" ? "exemplo@email.com" :
                  "Digite sua chave PIX"
                }
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                style={{ marginBottom: "20px" }}
              />

              <Button 
                onClick={handleSavePix} 
                loading={savingPix} 
                variant="brand" 
                style={{ width: "100%", padding: "10px", fontSize: "0.85rem", backgroundColor: "var(--theme-primary)", color: "#061a14" }}
              >
                Salvar Chave PIX
              </Button>
            </div>

          </div>

          {/* Coluna Direita: Work Space (Serviço Ativo ou Disponíveis) */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* Bloco de Habilidades Visual com Fotos e Sub-blocos */}
            <div className="card-glass" style={{ padding: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontFamily: "Outfit", fontWeight: 700 }}>Minhas Especialidades</h2>
                  <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                    Selecione as atividades que você domina para filtrar chamados compatíveis.
                  </p>
                </div>
                <Button 
                  onClick={handleSaveSkills} 
                  loading={savingSkills} 
                  variant="brand" 
                  style={{ width: "auto", padding: "10px 20px", fontSize: "0.85rem", backgroundColor: "var(--theme-primary)", color: "#061a14" }}
                >
                  Salvar Habilidades
                </Button>
              </div>

              {/* Grid de Imagens das Habilidades */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "16px",
                marginTop: "20px"
              }}>
                {skillCategories.map(category => {
                  let isSelected = false;
                  let selectionText = "";

                  const count = category.subBlocks.filter(b => selectedSkills.includes(b)).length;
                  isSelected = count > 0;
                  selectionText = isSelected ? `${count}/${category.subBlocks.length} selecionadas` : "Inativo";

                  const isExpanded = expandedCategoryId === category.id;

                  return (
                    <div key={category.id} style={{ display: "flex", flexDirection: "column" }}>
                      <div 
                        onClick={() => {
                          setExpandedCategoryId(isExpanded ? null : category.id);
                        }}
                        style={{
                          height: "130px",
                          borderRadius: "12px",
                          position: "relative",
                          overflow: "hidden",
                          cursor: "pointer",
                          border: isSelected ? "2px solid var(--theme-primary)" : "2px solid transparent",
                          boxShadow: isSelected ? "0 0 15px rgba(245, 158, 11, 0.25)" : "none",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        {/* Background Image */}
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          backgroundImage: `url(${category.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          transition: "transform 0.5s ease",
                          transform: isExpanded || isSelected ? "scale(1.05)" : "scale(1)"
                        }} />

                        {/* Overlay */}
                        <div style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: "linear-gradient(to bottom, rgba(15, 19, 31, 0.2) 0%, rgba(15, 19, 31, 0.85) 100%)",
                        }} />

                        {/* Checkmark indicator top right */}
                        {isSelected && (
                          <div style={{
                            position: "absolute",
                            top: "10px",
                            right: "10px",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            backgroundColor: "var(--theme-primary)",
                            color: "#061a14",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.65rem",
                            fontWeight: "bold",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
                          }}>
                            ✓
                          </div>
                        )}

                        {/* Text Overlay */}
                        <div style={{
                          position: "absolute",
                          bottom: "12px",
                          left: "12px",
                          right: "12px",
                          zIndex: 10
                        }}>
                          <span style={{ 
                            fontSize: "0.85rem", 
                            fontWeight: 700, 
                            color: "#fff", 
                            display: "block",
                            textShadow: "0 1px 3px rgba(0,0,0,0.8)",
                            fontFamily: "Outfit" 
                          }}>
                            {category.title}
                          </span>
                          <span style={{ 
                            fontSize: "0.68rem", 
                            color: isSelected ? "var(--theme-primary)" : "rgba(255,255,255,0.6)", 
                            fontWeight: isSelected ? 600 : 400,
                            display: "block",
                            marginTop: "2px"
                          }}>
                            {selectionText}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Drawer de Sub-blocos se expandido */}
              {expandedCategoryId && (
                (() => {
                  const activeCat = skillCategories.find(c => c.id === expandedCategoryId);
                  if (!activeCat) return null;

                  return (
                    <div style={{
                      marginTop: "20px",
                      padding: "20px",
                      borderRadius: "12px",
                      background: "rgba(245, 158, 11, 0.04)",
                      border: "1px solid rgba(245, 158, 11, 0.15)",
                      animation: "fadeIn 0.25s ease-out"
                    }}>
                      <h4 style={{ 
                        fontSize: "0.9rem", 
                        fontFamily: "Outfit", 
                        fontWeight: 700, 
                        color: "var(--theme-primary)", 
                        marginBottom: "12px",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <span>🔧 Detalhar Atividades: {activeCat.title}</span>
                      </h4>
                      <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", 
                        gap: "12px" 
                      }}>
                        {activeCat.subBlocks.map(subBlock => {
                          const isSubSelected = selectedSkills.includes(subBlock);
                          return (
                            <label 
                              key={subBlock} 
                              style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "10px", 
                                padding: "10px 14px",
                                borderRadius: "8px",
                                background: isSubSelected ? "rgba(245, 158, 11, 0.08)" : "rgba(255, 255, 255, 0.02)",
                                border: isSubSelected ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(255,255,255,0.03)",
                                fontSize: "0.8rem", 
                                color: isSubSelected ? "#fff" : "var(--text-secondary)",
                                cursor: "pointer",
                                transition: "var(--transition-smooth)",
                                userSelect: "none"
                              }}
                            >
                              <input 
                                type="checkbox" 
                                checked={isSubSelected}
                                onChange={() => handleToggleSkill(subBlock)}
                                style={{ width: "16px", height: "16px", accentColor: "var(--theme-primary)", cursor: "pointer" }}
                              />
                              <span style={{ fontWeight: isSubSelected ? 600 : 400 }}>{subBlock}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            {/* Se houver Serviço Ativo */}
            {activeService ? (
              <div style={{ animation: "fadeIn 0.3s ease" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "1.4rem", fontFamily: "Outfit" }}>Serviço em Andamento</h2>
                  <Badge variant="accent">ATIVO</Badge>
                </div>

                <div className="card-glass" style={{ padding: "32px", border: "1px solid rgba(245, 158, 11, 0.3)" }}>
                  
                  {/* Informações Principais */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "20px", marginBottom: "20px" }}>
                    <div>
                      <Badge variant="brand" style={{ marginBottom: "8px" }}>{activeService.service_type}</Badge>
                      <h3 style={{ fontSize: "1.25rem", fontFamily: "Outfit", fontWeight: 700 }}>
                        {activeService.neighborhood}
                      </h3>
                      <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "4px" }}>
                        Tempo estimado: {activeService.duration_hours} horas
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Valor Líquido</span>
                      <span style={{ fontSize: "1.5rem", fontFamily: "Outfit", fontWeight: 800, color: "var(--theme-primary)" }}>
                        R$ {activeService.value.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Informações Confidenciais (Reveladas após aprovação) */}
                  {activeService.status === "aguardando prestador (selecionado mas pendente confirmação pro gestor)" ? (
                    <div style={{
                      backgroundColor: "rgba(255,255,255,0.02)",
                      border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      padding: "20px",
                      textAlign: "center",
                      marginBottom: "24px"
                    }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "12px" }}>
                        Aguardando a confirmação do Gestor para revelar o endereço completo e horário.
                      </p>
                      
                      {/* Botão de simulação rápida para UX do Operador */}
                      {!isDbMode && (
                        <Button 
                          onClick={handleSimulateManagerApproval} 
                          variant="accent" 
                          style={{ padding: "8px 16px", fontSize: "0.75rem", width: "auto" }}
                        >
                          Simular Aprovação do Gestor
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginBottom: "24px", animation: "fadeIn 0.3s ease" }}>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Endereço de Execução</span>
                        <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 500 }}>
                          {activeService.address || "Endereço não disponível."}
                        </span>
                      </div>
                      <div>
                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Horário Agendado</span>
                        <span style={{ fontSize: "0.9rem", color: "#fff", fontWeight: 500 }}>
                          {activeService.scheduled_at}
                        </span>
                      </div>
                      {activeService.notes && (
                        <div>
                          <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", textTransform: "uppercase" }}>Notas do Morador</span>
                          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: 1.4 }}>
                            "{activeService.notes}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Botões de Ação de Execução */}
                  {activeService.status === "agendado (prestador a caminho)" && (
                    <Button 
                      onClick={() => handleUpdateActiveStatus("prestador no local")} 
                      variant="brand" 
                      style={{ width: "100%", backgroundColor: "var(--theme-primary)", color: "#061a14" }}
                    >
                      Cheguei ao Local (Check-in)
                    </Button>
                  )}

                  {activeService.status === "prestador no local" && (
                    <Button 
                      onClick={() => handleUpdateActiveStatus("serviço em execução")} 
                      variant="brand" 
                      style={{ width: "100%", backgroundColor: "var(--theme-primary)", color: "#061a14" }}
                    >
                      Iniciar Execução do Serviço
                    </Button>
                  )}

                  {activeService.status === "serviço em execução" && (
                    <Button 
                      onClick={() => handleUpdateActiveStatus("serviço finalizado")} 
                      variant="brand" 
                      style={{ width: "100%", backgroundColor: "#10b981", color: "#061a14" }}
                    >
                      Finalizar e Solicitar Repasse (Check-out)
                    </Button>
                  )}

                  {activeService.status === "aguardando prestador (selecionado mas pendente confirmação pro gestor)" && (
                    <Button 
                      disabled
                      style={{ width: "100%", opacity: 0.5 }}
                    >
                      Aguardando Liberação do Gestor
                    </Button>
                  )}

                </div>
              </div>
            ) : (
              /* Se não houver Serviço Ativo, mostra disponíveis */
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "1.4rem", fontFamily: "Outfit" }}>Serviços Disponíveis</h2>
                  <Badge variant="brand">{availableServices.length} Encontrados</Badge>
                </div>

                {isPending ? (
                  <div className="card-glass" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "0.9rem" }}>A lista de serviços aparecerá aqui assim que seu cadastro for homologado.</p>
                  </div>
                ) : availableServices.length === 0 ? (
                  <div className="card-glass" style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                    <p style={{ fontSize: "0.9rem" }}>Nenhum chamado disponível compatível com suas habilidades no momento.</p>
                    <p style={{ fontSize: "0.75rem", marginTop: "8px" }}>Configure novas habilidades ao lado para expandir seu radar.</p>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {availableServices.map(service => (
                      <div 
                        key={service.id} 
                        className="card-glass" 
                        style={{ 
                          padding: "24px", 
                          display: "flex", 
                          flexDirection: "column", 
                          gap: "16px",
                          transition: "var(--transition-smooth)"
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <Badge variant="brand" style={{ marginBottom: "8px" }}>{service.service_type}</Badge>
                            <h3 style={{ fontSize: "1.1rem", fontFamily: "Outfit", fontWeight: 700 }}>{service.neighborhood}</h3>
                            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "4px" }}>
                              {service.scheduled_at} • Est: {service.duration_hours}h
                            </p>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "block" }}>Líquido PIX</span>
                            <span style={{ fontSize: "1.3rem", fontFamily: "Outfit", fontWeight: 800, color: "var(--theme-primary)" }}>
                              R$ {service.value.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        {service.notes && (
                          <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.4 }}>
                            {service.notes}
                          </p>
                        )}

                        <Button 
                          onClick={() => handleSelectService(service)}
                          variant="brand" 
                          style={{ width: "100%", padding: "10px", fontSize: "0.85rem", backgroundColor: "var(--theme-primary)", color: "#061a14" }}
                        >
                          Candidatar-me ao Serviço
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Histórico Simples de Serviços Realizados */}
                {serviceHistory.length > 0 && (
                  <div style={{ marginTop: "40px" }}>
                    <h3 style={{ fontSize: "1.1rem", fontFamily: "Outfit", marginBottom: "16px" }}>Histórico de Trabalhos</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {serviceHistory.map((h, i) => (
                        <div key={i} className="card-glass" style={{ padding: "16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: "0.8rem", fontWeight: 600, display: "block" }}>{h.service_type}</span>
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{h.completed_at} • {h.neighborhood}</span>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--theme-primary)", display: "block" }}>+ R$ {h.value.toFixed(2)}</span>
                            <span style={{ fontSize: "0.6rem", color: "#10b981" }}>Pago ✓</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </main>

      {/* Modal Customizado de Sucesso/Alerta */}
      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title={alertTitle}>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>{alertMsg}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
          <Button variant="brand" onClick={() => setAlertOpen(false)} style={{ padding: "8px 24px", width: "auto", backgroundColor: "var(--theme-primary)", color: "#061a14" }}>
            Fechar
          </Button>
        </div>
      </Modal>

      {/* Estilos específicos responsivos/globais baseados no layout do prestador */}
      <style jsx global>{`
        /* Sobrescrever variáveis específicas de tema do prestador */
        body {
          --theme-primary: #f59e0b;
          --theme-secondary: #92400e;
          --theme-light: #fbbf24;
          --theme-glow: rgba(245, 158, 11, 0.12);
          --theme-glow-intense: rgba(245, 158, 11, 0.2);
          --theme-gradient: linear-gradient(135deg, #d97706 0%, #78350f 100%);
          --theme-bg-subtle: rgba(245, 158, 11, 0.04);
          --theme-border-subtle: rgba(245, 158, 11, 0.15);
        }

        .card-glass {
          background: rgba(19, 27, 46, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
          border-radius: 16px;
        }

        @media (min-width: 1024px) {
          main {
            display: grid;
          }
        }
      `}</style>
    </div>
  );
}
