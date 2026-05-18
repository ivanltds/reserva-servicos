# Plano Detalhado de Implementação — Milestone 1 (Sprint 1)
> **Escopo:** Base de Confiança e Onboarding do Prestador (Sprint de 7 dias)  
> **Responsáveis:** @architect (Arquitetura) & @dev (Desenvolvimento)  
> **Status:** Pronto para Execução  

Este documento apresenta o cronograma diário de engenharia, detalhando tarefas, responsabilidades, trechos de código estruturais e rotinas de validação para implementar o **Milestone 1** com zero atrito de integração.

---

## 📅 Cronograma de Execução Diária (Gantt Mental)

```
[Dia 1: DB & RLS] ──► [Dia 2: Edge Function Deno] ──► [Dia 3: Core ESM (State)] ──► [Dia 4: Web Components] ──► [Dia 5: Onboarding UI] ──► [Dia 6: Triage Workstation] ──► [Dia 7: Testes E2E]
```

---

## 🛠️ Detalhamento por Dia de Sprint

### 📆 Dia 1: Infraestrutura de Dados & Segurança (Supabase/Postgres)
*   **Objetivo:** Setup do banco de dados relacional e blindagem de segurança com RLS.
*   **Tarefas Técnicas:**
    1.  Criar os esquemas e tabelas `profiles` e `service_providers` via migrations do Supabase CLI.
    2.  Habilitar `Row Level Security` (RLS) em ambas as tabelas.
    3.  Criar buckets de storage temporários: `selfies-temp` e `criminologia-temp` com políticas de escrita para usuários autenticados e leitura apenas para administradores/gestores.
    4.  Criar índices em campos de busca frequente para garantir performance de alta concorrência: `profiles(cpf)`, `service_providers(status)`.
*   **Esboço Técnico RLS (Políticas de Acesso):**
    ```sql
    -- Habilitar RLS
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.service_providers ENABLE ROW LEVEL SECURITY;

    -- Política: Prestadores e Moradores leem seus próprios perfis básicos
    CREATE POLICY select_own_profile ON public.profiles
        FOR SELECT USING (auth.uid() = id);

    -- Política: Gestores locais (role 'operator') leem todos os dados cadastrais
    CREATE POLICY select_operator_all_profiles ON public.profiles
        FOR SELECT USING (
            EXISTS (
                SELECT 1 FROM public.profiles 
                WHERE id = auth.uid() AND role IN ('operator', 'master')
            )
        );
    ```

---

### 📆 Dia 2: Microsserviço de Expurgo Seguro (Supabase Edge Function)
*   **Objetivo:** Desenvolver a Edge Function `purge-sensible-doc` em TypeScript/Deno para processamento de antecedentes e descarte de PDF sob regras da LGPD.
*   **Tarefas Técnicas:**
    1.  Inicializar a Edge Function localmente: `supabase functions new purge-sensible-doc`.
    2.  Importar o SDK nativo do Supabase Client para Deno (`https://esm.sh/@supabase/supabase-js@2.39.0`).
    3.  Escrever rotina para extrair o JWT e validar se o chamador possui a role `'operator'` ou `'master'`.
    4.  Executar a rotina `deleteFile` no storage passando a credencial administrativa da *Service Role* (`SUPABASE_SERVICE_ROLE_KEY`), eliminando fisicamente o arquivo Criminológico do storage.
    5.  Atualizar o status do prestador na tabela `service_providers` para `'Aprovado'`, gravando `is_verified = true` e `verified_at = now()`.
*   **Esboço da Edge Function (`supabase/functions/purge-sensible-doc/index.ts`):**
    ```typescript
    import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
    import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

    serve(async (req) => {
      try {
        const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { provider_id, document_path } = await req.json()

        // 1. Exclui o arquivo fisicamente do bucket temporário
        const { error: deleteError } = await supabaseAdmin.storage
          .from('criminologia-temp')
          .remove([document_path])

        if (deleteError) throw deleteError

        // 2. Atualiza os dados de homologação no banco
        const { error: dbError } = await supabaseAdmin
          .from('service_providers')
          .update({ 
            status: 'Aprovado', 
            is_verified: true, 
            verified_at: new Date().toISOString() 
          })
          .eq('id', provider_id)

        if (dbError) throw dbError

        return new Response(JSON.stringify({ success: true }), { headers: { "Content-Type": "application/json" } })
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 400 })
      }
    })
    ```

---

### 📆 Dia 3: Fundação do Core Frontend Modular (ES Modules)
*   **Objetivo:** Criar o gerenciador de estado, barramento de eventos e wrapper do Supabase usando ES Modules nativos para evitar acoplamento.
*   **Tarefas Técnicas:**
    1.  Criar o gerenciador de estado reativo leve `/public/js/core/state.js` para monitorar a fila de candidatos e a seleção ativa.
    2.  Escrever o PubSub `/public/js/core/events.js` para comunicação assíncrona entre o painel lateral e a área de trabalho do gestor.
    3.  Estruturar `/public/js/services/supabase.js` contendo chaves de conexão pública e inicialização de canais de escuta realtime (`supabase.channel('public:service_providers')`).

---

### 📆 Dia 4: Desenvolvimento de Componentes Parametrizados (Custom Elements)
*   **Objetivo:** Criar os elementos HTML reaproveitáveis usando a API padrão de Custom Elements para simplificar manutenção e parametrização.
*   **Tarefas Técnicas:**
    1.  Desenvolver `<reserva-button variant="primary|danger" disabled>` com transições suaves e estados de loading.
    2.  Criar o componente de clipboard `<clipboard-card name="..." phone="..." rg="...">` para facilitar o fluxo de liberação condominial.
    3.  Documentar variáveis CSS personalizadas no topo de cada componente para fácil reestilização pelo time de UX.

---

### 📆 Dia 5: Integração do Onboarding Mobile-First (`prestador-onboarding.html`)
*   **Objetivo:** Conectar o protótipo de onboarding ao fluxo de cadastro do banco e uploads de storage.
*   **Tarefas Técnicas:**
    1.  Integrar máscaras de CPF, CEP e Celular por meio de funções utilitárias em `/public/js/utils/formatters.js`.
    2.  Implementar compressão client-side de imagem em canvas antes do upload para economizar banda do prestador (Mobile 3G/4G).
    3.  Configurar chamadas REST ao Supabase Storage para persistir temporariamente Selfie e CNH nos buckets.
    4.  Mapear botões de progresso reativos à integridade e preenchimento de cada etapa de onboarding.

---

### 📆 Dia 6: Workstation de Triagem Dinâmica (`gestor-painel.html`)
*   **Objetivo:** Conectar a workstation administrativa aos dados do Supabase com escuta reativa em tempo real.
*   **Tarefas Técnicas:**
    1.  Limitar a query da fila a no máximo **10 candidatos pendentes simultâneos** para evitar latência operacional.
    2.  Inscrever a fila nas atualizações realtime do banco de dados (novos profissionais que terminam o onboarding entram na lista do gestor instantaneamente).
    3.  Integrar o checklist de validação visual humana ( self-matching manual de RG/Selfie) obrigando a validação de todos os booleanos antes de habilitar a ativação.
    4.  Vincular o botão "Aprovar" para disparar a animação esmeralda de sincronização e acionar a Edge Function `purge-sensible-doc`.

---

### 📆 Dia 7: Testes Automatizados E2E (Playwright)
*   **Objetivo:** Escrever e executar a suíte de testes ponta a ponta para homologar os critérios de pronto.
*   **Tarefas Técnicas:**
    1.  Instalar Playwright: `npm init playwright@latest`.
    2.  Escrever teste E2E `tests/onboarding_to_triage.spec.ts` cobrindo o fluxo completo:
        *   Acessar `prestador-onboarding.html`.
        *   Preencher cadastro mockado de diarista.
        *   Upload de selfie e atestado de antecedentes.
        *   Verificar inserção no banco com status `'Pendente'`.
        *   Acessar `gestor-painel.html` com credenciais administrativas.
        *   Validar checklist visual, acionar aprovação de cadastro.
        *   Confirmar animação esmeralda de processamento concluída.
    3.  Executar verificação a nível de banco e storage (assegurar que o arquivo PDF do atestado foi de fato deletado do storage, restando apenas dados cadastrais e `is_verified: true`).

---

## 📈 Critérios de Validação & Definition of Done (DoD)
Para que a Fase 1 seja homologada pelo QA e classificada como **Pronta para Deploy**, as seguintes verificações devem retornar 100% de sucesso:

1.  **Segurança dos Dados:** Tentativa de requisição direta anônima aos dados cadastrais via PostgREST deve retornar HTTP `401 Unauthorized` ou `403 Forbidden`.
2.  **Conformidade LGPD Estrita:** O bucket `criminologia-temp` deve estar **vazio** para o prestador recém-aprovado no Supabase Storage.
3.  **Realtime Fila lateral:** Quando o prestador encerra o onboarding no simulador mobile, o nome do profissional deve brotar de imediato na fila administrativa sem necessidade de atualizar a página do navegador (F5).
4.  **Responsividade Visual:** Os protótipos de alta fidelidade devem estar rodando sob os novos Custom Elements e herdar perfeitamente a paleta Obsidian e Emerald configurada no Design System sem distorções no mobile.
