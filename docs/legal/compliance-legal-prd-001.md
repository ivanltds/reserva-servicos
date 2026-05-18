# Compliance Legal & Regulatório — PRD-001
> Versão: 1.0.0  
> Status: Aprovado para Arquitetura  
> Autor: @legal (Assessoria Jurídica Sênior)  

Este documento estabelece as diretrizes jurídicas obrigatórias para o desenvolvimento técnico e operacional da plataforma **Reserva Serviços**, focando na total blindagem trabalhista (CLT), conformidade de dados (LGPD), proteção ao consumidor (CDC) e regras fiscais de pagamento.

> [!IMPORTANT]
> **Salvaguarda de Propriedade Intelectual e Proteção de Direitos Autorais:** O nome fantasia oficial do aplicativo é **Reserva Serviços**. Embora atue de forma hiperlocal com foco territorial nas torres residenciais do complexo "Reserva Raposo", a plataforma é independente e neutra. Fica terminantemente proibido o uso de fotos de fachada protegidas por direitos autorais, logomarcas oficiais do condomínio, marcas registradas da construtora ou qualquer outro ativo de propriedade intelectual protegida na interface de usuário (UI) e materiais de divulgação do app, evitando passivos criminais ou cíveis.

---

## 1. Blindagem Trabalhista e Prevenção de Vínculo Empregatício (CLT)

Para garantir que a relação entre a plataforma, o profissional e o morador seja estritamente de caráter autônomo (prestação de serviços), devemos mitigar sistematicamente os quatro pilares do vínculo empregatício (Art. 3º da CLT):

### A. Relação Morador vs. Profissional (Direito Doméstico - LC 150/2015)
*   **A Regra Legal:** A Lei Complementar nº 150/2015 determina que há vínculo de emprego doméstico (CLT) se o serviço for prestado de forma contínua por mais de 2 (duas) vezes por semana na mesma residência familiar.
*   **Trava Programática (Obrigatória no App):** 
    *   O algoritmo da plataforma **deve bloquear** que um morador específico contrate o mesmo profissional mais de 2 vezes na mesma semana.
    *   Caso o morador agende uma 3ª faxina na mesma semana, o sistema deve direcionar o chamado obrigatoriamente a outro profissional do catálogo.

### B. Relação Plataforma vs. Profissional (Modelo C2C de Intermediação Pura - Pessoa Física Autônoma)
*   **Não Exigência de MEI (Frictionless Onboarding):**
    *   Não exigiremos CNPJ MEI nem contrataremos CLT. O modelo jurídico adotado será o de **Intermediação Pura de Negócios C2C (Consumer-to-Consumer / Pessoa Física para Pessoa Física)**, sob a égide dos artigos 593 a 609 do Código Civil Brasileiro (Prestação de Serviços Autônomos).
    *   O contrato de serviço é firmado **diretamente** entre o Morador (contratante) e o Profissional (contratado). A plataforma atua unicamente como provedora de tecnologia e meio de pagamento.
*   **Não-Subordinação por Algoritmo de Matchmaking (Uber-Like):**
    *   O aplicativo operará por um modelo de matching dinâmico sob demanda (Uber-like). 
    *   Quando um chamado de serviço for aberto por um morador, a plataforma disparará o chamado para os profissionais disponíveis mais próximos. A aceitação é 100% facultativa e o profissional tem liberdade absoluta para aceitar ou ignorar, eliminando qualquer caráter de subordinação (indispensável para blindar contra CLT).

### C. Respaldo Jurídico Consolidado (Legislação e Precedentes Judiciais)
A decisão de operar sem exigir MEI e sem contratar CLT possui sólida fundamentação legal na legislação federal brasileira e na jurisprudência pacificada do Supremo Tribunal Federal (STF) e do Tribunal Superior do Trabalho (TST):

1.  **Artigo 442-B da CLT (Reforma Trabalhista - Lei nº 13.467/2017):**
    *   *O Texto da Lei:* "A contratação do autônomo, cumpridas por este todas as formalidades legais, com ou sem exclusividade, de forma contínua ou não, afasta a qualidade de empregado prevista no art. 3º desta Consolidação."
    *   *Aplicação Prática:* Esta é a nossa maior blindagem jurídica. A lei protege explicitamente o modelo de prestação de serviços por profissional autônomo (Pessoa Física), descaracterizando o vínculo empregatício desde que respeitada a autonomia de execução.
2.  **Artigos 593 a 609 do Código Civil Brasileiro (Contrato de Prestação de Serviços):**
    *   *O Texto da Lei:* Rege a prestação de serviços entre pessoas privadas, chancelando que cidadãos comuns contratem outros cidadãos de forma autônoma para serviços civis e domésticos eventuais, sem que isso gere passivos trabalhistas corporativos.
3.  **Artigo 1º, caput da Lei Complementar nº 150/2015 (Trabalho Doméstico):**
    *   *O Texto da Lei:* Define empregado doméstico como aquele que presta serviços de forma contínua, "por mais de 2 (dois) dias por semana". 
    *   *Aplicação Prática:* Nossa trava automática de agendamentos no app de até 2x por semana garante o estrito cumprimento da lei federal, impedindo a caracterização de habitualidade.
4.  **Tese de Repercussão Geral do STF - Tema 725 (RE 958.252) e Rcl 60.000+:**
    *   *A Decisão da Suprema Corte:* O STF declarou a licitude de toda e qualquer forma de divisão do trabalho e terceirização, inclusive sob a forma de plataformas tecnológicas de intermediação (gig economy). 
    *   *Precedente:* O STF tem sistematicamente cassado decisões da Justiça do Trabalho que tentam impor vínculo empregatício a plataformas digitais, firmando o entendimento de que estas atuam puramente como intermediadoras de serviços e meios de pagamento autônomos.

---

## 2. Governança de Dados Pessoais e Conformidade LGPD (Lei 13.709/2018)

A coleta de dados para fins de segurança e portaria no Reserva Raposo envolve o tratamento de dados pessoais comuns e dados de segurança (antecedentes). Devemos seguir rígidos padrões de minimização de dados (Art. 6º, III da LGPD):

### A. Coleta do Atestado de Antecedentes Criminais
*   **Base Legal:** Legítimo Interesse (Art. 7º, IX da LGPD) e Proteção da Vida/Segurança do morador (Art. 7º, VII).
*   **Regra de Armazenamento:**
    *   **Proibido** armazenar o arquivo PDF do atestado de antecedentes no banco de dados permanente da plataforma após a validação.
    *   **Fluxo de Verificação:** O profissional faz o upload do documento. Um operador (ou sistema automatizado de triagem) analisa a autenticidade e a ausência de registros impeditivos. Uma vez validado, o arquivo físico é **excluído permanentemente** do servidor, registrando-se no banco de dados apenas um booleano de status: `is_verified: true` com a data da verificação.

### B. Dados de Cadastro e Consentimento Ativo
*   **Opt-In Explícito:** No momento do cadastro, tanto moradores quanto profissionais devem marcar um checkbox ativo (não pré-selecionado) concordando com os Termos de Uso e Política de Privacidade de forma separada.
*   **Minimização:** Coletar estritamente o necessário para a operação e identificação na portaria (Nome, CPF, RG, celular, Bloco/Torre e Apartamento).

---

## 3. Estruturação Financeira e Split de Pagamento com Asaas Gateway

Adotaremos o gateway de pagamentos **Asaas** como parceiro financeiro oficial do projeto devido à baixíssima burocracia para credenciamento de contas digitais de pessoas físicas (CPFs), facilidade extrema de integração e custos reduzidos em split de PIX:

1. **O Fluxo C2C de Pagamentos:**
   * O Morador efetua o pagamento de R$ 100,00 via PIX ou Cartão de Crédito.
   * O gateway **Asaas** realiza o split em tempo real: **R$ 80,00** vão direto para a carteira digital do profissional autônomo (CPF) e **R$ 20,00** (comissão de intermediação de 20%) vão para a conta jurídica da plataforma.
2. **Mitigação Fiscal e Ausência de Retenção de INSS:**
   * Como a transação de serviço ocorre diretamente entre duas Pessoas Físicas (C2C), **não há retenção de INSS Patronal de 20%** pela startup, já que esta não é a tomadora ou contratante do serviço (a tomadora é a residência familiar).
   * A startup pagará impostos exclusivamente sobre a taxa de conveniência/intermediação (os R$ 20,00) através da emissão de NFS-e de intermediação tecnológica, protegendo o negócio de bitributação.
3. **Estratégia de Liquidez ("Dinheiro na Mão"):**
   * **Pagamentos via PIX:** Serão liquidados e divididos no mesmo instante. O profissional poderá sacar seu dinheiro imediatamente após a conclusão e liberação do morador.
   * **Pagamentos via Cartão:** Ficarão retidos pelo prazo padrão de 30 dias do gateway. Caso o profissional queira sacar antes, o app integrará a antecipação automática do Asaas, cobrando a respectiva taxa financeira diretamente da fatia do prestador.

---

## 4. Acesso Condominial: Modelo de Portaria Autônoma (Sem Integração de Síndicos)

Para acelerar o go-live e eliminar barreiras burocráticas, a plataforma **não realizará integração oficial com os sistemas administrativos ou conselhos do Reserva Raposo**. A entrada do prestador será liberada pelo morador de forma autônoma como um "visitante comum":

*   **Recurso de "Autorização Rápida" (Obrigatório UX/DEV):**
    *   No momento do match e confirmação do serviço, a tela do Morador exibirá um card com os dados do profissional: Foto, Nome Completo, RG e CPF.
    *   O aplicativo trará um botão destacado: **"Copiar Dados para Portaria"**.
    *   Ao clicar, copia-se um texto estruturado para a área de transferência do usuário, facilitando que o morador cole e autorize o prestador instantaneamente no aplicativo de portaria do condomínio (ex: Kiper, Lello) ou via chat de WhatsApp da portaria:
        > *"Autorizo a entrada de [Nome do Profissional], RG [RG], CPF [CPF], hoje no período das [Horário] para prestação de serviços no meu apartamento."*

---

## 5. Relação de Consumo e Limite do Fundo de Garantia (CDC)

De acordo com o Código de Defesa do Consumidor (CDC), a plataforma responde de forma solidária pela qualidade dos serviços intermediados. Para limitar o risco de passivos financeiros altos decorrentes de quebras ou danos:

1. **Limite da Indenização de Avarias:** Nos Termos de Uso do Morador, constará uma cláusula clara delimitando que o Fundo de Garantia Mutualista cobrirá danos materiais acidentais comprovados até o teto máximo de **R$ 1.500,00 por sinistro**.
2. **Exclusão de Bens de Alto Valor:** O morador declara no momento do agendamento que retirou do ambiente de trabalho do profissional joias, dinheiro em espécie, eletrônicos portáteis de alto valor e documentos confidenciais. A plataforma fica isenta de reembolso sobre itens não declarados ou cuja guarda cabia exclusivamente ao contratante.
3. **Procedimento de Sinistro:** O morador tem o prazo decadencial de até **24 horas** após a conclusão do serviço para abrir uma contestação na plataforma com fotos e notas fiscais do item danificado.

---

## 6. Regras Adicionais de Conduta e Operação Condominial

Para garantir a harmonia com as regras internas do megacomplexo Reserva Raposo e proteger a liquidez do profissional autônomo, estabelecemos as seguintes regras operacionais:

### A. Horários de Silêncio do Regimento Interno
*   **Regra Condominial:** Serviços ruidosos (como furos de furadeiras, marteladas ou reformas leves contratadas pelo "Marido de Aluguel") devem respeitar rigidamente os horários do condomínio.
*   **Trava no App:** O aplicativo bloqueará agendamentos de serviços do tipo "Marido de Aluguel" ou reparos ruidosos fora do período das **09:00 às 17:00 em dias úteis** e **09:00 às 12:00 aos sábados**, proibindo-os completamente aos domingos e feriados.

### B. Política de "No-Show" e Cancelamento Tardio (Proteção ao Prestador)
*   **Cancelamento pelo Morador:** 
    *   Se o morador cancelar com menos de **12 horas** de antecedência ou não estiver no apartamento para dar acesso ao profissional (No-Show do Morador), será cobrada uma taxa de cancelamento tardio de **R$ 30,00**. 
    *   Esse valor será integralmente repassado à carteira do profissional via gateway Asaas para compensar o tempo de agenda reservada.
*   **Cancelamento pelo Profissional:**
    *   Se o profissional der No-Show, o morador é reembolsado integralmente (100%) no ato. O profissional recebe uma advertência algorítmica. Três faltas injustificadas geram a suspensão da conta para manter o alto padrão de confiança.

### C. Código de Conduta B2C/C2C
*   **Proibição de Terceirização:** O profissional que aceitou o chamado deve prestar o serviço pessoalmente. É terminantemente proibido enviar parentes ou terceiros não cadastrados e não triados no app, sob pena de bloqueio imediato (medida essencial para garantir a segurança da portaria).
*   **Desvio de Plataforma:** Tentar fechar serviços adicionais "por fora" da plataforma é infração grave, acarretando exclusão permanente.

### D. Prevenção de Fraudes de Pagamento (Chargebacks)
*   **Garantia do Profissional:** Se um morador agir de má-fé e contestar a cobrança do cartão de crédito no banco após a prestação do serviço (Chargeback), o profissional **não sofrerá prejuízo**. A plataforma assumirá o prejuízo financeiro da taxa do gateway e cobrirá os 80% do profissional através do Fundo de Garantia Mutualista.
*   **Cobrança de Débito:** A plataforma suspenderá a conta do morador e acionará os meios administrativos de cobrança extrajudicial do débito (notificação de cobrança e órgãos de proteção ao crédito).

### E. Isenção de Nexo Causal por Sinistros Físicos (Acidentes Residenciais)
*   **Ausência de Nexo Causal:** Sob os termos dos artigos 186 e 927 do Código Civil, por ser uma intermediadora pura C2C que conecta indivíduos civis de forma eventual, a plataforma não detém responsabilidade civil sobre acidentes físicos de trabalho sofridos pelo autônomo dentro da unidade residencial do morador.
*   **Responsabilidade Local:** A obrigação de manter um ambiente de trabalho seguro e livre de perigos ocultos (fiação exposta sem aviso, escadas instáveis, piso molhado sem sinalização) é exclusiva do morador contratante. A plataforma incluirá cláusula específica de isenção mútua nos Termos de Uso.

### F. Conformidade Fiscal DIMP (Declaração de Operações de Meios de Pagamento)
*   **Transparência com SEFAZ:** O gateway Asaas é obrigado a declarar todas as transações de split de pagamento aos fiscos estaduais e federais através da Declaração de Informações de Meios de Pagamento (DIMP).
*   **Configuração de Split:** Para evitar autuações tributárias por ocultação de receita, nossa API de integração registrará no gateway o CPF do prestador como o beneficiário final de cada 80% splitado. Desta forma, a Receita Federal auditará com precisão que apenas a fatia dos 20% constitui o faturamento tributável da plataforma.

---

## 7. Resumo de Requisitos para o Time de Desenvolvimento (DEV/ARCHITECT)

| Módulo do App | Requisito Legal Técnico | Objetivo de Compliance |
| :--- | :--- | :--- |
| **Agendamento** | Trava de frequência máxima de 2x/semana por dupla (morador/profissional). | Evitar Vínculo Empregatício Doméstico. |
| **Agendamento** | Trava de horários ruidosos (Marido de Aluguel) das 9h-17h (úteis) / 9h-12h (sábados). | Respeito à Lei do Silêncio e Regimento Interno. |
| **Agendamento** | Botão "Copiar Dados para Portaria" formatado para Clipboard. | Facilitar a liberação de visitantes pelo morador. |
| **Cadastro Profissional** | Upload de atestado com deleção física de arquivo após validação `is_verified`. | Conformidade LGPD e segurança de dados. |
| **Pagamentos (API Asaas)** | Integração de Split de Pagamento PIX e cartão, com suporte a antecipação. | Prevenir bitributação, garantir split financeiro. |
| **Checkout** | Retenção e repasse de R$ 30,00 de taxa por cancelamento tardio do morador. | Proteger o sustento e tempo do profissional autônomo. |
| **Checkout** | Consentimento de Termos de Uso em checkboxes distintos e ativos. | Consentimento válido sob a LGPD e CDC. |
