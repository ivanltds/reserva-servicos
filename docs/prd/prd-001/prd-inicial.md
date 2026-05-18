# PRD-001: Plataforma Reserva Serviços On-Demand
> Versão: 2.0.0  
> Status: Aprovado para Engenharia  
> Autor: @ba (Analista de Negócios) & @legal (Assessor Jurídico Sênior)  

---

## 1. Contexto e Problema de Negócio

> [!IMPORTANT]
> **Salvaguarda de Marca e Direitos Autorais:** A plataforma é batizada oficialmente como **Reserva Serviços**. Ela foi concebida para atender as necessidades demográficas do megacomplexo residencial de apartamentos "Reserva Raposo", mas funciona como uma iniciativa 100% independente. O app **não utiliza** marcas registradas, imagens oficiais, fotografias de fachada protegidas ou qualquer logotipo do condomínio Reserva Raposo em sua interface com o usuário, mitigando qualquer passivo judicial referente à propriedade intelectual.

O megacomplexo residencial "Reserva Raposo" é a base territorial de atuação, sendo considerado o maior condomínio planejado da América Latina, localizado na Zona Oeste de São Paulo. Suas proporções são equivalentes a uma cidade média:
- **124 torres** residenciais de apartamentos.
- Entre **20.000 e 22.000 apartamentos**.
- Uma população estimada em **80.000 moradores**.

### O Problema:
1.  **Desconfiança e Falta de Verificação:** Colocar prestadores desconhecidos dentro de apartamentos gera alta ansiedade. Atualmente, os moradores buscam indicações informais em grupos de WhatsApp saturados, sem qualquer checagem de antecedentes ou confiabilidade.
2.  **Cansaço e Custos Logísticos:** Prestadores de serviços perdem horas no trânsito e gastam fortunas de passagens para se deslocar pela cidade de São Paulo. A alta densidade do Reserva Raposo permite que profissionais trabalhem a pé, fazendo de 3 a 4 diárias em torres vizinhas sem gastar R$ 1,00 de condução.
3.  **Retenção Financeira Elevada:** Aplicativos de serviços tradicionais demoram de 15 a 30 dias para repassar o saldo aos profissionais ou cobram taxas absurdas de adiantamento, gerando atrito para quem precisa de liquidez diária.

---

## 2. Público-Alvo e Personas

### A. O Morador (Cliente Final)
*   **Perfil:** Casais jovens, famílias de classe média ou profissionais ocupados residentes no complexo Reserva Raposo que necessitam de suporte doméstico e reparos, mas valorizam segurança e tempo.
*   **Dores Principais:** Medo de furto, desconforto com prestadores sem triagem, falta de indicação rápida e falha na execução de serviços de reparo.

### B. O Prestador de Serviço (Profissional Autônomo)
*   **Perfil:** Diaristas, passadeiras e técnicos de reparo (eletricistas, encanadores, maridos de aluguel) residentes no complexo ou bairros limítrofes da Rodovia Raposo Tavares.
*   **Dores Principais:** Tempo excessivo perdido no trânsito, cansaço físico de viagens distantes e taxas abusivas de antecipação financeira de plataformas digitais.

---

## 3. Proposta de Valor Única (UVP)

> **Para o Morador:** *"Contrate profissionais rigorosamente verificados do seu próprio condomínio, libere a entrada em um clique e pague com segurança direto no app."*

> **Para o Profissional:** *"Trabalhe sem gastar condução, faça mais serviços por dia a passos de caminhada e receba seu pagamento via PIX na hora, sem taxas ou retenção."*

---

## 4. Estrutura Jurídica e Trabalhista (Modelo C2C)

Adotamos a **Intermediação Pura de Negócios C2C (Consumer-to-Consumer / Pessoa Física para Pessoa Física)** como modelo operacional e jurídico regulado pelos artigos 593 a 609 do Código Civil Brasileiro:

1.  **Ausência de Exigência de MEI e CLT:** Não exigiremos CNPJ MEI nem firmaremos contratos CLT com prestadores. Isso elimina barreiras e burocracia de cadastro, promovendo inclusão social.
2.  **Relação Comercial Direta (C2C):** O contrato de serviço é firmado diretamente entre o Morador (tomador) e o Profissional Autônomo (prestador). A plataforma atua estritamente como provedora de tecnologia e meio de pagamento.
3.  **Trava Eletrônica Antivínculo Trabalhista (LC 150/2015):** 
    *   *Obrigação Técnico:* Para afastar a habitualidade doméstica, o aplicativo possui uma trava eletrônica inegociável: **o algoritmo bloqueia que o mesmo morador contrate o mesmo profissional mais de 2 vezes na mesma semana**. O 3º agendamento semanal é direcionado obrigatoriamente a outro profissional do catálogo.
4.  **Uber-Like Matchmaking:** O agendamento funciona via transmissão sob demanda para os profissionais ativos e triados mais próximos. A aceitação é facultativa e livre de punições, afastando qualquer indício de subordinação algoritma na Justiça do Trabalho (Respaldado pela Reforma Trabalhista Art. 442-B da CLT).

---

## 5. Estrutura Financeira, Tributária e Split (Asaas Gateway)

Utilizaremos o gateway **Asaas** como nossa infraestrutura oficial de Banking-as-a-Service para automatizar pagamentos e splits em CPFs de autônomos de forma segura:

### A. Fluxo de Split e Monetização
*   O Morador paga R$ 100,00 por um agendamento.
*   A API do gateway Asaas divide o valor na liquidação: **R$ 80,00** entram diretamente na conta digital do profissional e **R$ 20,00** (20% de taxa da plataforma) são destinados à conta da startup.

### B. Absorção de Taxas como Diferencial Master 🚀
*   **O Benefício:** Para atrair profissionais altamente qualificados e garantir o slogan *"Dinheiro na Mão sem Taxas Ocasionais"*, **a plataforma absorverá 100% das taxas de processamento financeiro do Asaas (PIX ou Cartão)** dentro da sua própria comissão de 20%. O profissional recebe os 80% cheios e redondos em sua conta bancária sem qualquer desconto.
*   *Simulação Financeira (PIX):*
    *   Valor pago pelo cliente: R$ 100,00.
    *   Taxa Asaas (PIX Split): R$ 0,99 (absorvido pela plataforma).
    *   Repasse líquido do profissional: **R$ 80,00** (exatos 80%).
    *   Comissão líquida da plataforma: **R$ 19,01**.

### C. Tributação e Blindagem de Bitributação
*   A startup emite NFS-e de intermediação tecnológica **apenas sobre os 20% da sua receita real** (R$ 20,00). 
*   No regime Simples Nacional (Anexo III), a alíquota inicial é de **6%**, reduzindo nossa despesa de imposto para apenas **R$ 1,20 por transação**.
*   Como a operação é C2C, **não há retenção na fonte de INSS Patronal de 20%** pela startup, já que esta não figura como tomadora do serviço.

---

## 6. Escopo das Funcionalidades do MVP (Mínimo Produto Viável)

### A. Aplicativo do Morador (Web App Responsivo Mobile-First)
1.  **Agendamento Exclusivo de 3 Categorias de Serviços:**
    *   *Faxina/Limpeza* (agendamento por porte de imóvel).
    *   *Passadoria* (contratação por pacotes de horas).
    *   *Marido de Aluguel* (seleção rápida de pequenos consertos elétricos, hidráulicos ou montagem leve).
2.  **Matchmaking e Cadastro Dinâmico:** Modelo Uber-like com match instantâneo baseado em disponibilidade.
3.  **Checkout de Segurança:** Pagamento via PIX ou Cartão com saldo retido em conta de garantia do Asaas até a finalização do serviço.
4.  **Liberação de Entrada ("Autorização Rápida de Portaria"):**
    *   *Funcionalidade Clipboard:* Como não integraremos fisicamente com as portarias, o app trará o botão destacado **"Copiar Dados para Portaria"**. Ao clicar, copia-se um texto estruturado contendo a Foto, Nome Completo, RG, CPF e Horário do Prestador, permitindo que o morador simplesmente cole e autorize o visitante no WhatsApp ou app oficial da portaria da sua torre em segundos.
5.  **Desistência e Taxa de Cancelamento Tardio:**
    *   Se o morador cancelar com menos de **12 horas** de antecedência ou der no-show quando o profissional chegar, o app cobrará uma taxa fixa de **R$ 30,00** que será repassada integralmente ao prestador via Asaas para indenizar o tempo perdido.

### B. Aplicativo do Profissional (Mobile-First)
1.  **Cadastro e Onboarding com Foco em Confiança:**
    *   Campos para upload de selfie, documento oficial (RG/CPF) e Atestado de Antecedentes Criminais.
    *   *Segurança LGPD:* O PDF de antecedentes é analisado externamente pelo administrador. Uma vez validado, o arquivo físico é **deletado fisicamente do servidor**, mantendo apenas o registro booleano `is_verified: true` no banco para resguardar a startup contra vazamento de dados sensíveis.
2.  **Lista de Matches Dinâmicos:** Notificação sonora e pop-up para aceitar serviços no complexo.
3.  **Painel Financeiro Asaas integrado ("Saque Instantâneo"):**
    *   Botão gigante de saque PIX após o morador clicar em *"Liberar Pagamento"*.
    *   Para pagamentos in cartão de crédito (prazo de 30 dias), o app ofertará a antecipação automática de repasses através das taxas padrão de adiantamento do próprio Asaas.

---

## 7. Regras Condominiais e Operação Local

*   **Trava da Lei do Silêncio e Regimento:** O aplicativo travará automaticamente as opções de agendamento de serviços ruidosos (Marido de Aluguel) exclusivamente em dias úteis das **09h às 17h** e sábados das **09h às 12h**, bloqueando domingos e feriados.
*   **Código de Conduta Rígido:** 
    *   *Sem Substituições:* O profissional que aceitou o chamado deve prestar o serviço pessoalmente. O envio de terceiros não autorizados ou parentes acarreta banimento imediato.
    *   *Prevenção de Desvios:* Tentativas de fechar serviços fora do aplicativo acarretam expulsão permanente do catálogo da plataforma.

---

## 8. Políticas de Sinistros, Danos Materiais e Defesa de Chargebacks

### A. Gestão de Acidentes e Sinistros
*   **Danos Materiais (Fundo Mutualista):** Destinaremos **1,5% de toda a comissão** retida para uma reserva interna de segurança. Quebras acidentais de até **R$ 1.500,00** serão indenizadas amigavelmente em até 48h pela plataforma direto do fundo, sem acionar seguradoras tradicionais burocráticas com franquias altas.
*   **Isenção de Acidentes Físicos:** Contratos e Termos de Uso conterão cláusulas explícitas de isenção de nexo causal por quedas ou acidentes físicos dos prestadores, de total responsabilidade civil do morador (garantia de ambiente de trabalho seguro - Art. 186 CC).

### B. Gestão e Defesa Avançada de Chargebacks (Fraudes de Pagamento)
*   **O Risco:** Morador de má-fé contesta a diária no cartão de crédito após a execução do serviço.
*   **A Defesa da Plataforma (Mecanismo de Recurso):** 
    *   Para reverter e vencer a disputa de chargeback junto ao gateway Asaas e emissores de cartão, o sistema registrará de forma sistemática um **Log Digital de Evidências** contendo:
        1.  *Geolocalização (GPS):* Registro de localização em tempo real no momento do Check-in ("Iniciar Serviço") e Check-out ("Finalizar Serviço") do profissional.
        2.  *Evidências de Execução:* Fotos do serviço concluído inseridas pelo profissional ao finalizar a diária.
        3.  *Atividades do Cliente:* Histórico de aprovação de repasse e chat log do WhatsApp.
        4.  *Registro de Portaria:* Cópia dos logs de solicitação de liberação rápida efetuados pelo morador.
    *   *A Garantia do Prestador:* O Fundo Mutualista cobrirá imediatamente os R$ 80,00 do profissional para que ele nunca seja prejudicado, enquanto a startup assume a disputa formal apresentando o Log Digital de Evidências para reaver os fundos.

---

## 9. Requisitos Técnicos de Desenvolvimento (DEV/ARCHITECT)

| Recurso Técnico | Detalhamento Legal/Operacional | Módulo Afetado |
| :--- | :--- | :--- |
| **Trava Frequência** | Bloqueio de agendamento se dupla morador/profissional exceder 2 diárias na semana. | Módulo de Agendamento |
| **Trava Ruídos** | Bloqueio de horários ruidosos fora de 9-17h (úteis) / 9-12h (sábados) para reparos. | Módulo de Agendamento |
| **Quick Visitor Portaria** | Função clipboard copiando dados formatados do profissional. | Tela de Match do Morador |
| **Deleção Física Antecedentes** | Remoção automática de arquivo PDF pós-validação (apenas booleano mantido). | Banco de Dados & Admin |
| **Split Asaas** | Integração da API de Split do Asaas para CPFs autônomos, cobrindo taxas na margem. | API Financeira / Checkout |
| **Log de Evidências** | Registro sistemático de GPS, timestamps, e upload de foto final de execução. | Backend e App Profissional |
| **Taxa de Cancelamento** | Cobrança automática de R$ 30 por cancelamentos de moradores com <12h. | Checkout e Financeiro |
