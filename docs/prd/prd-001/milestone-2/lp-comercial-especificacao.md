# Especificação de Negócios — Landing Page Comercial Central & Simuladores Interativos
> **Versão:** 1.0.0  
> **Status:** Homologado para Design e Desenvolvimento  
> **Autor:** @ba (Analista de Negócios)  

---

## 🗺️ 1. Visão Geral e Objetivo Estratégico

A **Landing Page Comercial Central (LP Geral)** é a porta de entrada principal da marca **Reserva Serviços**. Ela funciona como um roteador inteligente de tráfego, direcionando o usuário de acordo com sua intenção: contratar um serviço (**Morador**) ou trabalhar na plataforma (**Prestador**).

### Objetivos Principais:
1.  **Conversão Dupla Dinâmica:** Atrair moradores despertando desejo por segurança e praticidade, enquanto atrai profissionais qualificados com a promessa de ganhos reais sem custo de condução.
2.  **Quebra de Objeções Visual:** Explicar em segundos que a rede opera de forma 100% hiperlocal e segura dentro do complexo residencial, sem vínculo burocrático e sob total conformidade legal (LGPD/CDC).
3.  **Simuladores como Ímã de Engajamento:** Prender a atenção do morador estimulando a curiosidade sobre quanto custa uma diária (Simulador de Orçamento) e do profissional sobre quanto ele pode ganhar por mês a passos de caminhada (Simulador de Receita).

---

## 🎨 2. Direção de Arte e Estética Premium (Visual Setup)

Conforme as diretrizes de **Rich Aesthetics** do projeto, a interface deve fugir da mesmice corporativa. Adotaremos um estilo de **Glassmorphism Escuro e Vibrante**:

*   **Tipografia:** Fontes do ecossistema Google Fonts: **Outfit** (para títulos modernos e chamativos) e **Inter** (para textos de apoio de altíssima legibilidade).
*   **Esquema de Cores (Harmony Palette):**
    *   *Fundo Dominante:* Slate Obsidian Dark (`#0B0F19`) e Deep Midnight (`#020617`).
    *   *Acento Cliente (Confiança e Limpeza):* Emerald Green (`#10B981` ou HSL 160, 84%, 39%) com degradê para Teal Neon (`#06B6D4`).
    *   *Acento Prestador (Ganhos e Liquidez):* Amber Gold (`#F59E0B` ou HSL 38, 92%, 50%) com degradê para Orange Radiant (`#F97316`).
*   **Efeitos Visuais:**
    *   Cartões translúcidos com desfoque de fundo (`backdrop-filter: blur(12px)`), bordas finas com gradiente suave e sombras difusas (*box-shadow neon*).
    *   Micro-animações de entrada e transições de hover suaves (`transition: all 0.3s ease`).
    *   Uso de imagens conceituais premium (geradas por IA) para ilustrar os perfis.

---

## 📐 3. Arquitetura da LP e Jornada do Usuário

A página é dividida em seções estratégicas de conversão:

### Seção 1: O Hero Split (O Coração da LP)
*   **O Conceito:** Uma tela dividida diagonalmente ou em dois grandes blocos simétricos de glassmorphism reativo.
*   **Lado Esquerdo (Foco Morador):**
    *   *Título:* "Sua Unidade Brilhando. Sem Sair de Casa."
    *   *Copy:* Contrate profissionais de elite rigorosamente auditados (antecedentes 100% verificados) no seu próprio condomínio. Rapidez e segurança na palma da sua mão.
    *   *CTA Emerald:* "Quero Contratar" (direciona para `/cliente/cadastro`).
*   **Lado Direito (Foco Prestador):**
    *   *Título:* "Ganhos Máximos. Custo Logístico Zero."
    *   *Copy:* Faça diárias a passos de caminhada. Receba 80% do valor via PIX imediato, sem taxas ocultas e sem gastar R$ 1,00 em transporte.
    *   *CTA Amber:* "Quero Trabalhar" (direciona para `/prestador/cadastro`).

---

## 🧮 4. O Motor dos Simuladores Interativos

Os simuladores são os maiores catalisadores de curiosidade da página. Eles devem ser reativos, atualizando os cálculos no milissegundo de qualquer clique em botões deslizantes (sliders) ou seletores.

### 4.1. Simulador de Orçamento do Morador (Client-Side)
Calcula na hora o valor estimado do serviço solicitado, oferecendo transparência total e gerando o gatilho da contratação rápida.

#### Variáveis de Entrada:
1.  **Tipo de Serviço (Seletor Visual):**
    *   `Faxina/Limpeza` (Base: R$ 120,00)
    *   `Passadoria` (Base: R$ 25,00/hora)
    *   `Marido de Aluguel` (Reparos)
2.  **Complexidade / Escopo:**
    *   *Para Faxina (Número de Dormitórios/Banheiros):*
        *   Dormitórios adicionais (a partir do 1º): `+ R$ 20,00` por dormitório.
        *   Banheiros adicionais (a partir do 1º): `+ R$ 15,00` por banheiro.
    *   *Para Passadoria (Seletor de Horas):*
        *   Slider de 3 a 8 horas (mínimo de 3 horas).
    *   *Para Marido de Aluguel (Complexidade do conserto):*
        *   `Leve` (Troca de tomadas, torneiras): R$ 80,00 fixo.
        *   `Média` (Montagem de móvel pequeno, instalar chuveiro): R$ 130,00 fixo.
        *   `Alta` (Reparo hidráulico complexo, suporte de TV pesado): R$ 180,00 fixo.
3.  **Frequência do Serviço:**
    *   `Avulso` (0% de desconto)
    *   `Quinzenal` (5% de desconto no valor total)
    *   `Semanal` (10% de desconto no valor total)

#### Fórmulas de Cálculo:
*   **Fórmula Faxina:**  
    $$\text{Orçamento} = (120 + (\text{Dormitórios} - 1) \times 20 + (\text{Banheiros} - 1) \times 15) \times (1 - \text{Desconto})$$
*   **Fórmula Passadoria:**  
    $$\text{Orçamento} = (\text{Horas} \times 25) \times (1 - \text{Desconto})$$
*   **Fórmula Marido de Aluguel:**  
    $$\text{Orçamento} = \text{Complexidade Fixo} \times (1 - \text{Desconto})$$

---

### 4.2. Simulador de Receita do Prestador (Faturamento Estimado)
Mostra ao profissional o poder multiplicador de trabalhar localmente sem desperdiçar dinheiro e tempo com ônibus ou metrô.

#### Variáveis de Entrada:
1.  **Tipo de Serviço Principal:**
    *   `Faxina` (Ticket Médio de Repasse: R$ 120,00 líquido por diária de 80% de R$ 150,00)
    *   `Passadoria` (Ticket Médio de Repasse: R$ 80,00 líquido por período de 80% de R$ 100,00)
    *   `Marido de Aluguel` (Ticket Médio de Repasse: R$ 104,00 líquido por serviço de 80% de R$ 130,00)
2.  **Número de Serviços por Semana (Slider):**
    *   Range de 1 a 6 dias na semana.

#### O Fator "Custo Logístico Zero" (Gatilho Emocional Master):
*   Calculadora de Economia de Condução: O trabalhador médio em SP gasta em média **R$ 15,20 por dia** em tarifas integradas (ônibus + metrô ida e volta).
*   Economia Mensal Estimada:
    $$\text{Economia Mensal} = \text{Dias por Semana} \times 15,20 \times 4.33 \text{ semanas}$$

#### Fórmulas de Ganhos:
*   **Repasse Semanal:**  
    $$\text{Ganha por Semana} = \text{Serviços Semana} \times \text{Repasse Fixo}$$
*   **Faturamento Mensal Estimado:**  
    $$\text{Faturamento Mensal} = \text{Ganha por Semana} \times 4.33$$
*   **Ganhos Totais (Faturamento + Economia de Transporte):**  
    $$\text{Ganhos Reais} = \text{Faturamento Mensal} + \text{Economia Mensal}$$

---

## 🖼️ 5. Geração de Imagens Conceituais (IA Assets)

Para manter a estética ultra-premium sem usar fotos genéricas de bancos de imagem comuns, usaremos nossa ferramenta de inteligência artificial para produzir os visuais do split Hero.

### Assets Recomendados:
1.  **`lp_cliente_hero`**: Uma imagem elegante em close-up de um apartamento moderno, com iluminação acolhedora e minimalista (tons esmeralda suaves e cinza chumbo), mostrando um cômodo perfeitamente limpo e organizado. Transmite paz, segurança e alta qualidade.
2.  **`lp_prestador_hero`**: Um profissional sorridente em plano médio, vestindo uma camisa polo elegante e neutra, segurando de forma organizada ferramentas profissionais modernas sob um fundo escuro desfocado com iluminação neon âmbar suave. Transmite prestígio, autonomia e foco em lucro.

---

## 📈 6. Plano de Ação e Roteamento no Next.js

1.  **Nova Rota Principal (`/`):** A página inicial (`src/app/page.js`) se tornará a **LP Comercial Geral** com os simuladores integrados.
2.  **Onboarding do Morador (`/cliente/cadastro`):** Novo formulário reativo e simplificado para cadastro de moradores com termos específicos.
3.  **Onboarding do Prestador (`/prestador/cadastro`):** Rota atual de onboarding de prestadores será movida e estilizada para este endereço.
4.  **Painel do Gestor (`/gestor/painel`):** Mantido sob controle administrativo seguro.

---
*Homologado por:*  
**@ba** — *Analista de Negócios / Business Analyst Reserva Serviços*
