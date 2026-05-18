# 🎼 Maestro AI Framework & Reserva Serviços (Milestone 1)

**A plataforma hiperlocal de serviços residenciais orquestrada por Agentes Autônomos de Elite.**

Este repositório é gerenciado sob o ecossistema do **Maestro AI**, um framework de orquestração de agentes artificiais de elite baseados em personas (Persona-Driven AI). Ele garante a aplicação rigorosa de processos, conformidade regulatória estrita com a **LGPD** e um pipeline de desenvolvimento guiado por testes (**TDD**).

---

## 🏢 Como Rodar o Reserva Serviços Localmente

Siga o guia passo a passo abaixo para rodar toda a infraestrutura hiperlocal (Banco PostgreSQL, Storage Privado, Auth e Servidor Web) localmente em sua máquina.

### 📋 1. Pré-requisitos
Antes de começar, garanta que você possui os seguintes softwares instalados:
* [Node.js](https://nodejs.org/) (versão 18 ou superior)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (necessário para rodar o Supabase localmente)
* [Git](https://git-scm.com/)

---

### 🚀 2. Passo a Passo de Inicialização

#### Passo A: Instalar Dependências do Node
Instale todas as ferramentas de desenvolvimento, incluindo Playwright (E2E) e Jest (Unitários):
```bash
npm install
```

#### Passo B: Iniciar o Supabase Local via Docker
O projeto utiliza um ambiente local emulado do Supabase para banco de dados e buckets. Certifique-se de que o Docker está rodando e execute:
```bash
# Inicia todos os containers do Supabase (Postgres, Studio, Auth, Storage)
npx supabase start
```
*Dica: Na primeira execução, o download das imagens Docker pode levar alguns minutos. Uma vez concluído, o terminal exibirá as URLs locais, incluindo o painel de administração local (Studio) em `http://localhost:54323`.*

#### Passo C: Aplicar as Migrações do Banco de Dados
Para carregar a estrutura física de tabelas, triggers RLS de proteção LGPD e buckets privados de mídia:
```bash
npx supabase db reset
```

#### Passo D: Executar o Servidor Web Local
Inicie o servidor de desenvolvimento hiperlocal na porta `3000`:
```bash
npm run dev
```

---

### 🌐 3. Acessando as Interfaces do Produto

Com o servidor rodando, abra o navegador e acesse as rotas do projeto:

* 👤 **Landing Page & Jornada de Onboarding do Prestador**:
  - URL: [http://localhost:3000/](http://localhost:3000/) ou [http://localhost:3000/index.html](http://localhost:3000/index.html)
  - *Fluxo*: Apresenta a calculadora de ganhos interativa (Landing Page) e conduz o prestador pela jornada passo a passo de cadastro e envio de documentos.

* 🔑 **Página de Login Unificado**:
  - URL: [http://localhost:3000/login.html](http://localhost:3000/login.html)
  - *Fluxo*: Login unificado de acesso. Redireciona automaticamente o Gestor para o Painel de Triagem ou o Prestador para a Landing/Acompanhamento dependendo de seu papel (Role) no banco.

* 🖥️ **Painel do Gestor (Workstation de Homologação)**:
  - URL: [http://localhost:3000/gestor-painel.html](http://localhost:3000/gestor-painel.html)
  - *Acesso Simples de Desenvolvimento*: O painel está preparado para criar a gestora **Mariana Alves** automaticamente no primeiro clique em "Acessar Painel".
  - *E-mail administrativo sugerido*: `mariana.alves@reservaservicos.com.br`

---

## 🛡️ 4. Fluxo Transacional e Proteção LGPD (Expurgo Seguro)

Durante a triagem no Painel do Gestor, ao clicar em **"Homologar Cadastro"**, o sistema dispara uma **Edge Function** baseada em Deno rodando localmente no Supabase que executa de forma segura os seguintes passos:

1. Valida se o usuário que solicitou a aprovação possui credenciais administrativas.
2. Efetua o expurgo físico permanente dos arquivos (Selfie e PDF de Antecedentes Criminais) dos buckets de S3 (`selfies-temp` e `criminologia-temp`).
3. Promove a conta do candidato para a role operacional de `'provider'` no banco.
4. Exibe a tela de liberação de tags com o componente Web customizado `<clipboard-card>` contendo as credenciais para a portaria física.

---

## 🧪 5. Execução de Testes Automatizados

Garantimos a total integridade de nossas features através de testes unitários e de integração E2E robustos.

```bash
# Rodar todos os testes unitários e de ponta a ponta (E2E)
npm run test

# Rodar exclusivamente os testes unitários (Jest)
npm run test:unit

# Rodar exclusivamente os testes de interface E2E (Playwright)
npm run test:e2e
```

---

## 🏗️ Estrutura de Agentes (Maestro AI Framework)

O desenvolvimento deste produto é regido pelo framework multi-agentes Maestro AI. Cada agente possui uma atribuição explícita:

| Agente | Persona | Função Primária |
| :--- | :--- | :--- |
| **@maestro** | O Orquestrador | Gerente central. Interpreta, planeja e delega. |
| **@ba** | Business Analyst | Levanta viabilidade técnica e escreve a PRD inicial. |
| **@ux-ui** | UX Designer | Desenha o Wireframe e dita as regras de design system. |
| **@architect**| Arquiteto | Desenha o plano de implementação e as regras de dados. |
| **@dev** | Desenvolvedor | Implementa código focado em TDD e Clean Architecture. |
| **@ai-eng** | AI Engineer | Otimiza prompts, vetores e a "inteligência" do produto. |
| **@qa** | Quality Assurer | Valida cobertura de testes, corner cases e bugfixes. |
| **@devops** | DevOps | Versionamento, Commits padronizados e Infraestrutura. |

---

## ⚖️ Licença

Licença MIT. Desenvolvido com ❤️ por Ivan Ltds e Inteligência Artificial Autônoma.