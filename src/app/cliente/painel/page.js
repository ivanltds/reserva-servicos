"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import { supabase, fetchServiceItems } from "../../../services/supabase";
import Badge from "../../../components/ui/Badge";
import Button from "../../../components/ui/Button";
import Input from "../../../components/ui/Input";
import Modal from "../../../components/ui/Modal";

// Constantes de agendamento estruturadas para o formulário em etapas
// Constantes de agendamento estruturadas para o formulário em etapas
const BOOKING_CATEGORIES = [
  {
    id: "limpeza_domestica",
    title: "Limpeza Doméstica",
    description: "Serviços domésticos de faxina, lavagem, passagem e organização.",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    type: "direct_subblocks",
    subBlocks: [
      { name: "Limpeza Geral Padrão", price: 120.00, duration: 4 },
      { name: "Limpeza Profunda / Faxina Pesada", price: 180.00, duration: 6 },
      { name: "Passar Roupas", price: 70.00, duration: 3 },
      { name: "Lavar Roupas", price: 60.00, duration: 2.5 },
      { name: "Limpeza de Vidros e Janelas", price: 80.00, duration: 3 },
      { name: "Organização de Armários e Closets", price: 100.00, duration: 4 },
      { name: "Limpeza de Geladeira e Forno Interno", price: 50.00, duration: 2 },
      { name: "Limpeza de Sacadas e Varandas", price: 45.00, duration: 1.5 },
      { name: "Arrumação de Camas e Troca de Enxoval", price: 35.00, duration: 1 },
      { name: "Limpeza de Tapetes e Estofados", price: 90.00, duration: 3 },
      { name: "Limpeza Pós-Mudança / Pós-Obra", price: 240.00, duration: 8 },
      { name: "Limpeza de Paredes e Azulejos de Cozinha/Área", price: 70.00, duration: 2.5 }
    ]
  },
  {
    id: "pequenos_reparos",
    title: "Pequenos Reparos",
    description: "Serviços qualificados de elétrica, hidráulica, pintura, marcenaria ou outros reparos.",
    image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop",
    type: "blocks",
    blocks: [
      {
        id: "eletrica",
        title: "⚡ Pequenos Reparos (Elétrica)",
        displayName: "Elétrica",
        image: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Trocar Resistência de Chuveiro", price: 85.00, duration: 2 },
          { name: "Trocar Tomada ou Interruptor", price: 60.00, duration: 1.5 },
          { name: "Instalar Luminária ou Lustre", price: 110.00, duration: 2.5 },
          { name: "Instalar Ventilador de Teto", price: 130.00, duration: 3 },
          { name: "Trocar Disjuntor no Quadro", price: 70.00, duration: 1.5 },
          { name: "Instalar Campainha", price: 45.00, duration: 1 },
          { name: "Trocar Reator de Lâmpada", price: 50.00, duration: 1.2 },
          { name: "Instalar Fita LED", price: 80.00, duration: 2 },
          { name: "Passar Cabo de Rede/Telefone", price: 95.00, duration: 2.5 },
          { name: "Instalar Suporte de TV com Passagem de Cabos", price: 120.00, duration: 3 },
          { name: "Reparo em Fiação Rompida de Eletrodoméstico", price: 55.00, duration: 1.5 },
          { name: "Instalar Sensor de Presença", price: 65.00, duration: 1.5 }
        ]
      },
      {
        id: "hidraulica",
        title: "🚰 Pequenos Reparos (Hidráulica)",
        displayName: "Hidráulica",
        image: "https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Consertar Torneira Pingando", price: 65.00, duration: 1.5 },
          { name: "Reparo em Válvula Hydra ou Caixa Acoplada", price: 75.00, duration: 2 },
          { name: "Desentupir Pia de Cozinha ou Banheiro", price: 90.00, duration: 2 },
          { name: "Desentupir Vaso Sanitário", price: 95.00, duration: 2 },
          { name: "Trocar Sifão de Pia", price: 50.00, duration: 1 },
          { name: "Trocar Flexível de Ducha ou Torneira", price: 40.00, duration: 1 },
          { name: "Instalar Filtro de Água", price: 55.00, duration: 1.2 },
          { name: "Instalar Máquina de Lavar Roupa/Louça", price: 80.00, duration: 1.8 },
          { name: "Trocar Reparo de Registro", price: 85.00, duration: 2.2 },
          { name: "Instalar Chuveiro Novo (Instalação Hidráulica)", price: 90.00, duration: 2 },
          { name: "Eliminar Vazamento em Conexão Exposta", price: 70.00, duration: 1.5 },
          { name: "Limpeza de Caixa de Gordura", price: 150.00, duration: 3 }
        ]
      },
      {
        id: "pintura",
        title: "🎨 Pequenos Reparos (Pintura)",
        displayName: "Pintura",
        image: "https://images.unsplash.com/photo-1562259949-e8e7689d7828?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Pintura de Parede Única (Destaque)", price: 180.00, duration: 6 },
          { name: "Pintura de Cômodo Completo", price: 350.00, duration: 12 },
          { name: "Aplicação de Textura ou Grafiato", price: 250.00, duration: 8 },
          { name: "Pequenos Retoques de Massa Corrida", price: 120.00, duration: 4 },
          { name: "Verniz ou Pintura em Portas e Portais", price: 140.00, duration: 5 },
          { name: "Pintura de Grelhas e Grades Metálicas", price: 110.00, duration: 4 },
          { name: "Tratamento e Pintura Anti-mofo", price: 130.00, duration: 4 },
          { name: "Lixamento e Preparação de Paredes", price: 90.00, duration: 3 },
          { name: "Pintura de Teto", price: 160.00, duration: 5 },
          { name: "Pintura de Rodapés e Guarnições", price: 75.00, duration: 3 },
          { name: "Pintura de Portão Externo", price: 220.00, duration: 8 },
          { name: "Pintura de Azulejos (Tinta Epóxi)", price: 290.00, duration: 10 }
        ]
      },
      {
        id: "alvenaria",
        title: "🧱 Pequenos Reparos (Alvenaria)",
        displayName: "Alvenaria",
        image: "https://images.unsplash.com/photo-1590069261209-f8e9b8642343?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Fixação de Prateleiras e Nichos", price: 90.00, duration: 2 },
          { name: "Instalar Suporte de TV em Parede de Alvenaria", price: 95.00, duration: 2 },
          { name: "Troca de Azulejo ou Cerâmica Quebrada", price: 140.00, duration: 4 },
          { name: "Rejuntamento de Pisos e Azulejos", price: 110.00, duration: 5 },
          { name: "Pequeno Reparo de Reboco ou Reboco Caído", price: 130.00, duration: 4 },
          { name: "Fixação de Acessórios de Banheiro", price: 60.00, duration: 1.5 },
          { name: "Instalar Varal de Teto ou Parede", price: 75.00, duration: 2 },
          { name: "Instalação de Espelhos Grandes na Parede", price: 120.00, duration: 3 },
          { name: "Chumbamento de Caixa de Luz ou Suporte", price: 85.00, duration: 2 },
          { name: "Fechamento de Furos e Rasgos de Tubulação", price: 100.00, duration: 3 },
          { name: "Instalação de Ralo Grelha ou Ralo Linear", price: 95.00, duration: 2.5 },
          { name: "Assentamento de Soleira ou Pingadeira", price: 115.00, duration: 3 }
        ]
      },
      {
        id: "montagem",
        title: "🔧 Montador de Móveis e Instalações",
        displayName: "Montagem de Móveis",
        image: "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Montagem de Guarda-Roupa Solteiro", price: 130.00, duration: 3 },
          { name: "Montagem de Guarda-Roupa Casal Grande", price: 250.00, duration: 6 },
          { name: "Montagem de Cama Casal/Solteiro", price: 90.00, duration: 2 },
          { name: "Montagem de Mesa de Jantar com Cadeiras", price: 110.00, duration: 2.5 },
          { name: "Montagem de Painel de TV ou Rack", price: 120.00, duration: 3 },
          { name: "Montagem de Escrivaninha ou Cadeira de Escritório", price: 70.00, duration: 1.5 },
          { name: "Instalação de Cortinas e Persianas", price: 65.00, duration: 1.5 },
          { name: "Fixação de Quadros, Espelhos e Varões", price: 55.00, duration: 1 },
          { name: "Montagem de Armário de Cozinha Aéreo", price: 140.00, duration: 3.5 },
          { name: "Montagem de Comoda ou Criado-Mudo", price: 80.00, duration: 2 },
          { name: "Reparo em Portas de Armário (Dobradiças/Regulagem)", price: 50.00, duration: 1.2 },
          { name: "Desmontagem de Móveis para Mudança", price: 100.00, duration: 2.5 }
        ]
      },
      {
        id: "animais",
        title: "🐾 Cuidado de Animais (Pet Care)",
        displayName: "Cuidado de Animais",
        image: "https://images.unsplash.com/photo-1415369629372-26f2fe60c467?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Passeio com Cão Pequeno / Médio (Dog Walking)", price: 30.00, duration: 1 },
          { name: "Passeio com Cão Grande / Porte Gigante", price: 45.00, duration: 1 },
          { name: "Hospedagem Domiciliar de Cão (Diária)", price: 70.00, duration: 24 },
          { name: "Hospedagem Domiciliar de Gato (Diária)", price: 55.00, duration: 24 },
          { name: "Pet Sitting (Visita de 1 hora para Alimentar e Limpar)", price: 40.00, duration: 1 },
          { name: "Banho Domiciliar em Cão Pequeno", price: 50.00, duration: 1.5 },
          { name: "Escovação e Higiene Oral Domiciliar", price: 35.00, duration: 0.8 },
          { name: "Administração de Medicamentos / Curativos", price: 40.00, duration: 0.5 },
          { name: "Transporte de Pet para Veterinário ou Petshop", price: 60.00, duration: 1.5 },
          { name: "Adestramento Básico / Comportamento (Sessão)", price: 90.00, duration: 1.2 },
          { name: "Corte de Unhas e Limpeza de Ouvidos de Pet", price: 30.00, duration: 0.5 },
          { name: "Hospedagem de Pet por Turno / Day Care (Até 12h)", price: 50.00, duration: 12 }
        ]
      },
      {
        id: "cozinha",
        title: "🍳 Cozinha e Gastronomia",
        displayName: "Cozinha e Gastronomia",
        image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Preparo de Almoço Familiar Padrão (Até 4 pessoas)", price: 120.00, duration: 3 },
          { name: "Preparo de Marmitas Saudáveis para a Semana (10 potes)", price: 190.00, duration: 5 },
          { name: "Serviço de Cozinheiro para Jantar Especial", price: 280.00, duration: 4 },
          { name: "Preparo de Salgadinhos para Festas (Cento)", price: 90.00, duration: 3 },
          { name: "Confeitaria: Bolo de Aniversário Simples (2kg)", price: 110.00, duration: 3.5 },
          { name: "Preparo de Sopas e Caldos de Inverno", price: 80.00, duration: 2 },
          { name: "Cozinha Vegetariana / Vegana (Preparo Completo)", price: 130.00, duration: 3 },
          { name: "Organização e Higienização da Despensa e Geladeira", price: 75.00, duration: 2.5 },
          { name: "Preparo de Café da Manhã Premium ou Brunch", price: 90.00, duration: 2.2 },
          { name: "Preparo de Docinhos Tradicionais (Cento)", price: 80.00, duration: 2.5 },
          { name: "Auxiliar de Cozinha para Eventos (Limpeza e Apoio)", price: 140.00, duration: 6 },
          { name: "Preparo de Petiscos e Tábua de Frios Gourmet", price: 95.00, duration: 2 }
        ]
      },
      {
        id: "telhados",
        title: "🏠 Telhados e Calhas",
        displayName: "Telhados e Calhas",
        image: "https://images.unsplash.com/photo-1635424710928-0544e8512eae?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Limpeza de Calhas e Condutores", price: 120.00, duration: 2 },
          { name: "Substituição de Telhas Quebradas (Cerâmica)", price: 150.00, duration: 3 },
          { name: "Aplicação de Manta Asfáltica Autoadesiva", price: 180.00, duration: 4 },
          { name: "Impermeabilização com Manta Líquida", price: 220.00, duration: 5 },
          { name: "Desobstrução de Condutores de Água Pluvial", price: 90.00, duration: 2 },
          { name: "Conserto de Rufo ou Pingadeira Metálica", price: 130.00, duration: 3 },
          { name: "Instalação de Tela Protetora Contra Folhas", price: 110.00, duration: 2.5 },
          { name: "Pintura Impermeabilizante de Telhado", price: 250.00, duration: 6 },
          { name: "Vedação de Parafusos em Telhas de Fibrocimento/Zinco", price: 95.00, duration: 2.5 },
          { name: "Fixação de Calha Desprendida", price: 85.00, duration: 1.8 },
          { name: "Inspeção Completa de Infiltração em Forros/Telhados", price: 70.00, duration: 1.5 },
          { name: "Instalação de Calha Nova (Metro Linear)", price: 160.00, duration: 4 }
        ]
      },
      {
        id: "mudancas",
        title: "📦 Apoio em Mudanças (Carga/Descarga)",
        displayName: "Apoio em Mudanças",
        image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?q=80&w=400&auto=format&fit=crop",
        subBlocks: [
          { name: "Ajudante de Carga e Descarga (Até 4h)", price: 130.00, duration: 4 },
          { name: "Ajudante de Carga e Descarga (Período de 8h)", price: 220.00, duration: 8 },
          { name: "Embalagem de Louças, Livros e Objetos Frágeis", price: 95.00, duration: 3 },
          { name: "Montagem e Fechamento de Caixas (Kit Mudança)", price: 70.00, duration: 2.5 },
          { name: "Transporte Interno de Móveis Pesados", price: 90.00, duration: 2 },
          { name: "Carregamento de Entulho ou Sobras (Sacos)", price: 110.00, duration: 3 },
          { name: "Organização de Caixas Pós-Mudança nos Cômodos", price: 85.00, duration: 3 },
          { name: "Proteção de Móveis com Plástico Bolha", price: 75.00, duration: 2.2 },
          { name: "Apoio no Içamento Manual Simples", price: 120.00, duration: 2 },
          { name: "Descarte Ecológico de Móveis Velhos", price: 100.00, duration: 2.5 },
          { name: "Ajudante para Pequeno Carreto / Transporte", price: 140.00, duration: 4 },
          { name: "Desmontagem e Proteção de Eletrodomésticos para Transporte", price: 80.00, duration: 2 }
        ]
      }
    ]
  }
];

export default function ClientePainelPage() {
  const router = useRouter();
  const { user, profile, signOut, loading: authLoading } = useAuth();

  // Estados dos pedidos do cliente
  const [requests, setRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [residentInfo, setResidentInfo] = useState(null);

  // Estados do Modal de Solicitação em Etapas
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingCategories, setBookingCategories] = useState(BOOKING_CATEGORIES);
  
  // Dados do formulário de solicitação
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [selectedServiceType, setSelectedServiceType] = useState("");
  const [selectedValue, setSelectedValue] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(0);
  
  const [scheduledAt, setScheduledAt] = useState("");
  const [address, setAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [notes, setNotes] = useState("");

  // Estados de Pagamento e Finalização
  const [pixCopied, setPixCopied] = useState(false);
  const [creatingRequest, setCreatingRequest] = useState(false);

  // Alerta Customizado
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertTitle, setAlertTitle] = useState("");
  const [alertMsg, setAlertMsg] = useState("");

  const showCustomAlert = (title, message) => {
    setAlertTitle(title);
    setAlertMsg(message);
    setAlertOpen(true);
  };

  useEffect(() => {
    if (user) {
      loadClientData();
    }
  }, [user]);

  useEffect(() => {
    async function loadPricesFromDb() {
      const dbItems = await fetchServiceItems();
      if (dbItems && dbItems.length > 0) {
        // Map of name -> { price, duration }
        const priceMap = {};
        dbItems.forEach(item => {
          priceMap[item.name] = {
            price: Number(item.default_price),
            duration: Number(item.default_duration_hours)
          };
        });

        // Deep copy BOOKING_CATEGORIES and update prices and durations
        const updatedCategories = BOOKING_CATEGORIES.map(cat => {
          if (cat.type === "direct_subblocks") {
            const updatedSubBlocks = cat.subBlocks.map(sub => {
              const dbItem = priceMap[sub.name];
              return dbItem ? { ...sub, price: dbItem.price, duration: dbItem.duration } : sub;
            });
            return { ...cat, subBlocks: updatedSubBlocks };
          } else if (cat.type === "blocks") {
            const updatedBlocks = cat.blocks.map(block => {
              const updatedSubBlocks = block.subBlocks.map(sub => {
                const dbItem = priceMap[sub.name];
                return dbItem ? { ...sub, price: dbItem.price, duration: dbItem.duration } : sub;
              });
              return { ...block, subBlocks: updatedSubBlocks };
            });
            return { ...cat, blocks: updatedBlocks };
          }
          return cat;
        });

        setBookingCategories(updatedCategories);
      }
    }
    loadPricesFromDb();
  }, []);

  const loadClientData = async () => {
    setLoadingRequests(true);
    try {
      // 1. Carrega o histórico de solicitações com o nome do prestador associado (se houver)
      const { data: reqData, error: reqErr } = await supabase
        .from("service_requests")
        .select("*, provider:provider_id(name)")
        .eq("client_id", user.id)
        .order("created_at", { ascending: false });

      if (reqErr) throw reqErr;
      setRequests(reqData || []);

      // 2. Carrega as informações de endereço do morador para preenchimento automático
      const { data: resData } = await supabase
        .from("residents")
        .select("*")
        .eq("id", user.id)
        .single();

      if (resData) {
        setResidentInfo(resData);
        // Formata o endereço completo padrão
        const fullAddress = `${resData.rua}, ${resData.num}${resData.comp ? ` - ${resData.comp}` : ""}, ${resData.cidade}`;
        setAddress(fullAddress);
        setNeighborhood(resData.bairro);
      }
    } catch (err) {
      console.error("Erro ao carregar dados do cliente:", err.message);
    } finally {
      setLoadingRequests(false);
    }
  };

  // Abre o formulário de agendamento zerando os estados
  const handleOpenBooking = () => {
    setStep(1);
    setSelectedCategory(null);
    setSelectedBlock(null);
    setSelectedServiceType("");
    setSelectedValue(0);
    setSelectedDuration(0);
    setNotes("");
    setPixCopied(false);
    
    // Mantém endereço do morador ou limpa se não houver cadastrado
    if (residentInfo) {
      const fullAddress = `${residentInfo.rua}, ${residentInfo.num}${residentInfo.comp ? ` - ${residentInfo.comp}` : ""}, ${residentInfo.cidade}`;
      setAddress(fullAddress);
      setNeighborhood(residentInfo.bairro);
    } else {
      setAddress("");
      setNeighborhood("");
    }
    
    // Zera data/hora
    setScheduledAt("");
    setBookingModalOpen(true);
  };

  // Avança para a Etapa 2 de agendamento e local
  const handleSelectSimpleService = (service) => {
    setSelectedServiceType(service.skillName);
    setSelectedValue(service.price);
    setSelectedDuration(service.duration);
    setStep(2);
  };

  const handleSelectSubBlockService = (subBlock) => {
    setSelectedServiceType(subBlock.name);
    setSelectedValue(subBlock.price);
    setSelectedDuration(subBlock.duration);
    setStep(2);
  };

  // Valida a Etapa 2 e avança para a Etapa 3 (Pagamento)
  const handleAdvanceToPayment = () => {
    if (!scheduledAt) {
      showCustomAlert("Atenção", "Selecione a data e o horário para a execução do serviço.");
      return;
    }
    if (new Date(scheduledAt) <= new Date()) {
      showCustomAlert("Atenção", "A data e o horário do agendamento devem ser no futuro.");
      return;
    }
    if (!address.trim()) {
      showCustomAlert("Atenção", "Digite o endereço de entrega do serviço.");
      return;
    }
    if (!neighborhood.trim()) {
      showCustomAlert("Atenção", "Informe o bairro ou bloco para ajudar na localização do profissional.");
      return;
    }
    setStep(3);
  };

  // Copia o código PIX simulado
  const handleCopyPix = () => {
    const pixCode = `00020101021226830014br.gov.bcb.pix0136reserva-servicos-pix-simulado-123456789520400005303${selectedValue.toFixed(2)}5802BR5925Reserva Servicos Limitada6009Sao Paulo62070503***6304`;
    navigator.clipboard.writeText(pixCode);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  };

  // Finaliza a criação do serviço com status 'Solicitado (Pagamento aprovado)'
  const handleConfirmMockPayment = async () => {
    setCreatingRequest(true);
    try {
      const { error } = await supabase
        .from("service_requests")
        .insert({
          client_id: user.id,
          service_type: selectedServiceType,
          neighborhood: neighborhood.trim(),
          address: address.trim(),
          scheduled_at: new Date(scheduledAt).toISOString(),
          duration_hours: selectedDuration,
          value: selectedValue,
          status: "Solicitado (Pagamento aprovado)",
          notes: notes.trim() || null
        });

      if (error) throw error;

      setBookingModalOpen(false);
      showCustomAlert("Pagamento Aprovado!", "Seu agendamento foi confirmado. Agora ele está disponível para profissionais qualificados do condomínio.");
      loadClientData();
    } catch (err) {
      showCustomAlert("Erro ao agendar", err.message);
    } finally {
      setCreatingRequest(false);
    }
  };

  // Retorna classe/estilo de cor para o status do pedido
  const getStatusBadge = (status) => {
    if (status === "Solicitado (Pagamento aprovado)") {
      return <Badge variant="brand">Confirmado (Aguardando)</Badge>;
    }
    if (status === "Aprovado") {
      return <Badge variant="accent">Prestador Vinculado</Badge>;
    }
    if (status === "Finalizado") {
      return <Badge variant="neutral">Concluído</Badge>;
    }
    if (status.includes("aguardando pagamento")) {
      return <Badge variant="accent" style={{ backgroundColor: "#f59e0b", color: "#061a14" }}>Aguardando Pagamento</Badge>;
    }
    return <Badge variant="neutral">{status}</Badge>;
  };

  if (authLoading) return <div style={{ color: "#fff", padding: "20px" }}>Carregando seu painel...</div>;

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
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 100
      }}>
        <div style={{ fontFamily: "Outfit", fontWeight: 800, fontSize: "1.25rem", letterSpacing: "0.5px" }}>
          <span style={{ color: "#10b981" }}>RESERVA</span> SERVIÇOS
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>Olá, {profile?.name?.split(" ")[0]}</span>
          <button 
            onClick={() => signOut()}
            style={{ 
              background: "none", 
              border: "1px solid rgba(255, 255, 255, 0.1)", 
              color: "#f1f5f9", 
              padding: "8px 16px", 
              borderRadius: "10px", 
              fontSize: "0.75rem", 
              cursor: "pointer",
              transition: "var(--transition-smooth)"
            }}
            onMouseEnter={(e) => e.target.style.borderColor = "var(--theme-primary)"}
            onMouseLeave={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
          >
            Sair
          </button>
        </div>
      </nav>

      <main style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        
        {/* Banner do Cliente */}
        <header style={{ marginBottom: "40px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "20px" }}>
          <div>
            <Badge variant="brand" style={{ marginBottom: "12px" }}>Painel de Morador</Badge>
            <h1 style={{ fontSize: "2rem", fontFamily: "Outfit", fontWeight: 700 }}>O que vamos facilitar hoje?</h1>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "4px" }}>
              Solicite serviços domésticos com profissionais verificados do próprio condomínio.
            </p>
          </div>
          
          <Button 
            onClick={handleOpenBooking} 
            variant="brand" 
            style={{ 
              padding: "14px 28px", 
              fontSize: "0.9rem", 
              backgroundColor: "var(--theme-primary)", 
              color: "#061a14",
              fontWeight: 700,
              boxShadow: "0 4px 20px rgba(16, 185, 129, 0.25)",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
            SOLICITAR SERVIÇO
          </Button>
        </header>

        {/* Histórico e Acompanhamento de Chamados */}
        <section style={{ marginTop: "48px" }}>
          <h2 style={{ fontSize: "1.25rem", fontFamily: "Outfit", fontWeight: 700, marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
            📋 Meus Agendamentos
          </h2>

          {loadingRequests ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
              Buscando seus agendamentos...
            </div>
          ) : requests.length === 0 ? (
            <div className="card-glass" style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ 
                width: "64px", 
                height: "64px", 
                borderRadius: "50%", 
                backgroundColor: "rgba(16, 185, 129, 0.05)", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                margin: "0 auto 20px auto" 
              }}>
                <svg width="32" height="32" fill="none" stroke="var(--theme-primary)" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "8px" }}>Nenhum agendamento ativo</h3>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", maxWidth: "340px", margin: "0 auto 24px auto", lineHeight: 1.5 }}>
                Quando você solicitar e pagar um serviço, ele aparecerá aqui para você acompanhar em tempo real.
              </p>
              <Button variant="outline" onClick={handleOpenBooking} style={{ fontSize: "0.8rem", padding: "10px 20px" }}>
                Criar Primeiro Chamado
              </Button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              {requests.map(req => (
                <div key={req.id} className="card-glass" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "1rem", fontWeight: 700, fontFamily: "Outfit" }}>
                        {req.service_type}
                      </span>
                      {getStatusBadge(req.status)}
                    </div>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--theme-primary)", fontFamily: "Outfit" }}>
                      R$ {Number(req.value).toFixed(2)}
                    </span>
                  </div>

                  <div style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", 
                    gap: "16px",
                    borderTop: "1px solid rgba(255,255,255,0.05)",
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    padding: "16px 0",
                    fontSize: "0.8rem",
                    color: "var(--text-secondary)"
                  }}>
                    <div>
                      <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Agendado Para</span>
                      <span>📅 {new Date(req.scheduled_at).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                    </div>
                    <div>
                      <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Local</span>
                      <span>📍 {req.address} ({req.neighborhood})</span>
                    </div>
                    <div>
                      <span style={{ display: "block", color: "var(--text-muted)", fontSize: "0.7rem", fontWeight: 600, textTransform: "uppercase", marginBottom: "4px" }}>Profissional</span>
                      <span>👤 {req.provider?.name || "Aguardando aceitação..."}</span>
                    </div>
                  </div>

                  {req.notes && (
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "8px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Observações:</span> {req.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

      </main>

      {/* MODAL MULTI-ETAPAS DE AGENDAMENTO */}
      <Modal 
        isOpen={bookingModalOpen} 
        onClose={() => setBookingModalOpen(false)} 
        title={
          step === 1 ? "Nova Solicitação — 1. Escolha a Especialidade" :
          step === 2 ? "Nova Solicitação — 2. Detalhes do Agendamento" :
          "Nova Solicitação — 3. Resumo e Pagamento Pix"
        }
        maxWidth="650px"
      >
        {/* Step Indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {[1, 2, 3].map(s => (
            <div 
              key={s} 
              style={{ 
                height: "6px", 
                flex: 1, 
                borderRadius: "3px", 
                backgroundColor: s <= step ? "var(--theme-primary)" : "rgba(255,255,255,0.1)",
                transition: "var(--transition-smooth)"
              }} 
            />
          ))}
        </div>

        {/* ETAPA 1: SELEÇÃO DA CATEGORIA / SUB-BLOCK */}
        {step === 1 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
              Selecione uma especialidade abaixo. Se escolher Pequenos Reparos, você poderá detalhar a atividade.
            </p>

            {/* Grid Principal de Categorias */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {bookingCategories.map(cat => {
                const isSelected = selectedCategory?.id === cat.id;
                return (
                  <div 
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setSelectedBlock(null);
                    }}
                    style={{
                      borderRadius: "14px",
                      border: isSelected ? "2px solid var(--theme-primary)" : "2px solid transparent",
                      background: isSelected ? "rgba(16, 185, 129, 0.05)" : "rgba(255, 255, 255, 0.02)",
                      padding: "16px",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "var(--transition-smooth)",
                      boxShadow: isSelected ? "0 0 15px rgba(16, 185, 129, 0.15)" : "none"
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)";
                    }}
                  >
                    <div style={{ 
                      height: "100px", 
                      borderRadius: "10px", 
                      backgroundImage: `url(${cat.image})`, 
                      backgroundSize: "cover", 
                      backgroundPosition: "center",
                      marginBottom: "12px"
                    }} />
                    <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "4px" }}>{cat.title}</h4>
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", lineHeight: 1.3 }}>{cat.description}</p>
                  </div>
                );
              })}
            </div>

            {/* Sub-seleção direta para Limpeza Doméstica */}
            {selectedCategory && selectedCategory.type === "direct_subblocks" && (
              <div style={{ 
                marginTop: "16px", 
                padding: "20px", 
                borderRadius: "14px", 
                background: "rgba(255, 255, 255, 0.01)", 
                border: "1px solid rgba(255,255,255,0.05)",
                animation: "fadeIn 0.2s ease" 
              }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--theme-primary)", marginBottom: "16px" }}>
                  Selecione a atividade doméstica:
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "8px" }}>
                  {selectedCategory.subBlocks.map(sub => (
                    <div
                      key={sub.name}
                      onClick={() => handleSelectSubBlockService(sub)}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "10px",
                        background: "rgba(255, 255, 255, 0.02)",
                        border: "1px solid rgba(255, 255, 255, 0.04)",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        transition: "var(--transition-smooth)"
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.06)"}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"}
                    >
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{sub.name}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tempo estimado: {sub.duration}h</span>
                      </div>
                      <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--theme-primary)" }}>
                        R$ {sub.price.toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sub-seleção para Pequenos Reparos */}
            {selectedCategory && selectedCategory.type === "blocks" && (
              <div style={{ 
                marginTop: "16px", 
                padding: "20px", 
                borderRadius: "14px", 
                background: "rgba(255, 255, 255, 0.01)", 
                border: "1px solid rgba(255,255,255,0.05)",
                animation: "fadeIn 0.2s ease" 
              }}>
                <h4 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--theme-primary)", marginBottom: "16px" }}>
                  Selecione a Especialidade Desejada:
                </h4>
                
                {/* Grade de Especialidades com Imagens */}
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", 
                  gap: "12px", 
                  marginBottom: "24px" 
                }}>
                  {selectedCategory.blocks.map(block => {
                    const isBlockSelected = selectedBlock?.id === block.id;
                    return (
                      <div
                        key={block.id}
                        onClick={() => setSelectedBlock(block)}
                        style={{
                          borderRadius: "12px",
                          border: isBlockSelected ? "2px solid var(--theme-primary)" : "2px solid rgba(255,255,255,0.05)",
                          background: isBlockSelected ? "rgba(16, 185, 129, 0.08)" : "rgba(255, 255, 255, 0.02)",
                          padding: "10px",
                          cursor: "pointer",
                          textAlign: "center",
                          transition: "var(--transition-smooth)",
                          boxShadow: isBlockSelected ? "0 0 10px rgba(16, 185, 129, 0.15)" : "none"
                        }}
                        onMouseEnter={(e) => {
                          if (!isBlockSelected) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          if (!isBlockSelected) e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.05)";
                        }}
                      >
                        <div style={{ 
                          height: "70px", 
                          borderRadius: "8px", 
                          backgroundImage: `url(${block.image})`, 
                          backgroundSize: "cover", 
                          backgroundPosition: "center",
                          marginBottom: "8px"
                        }} />
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: isBlockSelected ? "var(--theme-primary)" : "#fff" }}>
                          {block.displayName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Sub-blocos (Atividades Detalhadas) */}
                {selectedBlock && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "8px", animation: "fadeIn 0.2s ease" }}>
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>
                      Selecione a atividade específica:
                    </span>
                    {selectedBlock.subBlocks.map(sub => (
                      <div
                        key={sub.name}
                        onClick={() => handleSelectSubBlockService(sub)}
                        style={{
                          padding: "12px 16px",
                          borderRadius: "10px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid rgba(255, 255, 255, 0.04)",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          transition: "var(--transition-smooth)"
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(16, 185, 129, 0.06)"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.02)"}
                      >
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#fff" }}>{sub.name}</span>
                          <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Tempo estimado: {sub.duration}h</span>
                        </div>
                        <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--theme-primary)" }}>
                          R$ {sub.price.toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ETAPA 2: DETALHES DE AGENDAMENTO E LOCAL */}
        {step === 2 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Badge variant="brand">{selectedServiceType}</Badge>
              <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--theme-primary)" }}>
                R$ {selectedValue.toFixed(2)}
              </span>
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                📅 DATA E HORA DE PREFERÊNCIA
              </label>
              <input 
                type="datetime-local" 
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
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
              />
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                📍 ENDEREÇO DE ENTREGA DO TRABALHO
              </label>
              <Input 
                placeholder="Rua, Número, Bloco, Apto"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                🏢 BAIRRO OU BLOCO
              </label>
              <Input 
                placeholder="Ex: Bloco B ou Jardim Raposo"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label style={{ display: "block", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "8px", fontWeight: 600 }}>
                📝 INSTRUÇÕES ADICIONAIS OU OBSERVAÇÕES
              </label>
              <textarea 
                placeholder="Descreva aqui o que precisa ser feito ou detalhes adicionais..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: "var(--bg-tertiary)",
                  border: "1px solid rgba(255, 255, 255, 0.05)",
                  borderRadius: "10px",
                  color: "#fff",
                  fontSize: "0.85rem",
                  outline: "none",
                  resize: "vertical",
                  fontFamily: "inherit"
                }}
              />
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "12px" }}>
              <Button onClick={() => setStep(1)} variant="outline" style={{ flex: 1 }}>
                Voltar
              </Button>
              <Button onClick={handleAdvanceToPayment} variant="brand" style={{ flex: 1, backgroundColor: "var(--theme-primary)", color: "#061a14" }}>
                Avançar
              </Button>
            </div>
          </div>
        )}

        {/* ETAPA 3: PAGAMENTO PIX */}
        {step === 3 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Box de Resumo */}
            <div style={{ 
              padding: "20px", 
              borderRadius: "14px", 
              background: "rgba(255, 255, 255, 0.02)", 
              border: "1px solid rgba(255,255,255,0.05)" 
            }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "12px", color: "var(--text-primary)" }}>Resumo do Pedido</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Serviço:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{selectedServiceType}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Agendado para:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{new Date(scheduledAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Endereço:</span>
                  <span style={{ fontWeight: 600, color: "#fff" }}>{address} ({neighborhood})</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "8px", marginTop: "4px" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 700 }}>Total:</span>
                  <span style={{ fontSize: "1.1rem", fontWeight: 800, color: "var(--theme-primary)", fontFamily: "Outfit" }}>
                    R$ {selectedValue.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Box de Pagamento PIX */}
            <div style={{ 
              padding: "24px", 
              borderRadius: "14px", 
              background: "rgba(16, 185, 129, 0.03)", 
              border: "1px solid rgba(16, 185, 129, 0.15)",
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px"
            }}>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--theme-primary)" }}>PAGAMENTO VIA PIX</span>
              
              {/* QR Code Simulado */}
              <div style={{ 
                width: "160px", 
                height: "160px", 
                background: "radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, rgba(7, 9, 14, 0.9) 100%)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: "12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px"
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--theme-primary)" strokeWidth="1.5">
                  <path d="M3 9V5a2 2 0 012-2h4M15 3h4a2 2 0 012 2v4M21 15v4a2 2 0 01-2 2h-4M9 21H5a2 2 0 01-2-2v-4M7 7h4v4H7V7zm6 0h4v4h-4V7zm0 6h4v4h-4v-4zm-6 0h4v4H7v-4z" />
                </svg>
                <span style={{ fontSize: "0.6rem", color: "var(--text-muted)" }}>CÓDIGO PIX ATIVO</span>
              </div>

              <div style={{ width: "100%" }}>
                <Button 
                  onClick={handleCopyPix}
                  variant="outline" 
                  style={{ 
                    width: "100%", 
                    fontSize: "0.8rem", 
                    padding: "10px", 
                    borderColor: "rgba(16, 185, 129, 0.3)",
                    color: "var(--theme-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px"
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  {pixCopied ? "Copiado!" : "Copiar Código Pix"}
                </Button>
              </div>

              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                Copie o código Pix copia-e-cola ou leia o QR Code no seu aplicativo do banco. Em desenvolvimento, clique no botão de simulação abaixo para confirmar.
              </p>

              <Button 
                onClick={handleConfirmMockPayment} 
                loading={creatingRequest}
                variant="brand" 
                style={{ 
                  width: "100%", 
                  padding: "12px", 
                  backgroundColor: "var(--theme-primary)", 
                  color: "#061a14",
                  fontWeight: 700
                }}
              >
                Confirmar Pagamento (Simulação)
              </Button>
            </div>

            <Button onClick={() => setStep(2)} variant="outline" style={{ width: "100%" }}>
              Voltar para agendamento
            </Button>
          </div>
        )}
      </Modal>

      {/* Alerta Customizado */}
      <Modal isOpen={alertOpen} onClose={() => setAlertOpen(false)} title={alertTitle}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>{alertMsg}</p>
          <Button onClick={() => setAlertOpen(false)} variant="brand" style={{ alignSelf: "flex-end", backgroundColor: "var(--theme-primary)", color: "#061a14", padding: "8px 20px" }}>
            OK
          </Button>
        </div>
      </Modal>

    </div>
  );
}
