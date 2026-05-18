# Arquitetura Geral — Reserva Serviços

Este documento apresenta a especificação técnica e de engenharia de software da plataforma **Reserva Serviços**, projetada sob medida para garantir alta performance, acoplamento fraco, alta coesão, segurança rigorosa e conformidade jurídica/trabalhista, sem recorrer a *overengineering*.

---

## 1. Visão Geral da Arquitetura

O sistema é estruturado no modelo **Client-Server Hiperlocal**, composto por:
1. **Frontend Modular (ESM + Web Components Nativos):** Aplicação estática premium executada diretamente no navegador do cliente/prestador, sem necessidade de transpilação ou bundlers complexos (zero Webpack/Vite overhead).
2. **BaaS Seguro (Supabase & PostgreSQL):** Persistência de dados protegida por políticas de RLS (*Row Level Security*), gatilhos lógicos de banco de dados para travas legais e replicação em tempo real para matchings de serviço.
3. **Serviços de Borda (Supabase Edge Functions - Deno):** Execução isolada de código backend para integrações financeiras e processamento seguro de dados sensíveis.
4. **Gateway Financeiro de Baixa Latência (Asaas API):** Split de pagamento automático, antecipações e conciliações de PIX/Cartão.

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (HTML5)                                  |
|                                                                                   |
|  +------------------------+  +-----------------------+  +----------------------+  |
|  |   Jornada do Morador   |  | Jornada do Prestador  |  |  Painel Administrat. |  |
|  +------------------------+  +-----------------------+  +----------------------+  |
|               |                              |                             |      |
|               +------------------------------+-----------------------------+      |
|                                              | (ESM & Web Components API)         |
|                                              v                                    |
|                              +------------------------------+                     |
|                              |   Design System & UI Core    |                     |
|                              +------------------------------+                     |
+----------------------------------------------|------------------------------------+
                                               | (HTTPS / WSS / REST API)
                                               v
+-----------------------------------------------------------------------------------+
|                              BACKEND & INFRA (BaaS)                               |
|                                                                                   |
|    +-------------------------+                     +-------------------------+    |
|    |  Supabase Edge Functions|                     |    Postgres Database    |    |
|    |  (Deno Serverless)      |                     |    (Schemas & Triggers)  |    |
|    |                         |                     |                         |    |
|    |  +--------------------+ |                     |  +-------------------+  |    |
|    |  |  asaas-integration | |                     |  |  RLS Security     |  |    |
|    |  +--------------------+ |                     |  +-------------------+  |    |
|    |  +--------------------+ |                     |  +-------------------+  |    |
|    |  |  purge-sensible-doc| |                     |  |  Trava Habitual.  |  |    |
|    |  +--------------------+ |                     |  +-------------------+  |    |
|    +-------------|-----------+                     +------------|------------+    |
+------------------|----------------------------------------------|-----------------+
                   | (REST API)                                   | (Secured Links)
                   v                                              v
      +-------------------------+                    +--------------------------+
      |    Asaas Gateway API    |                    |  Supabase Secured Storage|
      |   (Split, Payouts)      |                    |   (Temporary KYC PDFs)   |
      +-------------------------+                    +--------------------------+
```

---

## 2. Componentização & Modularidade do Frontend

Para garantir reaproveitamento máximo de código, extensibilidade e desempenho de carregamento instantâneo, dividimos o frontend em módulos ES6 puros e Web Components autocontidos.

### A. Estrutura de Diretórios do Frontend (`/public/`)
```
/public/
  ├── index.html                   # Landing Page institucional com Simulador
  ├── prestador-onboarding.html    # Jornada Mobile de cadastro e KYC
  ├── gestor-painel.html           # Workstation Administrativa Desktop
  ├── morador-dashboard.html       # Painel de agendamento e liberação do cliente
  ├── style.css                    # Design Tokens globais do Design System
  └── js/
      ├── core/
      │   ├── state.js             # Gerenciamento de estado reativo leve do app
      │   ├── router.js            # Roteador client-side simples
      │   └── events.js            # Barramento de eventos global (PubSub)
      ├── services/
      │   ├── supabase.js          # Encapsulamento de chamadas do Supabase
      │   └── asaas.js             # Cliente de comunicação com Edge Functions de pagamento
      ├── utils/
      │   ├── formatters.js        # Formatadores (CPF, Telefone, CEP, Moeda)
      │   └── validators.js        # Validação estrutural de campos
      └── components/              # Web Components reutilizáveis e parametrizáveis
          ├── reserva-header.js    # Header com navegação responsiva e avatar
          ├── reserva-button.js    # Botões estilizados com micro-animações premium
          ├── clipboard-card.js    # Card de liberação rápida de portaria (copiar)
          ├── rating-stars.js      # Widget de avaliação por estrelas
          └── evidence-tracker.js  # Card de Check-in/Check-out com captura de GPS/foto
```

### B. Parametrização do Design System (Design Tokens)
O Design System é centralizado em variáveis CSS nativas no topo de `style.css`. Isso permite manutenção centralizada sem *frameworks* de compilação:

```css
:root {
  /* Cores Luxuosas de Prestígio */
  --bg-primary: #07090e;        /* Obsidian Dark */
  --bg-secondary: #0f131f;      /* Slate Gray Cards */
  --color-brand: #059669;       /* Emerald Jade */
  --color-brand-light: #34d399; /* Mint Accents */
  --color-accent: #d97706;      /* Amber Bronze */
  --color-accent-light: #f59e0b;/* Gold */

  /* Tipografia */
  --font-display: 'Outfit', sans-serif;
  --font-body: 'Inter', sans-serif;

  /* Efeitos e Bordas */
  --border-thin: 1px solid rgba(255, 255, 255, 0.08);
  --shadow-premium: 0 12px 40px -12px rgba(0, 0, 0, 0.7);
  --glass-effect: backdrop-filter: blur(16px);
}
```

### C. Estrutura de Componentes Nativos (Custom Elements)
Criamos componentes reaproveitáveis usando a API nativa de **Custom Elements** para garantir total isolamento de escopo (Shadow DOM opcional para maior isolamento, ou Custom Elements padrão para herança fluida de estilos):

```javascript
// Exemplo de componente parametrizável e de alto desempenho
class ReservaButton extends HTMLElement {
  static get observedAttributes() { return ['variant', 'disabled']; }
  
  connectedCallback() {
    this.render();
  }
  
  render() {
    const variant = this.getAttribute('variant') || 'primary';
    const text = this.innerHTML;
    this.innerHTML = `
      <button class="btn btn-${variant}" ${this.hasAttribute('disabled') ? 'disabled' : ''}>
        ${text}
      </button>
    `;
  }
}
customElements.define('reserva-button', ReservaButton);
```

---

## 3. Segurança e Banco de Dados (Supabase & Postgres)

Para blindar a plataforma contra fraudes, vazamentos de dados e disputas judiciais, a arquitetura de banco de dados aplica restrições a nível de registro (RLS) e gatilhos robustos.

### A. Modelo de Dados Relacional
```mermaid
erDiagram
    profiles ||--o| service_providers : "é prestador"
    profiles ||--o{ bookings : "agenda como cliente"
    service_providers ||--o{ bookings : "atende diárias"
    bookings ||--o| ratings : "recebe nota"
    bookings ||--o{ evidence_logs : "possui registros"
```

### B. Isolamento de Segurança por Row Level Security (RLS)
Nenhuma tabela do banco de dados expõe acessos sem restrições. As políticas de RLS garantem o seguinte isolamento:
1. **Moradores (Clientes):** Conseguem ler apenas o seu próprio perfil e agendamentos criados por eles. Podem visualizar o perfil operacional de profissionais ativos.
2. **Prestadores (Profissionais):** Conseguem ler apenas os seus próprios detalhes cadastrais, histórico financeiro e chamados de serviço atribuídos a eles.
3. **Gestores (Suporte Local):** Permissão de leitura geral para auditorias locais no condomínio, sem acesso direto a chaves de API restritas.

### C. Gatilhos de Segurança e Conformidade Legal (Trava Trabalhista)
Para garantir que a intermediação permaneça classificada sob a lei civil como **C2C pura (intermediação autônoma)** e não configure vínculo empregatício doméstico (Lei Complementar 150/2015), o banco possui uma trava eletrônica inegociável:

```sql
CREATE OR REPLACE FUNCTION check_booking_frequency()
RETURNS TRIGGER AS $$
DECLARE
    booking_count INT;
BEGIN
    -- Conta quantos agendamentos a mesma dupla possui na mesma semana
    SELECT COUNT(*) INTO booking_count
    FROM bookings
    WHERE client_id = NEW.client_id
      AND provider_id = NEW.provider_id
      AND date_trunc('week', service_date) = date_trunc('week', NEW.service_date)
      AND status NOT IN ('Cancelado');

    -- Bloqueia a inserção a partir do 3º agendamento
    IF booking_count >= 2 THEN
        RAISE EXCEPTION 'Conformidade Trabalhista (LC 150/2015): O mesmo prestador não pode realizar mais de 2 serviços semanais para o mesmo morador.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_limit_booking_frequency
BEFORE INSERT ON bookings
FOR EACH ROW
EXECUTE FUNCTION check_booking_frequency();
```

---

## 4. Estrutura Financeira e de Integrações (Asaas API)

A plataforma utiliza o gateway **Asaas** para gerenciar a custódia temporária de valores e split automático na liquidação:

1. **Garantia de Execução (Escrow):** O morador realiza o pagamento (PIX ou Cartão) no momento do agendamento. O Asaas retém o saldo em uma subconta digital de garantia.
2. **Confirmação e Split:** Quando o morador ou o gestor confirma a conclusão do serviço (amparado pelos logs de geolocalização e fotos da diária), a Edge Function liquida o split:
   * **80% do valor:** Depositado diretamente na conta digital vinculada ao CPF do prestador, livre de taxas bancárias (absorvidas pela plataforma).
   * **20% do valor:** Transferidos para a conta corporativa da Reserva Serviços (comissão de intermediação).
3. **Fundo Mutualista:** Automaticamente, 1.5% da taxa retida pela plataforma é contabilizado no ledger interno do fundo para mitigação amigável de avarias materiais ou estornos por fraudes de chargeback.

---

## 5. Mitigação de Riscos Técnicos e Decisões de Arquitetura

| Risco Técnico | Causa | Mitigação Arquitetural |
| :--- | :--- | :--- |
| **Vazamento de Documentos** | CNH, Selfie e Atestado em banco de dados. | Supabase Edge Function deleta o PDF físico permanentemente do storage imediatamente após a homologação do gestor, mantendo apenas `is_verified: true`. |
| **Chargebacks de Má-fé** | Clientes alegando não execução do serviço. | Coleta automática de evidências digitais redundantes: Coordenadas GPS (Check-in/Check-out), timestamp e foto final do local limpo/reparado. |
| **Bitributação Fiscal** | Emitir nota sobre valor total do serviço. | Contrato explícito C2C de intermediação tecnológica. Nota fiscal municipal de serviços (NFS-e) emitida apenas sobre a comissão de 20%. |
| **Latência Logística** | Profissionais distantes aceitando o chamado. | Algoritmo de broadcast hiperlocal focado exclusivamente por raio de alcance das torres e geolocalização. |

---

## 6. Dívidas Técnicas Conhecidas & Evolução
1. **Biometria Automatizada (Fase Futura):** Atualmente, a comparação facial é feita manualmente pelo gestor via checklist na workstation. A arquitetura já prevê a substituição dessa chamada manual por um pipeline de inteligência artificial na nuvem para leitura de CNH e face matching automático.
2. **Integração Física de Portaria (Fase Futura):** Hoje a liberação ocorre via área de transferência (Clipboard). Futuramente, utilizaremos webhooks integrados a sistemas de portaria física (como Control iD ou Linear) para enviar credenciais virtuais direto para as catracas do megacomplexo.

---

## 7. Ambiente de Desenvolvimento Local (BaaS local via Docker)

Para garantir agilidade de desenvolvimento, testes E2E isolados e evitar custos desnecessários em nuvem, a plataforma **Reserva Serviços** adota o ambiente de emulação local do Supabase via contêineres Docker.

### A. Requisitos e Pré-requisitos
*   **Docker Engine / Docker Desktop:** Rodando em modo Linux containers.
*   **Supabase CLI:** Instalado globalmente via npm (`npm install -g supabase`).
*   **Node.js / NPM:** Para scripts de automação local e execução de testes do Playwright.

### B. Arquitetura de Portas e URLs Locais
Quando inicializado localmente, o ecossistema Supabase mapeia os seguintes endpoints e portas no host:

| Serviço / Container | Porta Host | URL de Acesso Local |
| :--- | :--- | :--- |
| **API Gateway / Kong** | `54321` | `http://localhost:54321` |
| **Supabase Studio (Dashboard)** | `54323` | `http://localhost:54323` |
| **Banco de Dados PostgreSQL** | `54322` | `postgresql://postgres:postgres@localhost:54322/postgres` |
| **Servidor In-Bucket (Storage)** | `54321` | `http://localhost:54321/storage/v1` |
| **Edge Functions Deno Runtime** | `54321` | `http://localhost:54321/functions/v1` |

### C. Fluxo de Inicialização e Sincronização
1.  **Inicializar Diretório:** `supabase init` (cria a pasta de configurações locais `supabase/`).
2.  **Iniciar BaaS Docker:** `supabase start` (baixa as imagens e inicia os contêineres: DB, Auth, Storage, Edge Runtime, Studio).
3.  **Aplicar Migrações locais:** `supabase db reset` (reseta o banco de dados e reaplica todas as migrações em ordem cronológica).
4.  **Desenvolvimento de Functions:** Executar `supabase functions serve` para auto-reload local do Deno.
5.  **Encerrar Ambiente:** `supabase stop` (para liberar memória do Docker Desktop).