# Plano de Implementação — Fase 1: Fundação & Homologação Segura

Este documento estabelece o roteiro técnico detalhado para a implementação da **Fase 1 (Milestone 1 — Onboarding do Prestador & Workstation do Gestor)** da plataforma **Reserva Serviços**.

---

## 1. Objetivo Técnico
Estabelecer a fundação do banco de dados relacional (PostgreSQL no Supabase), configurar o controle de acesso e isolamento de dados via RLS, criar as bases estruturais de frontend baseadas em ES Modules e Web Components nativos, e implementar o microsserviço de borda (*Edge Function*) para validação e exclusão segura de arquivos sob conformidade estrita com a LGPD.

---

## 2. Arquivos a Criar e Alterar

### A. Banco de Dados & Backend (Supabase):
*   `supabase/migrations/20260518000000_schema_inicial.sql` — Criação das tabelas centrais, chaves estrangeiras, índices e gatilhos de segurança.
*   `supabase/migrations/20260518000001_rls_policies.sql` — Declaração de todas as políticas de Row Level Security.
*   `supabase/functions/purge-sensible-doc/index.ts` — Deno Edge Function para análise e descarte físico de atestados criminais em PDF.

### B. Core Framework Frontend (ESM):
*   `public/js/core/state.js` — Módulo reativo leve para controle global de estado (ex: perfil logado, status da fila de triagem).
*   `public/js/core/events.js` — Barramento de mensagens assíncronas do navegador (PubSub) para desacoplamento de UI.
*   `public/js/services/supabase.js` — Encapsulamento das requisições e assinaturas em tempo real ao Supabase BaaS.

### C. Componentes de UI (Web Components Parametrizados):
*   `public/js/components/reserva-button.js` — Botões de alta fidelidade com feedback tátil e loading states.
*   `public/js/components/clipboard-card.js` — Card interativo com função clipboard de cópia rápida formatada de dados de portaria.
*   `public/js/components/rating-stars.js` — Renderizador dinâmico de pontuação e reviews de prestadores ativos.

### D. Telas Existentes (Integração):
*   `public/prestador-onboarding.html` — Conectar os módulos de validação do formulário, máscaras e envio de documentos para os buckets temporários.
*   `public/gestor-painel.html` — Integrar a listagem reativa das filas de triagem (carregamento de até 10 itens pendentes por vez), o checklist de verificação e a chamada de homologação/processamento.

---

## 3. Ordem de Implementação

```
  Passo 1: Banco de Dados & RLS
        │
        ▼
  Passo 2: Supabase Edge Functions (Purge Deno)
        │
        ▼
  Passo 3: Módulos de Core Frontend (ESM State/Events)
        │
        ▼
  Passo 4: Criação de Web Components parametrizados
        │
        ▼
  Passo 5: Acoplamento nos Protótipos de Alta Fidelidade (KYC & Painel)
```

1.  **Executar Migrations no Banco:** Estabelecer tabelas de `profiles` e `service_providers` com restrições e políticas de RLS ativas.
2.  **Publicar Deno Edge Function:** Configurar a função `purge-sensible-doc` com chaves de serviço para acessar o Storage e banco para remoção física e ativação de flag.
3.  **Implementar Core JS no Frontend:** Instanciar a biblioteca do Supabase Client no módulo global e estruturar o estado reativo.
4.  **Codificar Web Components:** Desenvolver e registrar os Custom Elements no escopo global do navegador para reúso imediato nas páginas.
5.  **Substituir Mockings por Dados Dinâmicos:** Integrar a leitura do banco de dados e ações reais no Onboarding e no Painel de Controle Administrativo.

---

## 4. Contratos de API (Edge Functions)

### `POST /functions/v1/purge-sensible-doc`
Responsável por validar a integridade do atestado policial criminal temporário em PDF, extrair a confirmação de idoneidade, alterar o status do profissional no banco de dados e expurgar o arquivo físico permanentemente do storage.

*   **Headers:**
    ```http
    Content-Type: application/json
    Authorization: Bearer <supabase_jwt_token_gestor>
    ```
*   **Body (Request):**
    ```json
    {
      "provider_id": "a904d9a6-bd27-4bf7-bbbe-5bc0fd104618",
      "document_path": "criminologia-temp/atestado_SP-998811A.pdf"
    }
    ```
*   **Response (200 Success):**
    ```json
    {
      "success": true,
      "message": "Atestado verificado com sucesso. Arquivo em PDF expurgado fisicamente do servidor para segurança LGPD.",
      "is_verified": true,
      "purged_at": "2026-05-18T03:00:00Z"
    }
    ```
*   **Response (400 Bad Request / Security Error):**
    ```json
    {
      "success": false,
      "error": "Acesso não autorizado ou token inválido."
    }
    ```

---

## 5. Modelo de Dados (Tabelas Principais)

### Tabela `profiles`
Contém as credenciais básicas comuns a moradores, prestadores e gestores locais.
```sql
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    phone VARCHAR(15) NOT NULL,
    role VARCHAR(30) DEFAULT 'client' CHECK (role IN ('client', 'provider', 'operator', 'master')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Tabela `service_providers`
Contém os dados específicos dos prestadores de serviços, suas notas de avaliação e status cadastral.
```sql
CREATE TABLE public.service_providers (
    id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    bio TEXT,
    status VARCHAR(30) DEFAULT 'Pendente' CHECK (status IN ('Pendente', 'Aprovado', 'Inativo', 'Banido')),
    rating NUMERIC(3, 2) DEFAULT 5.00,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Endereço Completo Persistido (Requisito LGPD/Negócio)
    address_cep VARCHAR(9) NOT NULL,
    address_rua VARCHAR(255) NOT NULL,
    address_num VARCHAR(20) NOT NULL,
    address_comp VARCHAR(100),
    address_bairro VARCHAR(150) NOT NULL,
    address_cidade VARCHAR(150) NOT NULL,
    
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

---

## 6. Dependências
1.  **Supabase Client SDK (`@supabase/supabase-js`):** Interação assíncrona, queries e canais realtime para a fila lateral do gestor.
2.  **Deno Storage API:** Manipulação avançada de buckets de storage em nível de borda com permissão administrativa (`Service Role`).
3.  **Google Fonts (Outfit & Inter):** Recursos de tipografia declarados no Design System.

---

## 7. Riscos Técnicos & Mitigações
*   **Risco de Vazamento de Documento Sensível (LGPD):** Se a Edge Function falhar antes de deletar o PDF, o arquivo permanecerá no bucket de storage.
    *   *Mitigação:* A exclusão é envelopada em um bloco `try-finally` inquebrável. Independente do sucesso da atualização de status do banco de dados, o arquivo no storage é deletado após a primeira leitura, evitando persistência indevida.
*   **Latência na Fila de Triagem:** Carregamento lento devido ao volume de fotos pesadas de selfies.
    *   *Mitigação:* A workstation do gestor adota paginação rígida limitando o carregamento da fila em no máximo **10 candidatos pendentes simultâneos** de cada vez, utilizando compressão client-side de imagem na câmera do prestador antes do upload.

---

## 8. Critérios de Pronto (Definition of Done)
1.  **Integridade Relacional:** Todas as tabelas criadas no Supabase com integridade referencial ativa e indexação nos campos de CPF e ID.
2.  **Segurança RLS Homologada:** Nenhuma query anônima externa consegue burlar as credenciais ou visualizar perfis alheios.
3.  **Expurgo Físico Concluído:** Testes de upload mostram que o PDF é deletado fisicamente do Supabase Storage após a homologação, restando apenas o registro booleano `is_verified: true` e os dados cadastrais básicos.
4.  **Reutilização da UI:** As páginas de onboarding e o painel de controle importam e instanciam os componentes Custom Elements com sucesso, mantendo 100% de consistência estética sob os tokens CSS de `style.css`.
