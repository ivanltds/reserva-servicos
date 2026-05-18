# Contexto do Projeto — Reserva Serviços
> ÍNDICE CENTRAL. Máximo 300 linhas.
> Todo agente lê ao iniciar. Todo agente atualiza ao criar arquivos.

## Projeto
**Reserva Serviços (Plataforma Hiperlocal de Serviços Residenciais)**

## Objetivo de Negócio
Criar uma plataforma sob demanda inspirada no modelo da Parafuzo, mas com foco exclusivo e hiperlocal no megacomplexo residencial **Reserva Raposo** (mais de 100 torres de apartamentos). O objetivo é oferecer serviços residenciais diversos (limpeza, pequenos reparos, manutenção, passadoria) com um forte pilar de **confiança, segurança e validação local dos profissionais**, aproveitando a altíssima densidade demográfica do complexo para otimizar a logística e gerar alta rentabilidade.

> [!IMPORTANT]
> **Salvaguarda de Propriedade Intelectual (Marcas e Direitos Autorais):** O aplicativo é oficialmente denominado **Reserva Serviços**. Embora atenda de forma hiperlocal as demandas do complexo habitacional "Reserva Raposo", a plataforma é independente e **não utiliza** marcas registradas, imagens oficiais, logomarcas ou qualquer ativo proprietário de autoria do empreendimento ou de sua construtora em sua UI, operando como intermediadora neutra C2C.

## Stack
- Frontend  : Next.js (React / App Router / Vanilla CSS / Design Premium)
- Backend   : Supabase (Edge Functions / PostgreSQL / Auth / Realtime)
- Banco     : PostgreSQL (Supabase)
- Infra     : Supabase Host / Static Web App (Vercel/Netlify/Vite)
- Testes    : Playwright / Jest (TDD)

## Estrutura de Pastas
| Pasta                       | Propósito                                  |
|-----------------------------|--------------------------------------------|
| .gemini/agents/             | Definição dos agentes                      |
| .gemini/melhoria-continua/  | Aprendizados incrementais por agente       |
| docs/contexto-projeto.md    | Este índice central                        |
| docs/prd/                   | PRDs por demanda                           |
| docs/arquitetura/           | Documentação arquitetural                  |
| docs/design-system/         | Design system                              |
| docs/deploys/               | Histórico de deploys                       |
| src/app/                    | Estrutura de rotas e páginas do Next.js    |
| src/components/             | Componentes de interface atômicos React    |

## PRDs
| ID      | Nome                                        | Status       | Fase Atual   |
|---------|---------------------------------------------|--------------|--------------|
| PRD-001 | Plataforma Reserva Serviços On-Demand       | Aprovado     | EXPERIÊNCIA  |
 
## Arquivos Registrados
| Arquivo                                    | Responsável | Descrição                |
|--------------------------------------------|-------------|--------------------------|
| GEMINI.md                                  | Sistema     | Instruções globais       |
| README-AGENTS.md                           | Sistema     | Guia de uso              |
| .gemini/settings.json                      | Sistema     | Config do Gemini CLI     |
| .gemini/agents/maestro.md                  | Sistema     | Orquestrador             |
| .gemini/agents/ba.md                       | Sistema     | Analista de negócios     |
| .gemini/agents/legal.md                    | Sistema     | Assessoria Jurídica      |
| .gemini/agents/ux-ui.md                    | Sistema     | Designer UX/UI           |
| .gemini/agents/architect.md                | Sistema     | Arquiteto                |
| .gemini/agents/dev.md                      | Sistema     | Desenvolvedor            |
| .gemini/agents/qa.md                       | Sistema     | QA                       |
| .gemini/agents/devops.md                   | Sistema     | DevOps                   |
| docs/contexto-projeto.md                   | Sistema     | Índice central           |
| docs/prd/prd-001/prd-inicial.md           | @ba         | PRD de Negócios Consolidado v2.0.0 |
| docs/prd/prd-001/plano-entregas-001.md     | @maestro    | Plano de Entregas e Fases do MVP |
| docs/prd/prd-001/milestone-1/analise-valor-001.md | @ba         | Análise de Valor e Unit Economics |
| docs/prd/prd-001/milestone-1/plano-implementacao-fase-1.md | @architect  | Plano de Implementação Técnico da Fase 1 e Fundações |
| docs/prd/prd-001/milestone-1/plano-detalhado-milestone-1.md | @architect  | Plano de Execução Diária do Milestone 1 (Sprint 1) |
| docs/prd/prd-001/milestone-1/especificacao-testes-milestone-1.md | @qa         | Especificação de Cenários de Testes BDD (Gherkin) |
| docs/prd/prd-001/milestone-1/relatorio-qa-fase-1.md | @qa         | Relatório de Garantia de Qualidade (QA) - Milestone 1 Onboarding |
| docs/prd/prd-001/milestone-1/architect-validation-fase-1.md | @architect  | Validação e Parecer Arquitetural do Milestone 1 |
| docs/prd/prd-001/milestone-1/ba-validation-fase-1.md | @ba         | Relatório de Análise de Valor e Homologação do BA |
| docs/prd/prd-001/milestone-1/legal-validation-fase-1.md | @legal      | Relatório de Auditoria e Conformidade Jurídica do Legal |
| docs/prd/prd-001/milestone-2/lp-comercial-especificacao.md | @ba        | Especificação de Negócios da Landing Page Comercial Geral |
| docs/legal/compliance-legal-prd-001.md     | @legal      | Diretrizes de compliance trabalhista, LGPD e Operação |
| docs/legal/termos-de-uso.md                | @legal      | Termos de Uso e Serviço da Plataforma Reserva Serviços |
| docs/legal/politica-privacidade.md         | @legal      | Política de Privacidade e Proteção de Dados da Plataforma |
| docs/arquitetura/arquitetura-atual.md      | @architect  | Arquitetura de Software Modular com Web Components e Supabase |
| docs/arquitetura/plano-refatoracao-next.md | @architect  | Plano de Refatoração e Transição Completa para Next.js (React + App Router) |
| docs/design-system/design-system.md        | @ux-ui      | Design System e Jornadas dos 4 Perfis do MVP |
| docs/design-system/milestone-1-ux.md       | @ux-ui      | Especificação de UX do Milestone 1 - Onboarding |
| next.config.js                             | @architect  | Configuração de compatibilidade ESM do Next.js |
| src/services/supabase.js                   | @dev        | Cliente Supabase local e funções de integração e triagem |
| src/contexts/AuthContext.js                | @dev        | Provedor de contexto global de autenticação e perfis de banco |
| src/utils/formatters.js                    | @dev        | Formatadores reativos premium de strings (CPF, CEP, Telefone) |
| src/utils/validators.js                    | @dev        | Validadores estruturais para CPF e Email de profissionais |
| src/app/globals.css                        | @dev        | CSS Global do design system contendo os tokens luxo Obsidian e Emerald |
| src/app/layout.js                          | @dev        | Layout geral root do Next.js com carregamento de estilos e AuthProvider |
| src/app/page.js                            | @dev        | Página inicial do Resident Hub contendo o estimador e o wizard onboarding |
| src/app/login/page.js                      | @dev        | Página de autenticação reativa com redirecionamento baseado em roles |
| src/app/gestor/painel/page.js              | @dev        | Painel de controle gestor com triagem segura e expurgo biométrico (LGPD) |
| src/components/ui/Button.js                | @dev        | Componente de botão reutilizável com estados e variantes premium |
| src/components/ui/Input.js                 | @dev        | Componente de campo de entrada reativo com feedback de erro e validações |
| src/components/ui/Badge.js                 | @dev        | Distintivos semânticos polidos do design system para status |
| src/components/ui/Modal.js                 | @dev        | Modais translúcidos com efeito de desfoque backdrop |
| src/components/shared/ClipboardCard.js     | @dev        | Card de liberação rápida para portaria de megacomplexos |
| jest.config.js                            | @qa         | Configuração do Jest para testes unitários com ES Modules |
| playwright.config.js                      | @qa         | Configuração do Playwright para testes de navegador E2E |
| tests/unit/formatters.test.js              | @qa         | Suite de testes unitários do Jest para formatadores |
 
## Última Atualização
- Data    : 2026-05-18
- Por     : @dev & @architect
- Motivo  : Conclusão completa da refatoração para Next.js (App Router). Criação de todas as páginas reativas (Resident Hub, Login e Painel Gestor), componentes atômicos reutilizáveis, provedor de autenticação em tempo real, utilitários de formatação reativa e expurgo seguro, em estrita conformidade com as diretrizes do GEMINI.md.