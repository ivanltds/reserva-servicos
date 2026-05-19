# Melhoria Contínua
> Arquivo incremental. Nunca apagar entradas.
> Lido automaticamente pelo MAESTRO antes de acionar o agente correspondente.

## Formato de Registro
## [YYYY-MM-DD] — Tipo: [BUG | PROCESSO | COMUNICAÇÃO | QUALIDADE | UX | NEGÓCIO | ARQUITETURA | OUTRO]
**Contexto:** [fase / PRD]
**Problema:** [descrição objetiva]
**Impacto:** [efeito causado]
**Ação corretiva:** [o que deve mudar]
**Status:** [ABERTO | APLICADO]

## Histórico

### [2026-05-18] — Tipo: ARQUITETURA / UX
**Contexto:** Jornada de Onboarding e Login de Cliente/Prestador
**Problema:** Redirecionamento inadequado para a Landing Page raiz ao invés do painel do cliente ou do modal de login de escolha de cadastro.
**Impacto:** Perda de estado, fricção na experiência do usuário de cadastro e login.
**Ação corretiva:** Implementação de modal unificado direto no Login e correção da rota na tela de escolha de perfil para `/cliente/painel`.
**Status:** APLICADO

### [2026-05-18] — Tipo: NEGÓCIO / QUALIDADE
**Contexto:** Cadastro de Cliente / Expansão Territorial
**Problema:** Necessidade de limitar/validar geograficamente o cadastro de cliente para permitir apenas cidades vizinhas suportadas.
**Impacto:** Risco de aceitar clientes de cidades distantes que a plataforma de vizinhança hiperlocal não consegue atender.
**Ação corretiva:** Implementada validação de cidades de atendimento permitidas (São Paulo, Osasco, Cotia e Taboão da Serra) no cadastro do cliente com feedback reativo no formulário.
**Status:** APLICADO