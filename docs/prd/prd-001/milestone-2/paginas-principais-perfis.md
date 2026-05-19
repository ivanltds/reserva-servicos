# PRD Complementar — Páginas Principais dos Perfis
> Documento: `docs/prd/prd-001/milestone-2/paginas-principais-perfis.md`  
> Versão: 1.0.0  
> Status: Aprovado para DEV  
> Autor: @ba (via @maestro)  
> Data: 2026-05-19

---

## 1. Contexto e Objetivo

Com o Milestone 1 (Onboarding) concluído e validado, o Milestone 2 avança para as **páginas operacionais de cada perfil** — as telas que os usuários usarão no dia a dia após o cadastro.

O operador definiu as jornadas completas de **Prestador**, **Cliente** e **Gestor (expandido)**, incluindo o fluxo de pagamento PIX e o board Kanban de serviços.

**Escopo imediato:** Página inicial do Prestador (entrega prioritária deste sprint).

---

## 2. Análise de Valor — Jornadas dos Perfis

### 2.1 Prestador — Página Inicial (PRIORIDADE MÁXIMA)

**Problema resolvido:** Prestador aprovado não tinha para onde ir após o onboarding. Tela em branco = abandono.

**Jornada:**
1. Prestador vê suas **habilidades configuradas** (vindas do cadastro)
2. Vê **lista de serviços disponíveis** compatíveis com suas habilidades
3. Pode **configurar chave PIX** para recebimento (CPF/celular/email/aleatória)
4. Seleciona um serviço → status muda para "interesse manifestado"
5. Gestor aprova → prestador recebe endereço completo + horário
6. **Lista some** enquanto há serviço ativo (foco total no serviço em andamento)
7. Após conclusão, lista reaparece

**Regras de Negócio:**
- Só serviços com status "Pagamento aprovado" aparecem na lista
- Filtro automático por habilidades do prestador
- Prestador só pode ter 1 serviço ativo por vez
- Chave PIX obrigatória antes de poder selecionar serviços
- Endereço só revelado após aprovação do gestor (segurança)

**KPIs de sucesso:**
- Taxa de manifestação de interesse > 60%
- Tempo médio para manifestar interesse < 3 minutos
- Taxa de configuração de PIX no primeiro acesso > 85%

---

### 2.2 Cliente — Página Principal (Próximo Sprint)

**Jornada:**
1. Botão principal "Solicitar Serviço" → abre modal multi-step
2. **Step 1:** Tipo de serviço (lista/cards visuais)
3. **Step 2:** Detalhes (descrição, bairro, data preferida, observações)
4. **Step 3:** Confirmação e resumo
5. **Step 4:** Página de pagamento (chave PIX do gestor + instruções)
6. Serviço aparece na lista com status: "Aguardando confirmação de pagamento"
7. Após confirmação manual do gestor: "Procurando profissional próximo de você"
8. Após prestador selecionado: "Profissional a caminho" (com dados do prestador)

**Status do serviço visível ao cliente:**
- 🟡 Aguardando confirmação de pagamento
- 🔵 Procurando profissional próximo
- 🟢 Profissional a caminho

---

### 2.3 Gestor — Módulos Expandidos (Sprint Seguinte)

#### Módulo Pagamentos
- Configuração da chave PIX aleatória (para receber dos clientes)
- Histórico de pagamentos recebidos
- Status de confirmações pendentes

#### Módulo Gerenciar Serviços (Kanban)
**13 Status do Ciclo de Vida do Serviço:**

| # | Status | Ator responsável |
|---|--------|-----------------|
| 1 | Solicitado (aguardando pagamento) | Sistema |
| 2 | Solicitado (pagamento aprovado) | Gestor |
| 3 | Aguardando prestador | Sistema |
| 4 | Aguardando prestador (selecionado - pendente confirmação) | Prestador |
| 5 | Agendado | Gestor |
| 6 | Agendado (prestador a caminho) | Prestador |
| 7 | Prestador no local | Prestador |
| 8 | Serviço em execução | Prestador |
| 9 | Serviço executado (aguardando avaliação) | Cliente |
| 10 | Serviço executado (aprovado) | Cliente |
| 11 | Serviço executado (prestador aguardando repasse) | Gestor |
| 12 | Serviço executado (repasse realizado) | Gestor |
| 13 | Serviço finalizado | Sistema |

**Card de Serviço (Kanban):**
- Tipo de serviço (ícone + nome)
- Bairro de execução
- Valor do serviço
- Prestador alocado (vazio até seleção)
- Tempo estimado de execução

**Lista de Prestadores Ativos para Alocação:**
- Filtrada por habilidades compatíveis com o serviço
- Mostra nome, avaliação e distância estimada

---

## 3. Schema de Banco de Dados (Novos Campos Necessários)

### Tabela: `service_providers` (adicionar)
```sql
-- Configuração de chave PIX do prestador
pix_key_type  TEXT  -- 'cpf' | 'phone' | 'email' | 'random'
pix_key       TEXT  -- valor da chave
```

### Nova Tabela: `service_requests`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
client_id       UUID REFERENCES profiles(id)
provider_id     UUID REFERENCES service_providers(id) -- nullable até alocação
service_type    TEXT NOT NULL  -- tipo do serviço
neighborhood    TEXT NOT NULL  -- bairro
address         TEXT           -- endereço completo (só revelado ao prestador após aprovação)
scheduled_at    TIMESTAMPTZ    -- data/hora agendada
duration_hours  NUMERIC        -- duração estimada
value           NUMERIC NOT NULL  -- valor do serviço
status          TEXT NOT NULL DEFAULT 'pending_payment'
pix_key         TEXT           -- chave PIX do gestor para o cliente pagar
notes           TEXT           -- observações do cliente
created_at      TIMESTAMPTZ DEFAULT now()
updated_at      TIMESTAMPTZ DEFAULT now()
```

### Tabela: `gestor_config` (nova)
```sql
id         UUID PRIMARY KEY DEFAULT gen_random_uuid()
pix_key    TEXT  -- chave PIX aleatória do gestor
created_at TIMESTAMPTZ DEFAULT now()
updated_at TIMESTAMPTZ DEFAULT now()
```

---

## 4. Priorização de Entregas

| Entrega | Sprint | Dependência |
|---------|--------|-------------|
| ✅ Página inicial do Prestador | Sprint 2 (atual) | Nenhuma — implementar agora |
| Página principal do Cliente | Sprint 3 | Tabela service_requests |
| Módulo Pagamentos Gestor | Sprint 3 | Tabela gestor_config |
| Módulo Kanban Gestor | Sprint 4 | Tabela service_requests completa |
| Integração Asaas / Split | Sprint 5 | API Asaas + estrutura financeira |

---

## 5. Decisões de Design — @ux-ui

- **Paleta do prestador:** Amber Gold (`#f59e0b`) — já definido no design system
- **Mesma estrutura visual** da página do cliente (nav + badge + cards)
- **Estado sem PIX configurado:** Banner de alerta âmbar pedindo configuração antes de ver serviços
- **Estado com serviço ativo:** Card gigante do serviço em andamento substitui a lista
- **Estado online/offline:** Toggle para o prestador indicar disponibilidade

---

## 6. Exceções (Backlog Futuro)

As seguintes exceções serão tratadas em sprints futuros:
- Serviço cancelado pelo cliente
- Serviço mal executado / sinistro
- Prestador não encontrou o endereço
- Cliente não localizado
- Serviço recusado pelo prestador
- Serviço diferente do proposto
- Serviço adicional imprevisto
- Acidente durante execução

---

_Documento gerado pelo @ba e validado pelo @maestro._
