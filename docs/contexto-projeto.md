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
- Frontend  : HTML / Vanilla CSS / JavaScript (Design Premium e Responsivo)
- Backend   : Supabase (Edge Functions / PostgreSQL / Auth / Realtime)
- Banco     : PostgreSQL (Supabase)
- Infra     : Supabase Host / Static Web App
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
| docs/prd/prd-001/analise-valor-001.md      | @ba         | Análise de Valor e Unit Economics |
| docs/prd/prd-001/plano-entregas-001.md     | @maestro    | Plano de Entregas e Fases do MVP |
| docs/prd/prd-001/plano-implementacao-fase-1.md | @architect  | Plano de Implementação Técnico da Fase 1 e Fundações |
| docs/prd/prd-001/plano-detalhado-milestone-1.md | @architect  | Plano de Execução Diária do Milestone 1 (Sprint 1) |
| docs/prd/prd-001/especificacao-testes-milestone-1.md | @qa         | Especificação de Cenários de Testes BDD (Gherkin) |
| docs/legal/compliance-legal-prd-001.md     | @legal      | Diretrizes de compliance trabalhista, LGPD e Operação |
| docs/arquitetura/arquitetura-atual.md      | @architect  | Arquitetura de Software Modular com Web Components e Supabase |
| docs/design-system/design-system.md        | @ux-ui      | Design System e Jornadas dos 4 Perfis do MVP |
| docs/design-system/milestone-1-ux.md       | @ux-ui      | Especificação de UX do Milestone 1 - Onboarding |
| public/milestone-1-simulator.html          | @ux-ui      | Simulador Interativo do Milestone 1 (Onboarding e Triagem) |
| public/style.css                           | @ux-ui      | Folha de Estilos Compartilhada do Design System (Tokens Premium) |
| public/prestador-onboarding.html           | @ux-ui      | Protótipo de Alta Fidelidade: Onboarding do Prestador (Mobile) |
| public/gestor-painel.html                  | @ux-ui      | Protótipo de Alta Fidelidade: Painel de Triagem do Gestor (Desktop) |
| jest.config.js                            | @qa         | Configuração do Jest para testes unitários com ES Modules |
| playwright.config.js                      | @qa         | Configuração do Playwright para testes de navegador E2E |
| tests/unit/formatters.test.js              | @qa         | Suite de testes unitários do Jest para formatadores |
| public/js/utils/formatters.js             | @dev        | Código de utilitários de formatação de strings reativas |
| tests/e2e/onboarding.spec.js              | @qa         | Suite de testes E2E do Playwright para Onboarding e Painel |
 
## Última Atualização
- Data    : 2026-05-18
- Por     : @qa & @maestro
- Motivo  : Preparação completa do ambiente de testes automatizados (Jest JSDOM com ESM + Playwright E2E com inicialização automática do local dev server). Cascas de testes unitários e funcionais criadas, testadas e 100% aprovadas.