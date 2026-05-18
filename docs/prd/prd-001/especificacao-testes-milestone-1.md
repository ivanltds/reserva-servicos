# Especificação de Testes BDD — Milestone 1 (Sprint 1)
> **Foco:** Base de Confiança, Onboarding do Prestador & Workstation de Triagem  
> **Metodologia:** Behavior-Driven Development (BDD) via Gherkin  
> **Responsável:** @qa (Engenheiro de QA)  
> **Status:** Aprovado para Engenharia  

Este documento reúne todas as especificações e cenários de testes em formato BDD para guiar o desenvolvimento orientado a testes (TDD) e automatizado (Playwright/Jest) no **Milestone 1**.

---

## 🎭 1. Cenários da Jornada de Onboarding do Prestador (`prestador-onboarding.html`)

### Cenário 1: Cadastro completo de prestador com dados válidos (Happy Path)
*   **Contexto:**
    *   *Dado* que o profissional autônomo acessa a página de onboarding do prestador,
    *   *E* não há outro cadastro ativo com o mesmo CPF ou número de celular.
*   **Ação:**
    *   *Quando* ele preencher a primeira etapa com nome, celular, CPF e CEP válidos,
    *   *E* realizar o upload da selfie e foto do documento oficial nítidas no bucket temporário,
    *   *E* anexar o arquivo PDF válido do Atestado de Antecedentes Criminais extraído da SSP-SP,
    *   *E* submeter o formulário.
*   **Resultado Esperado:**
    *   *Então* o formulário deve compactar e enviar as mídias com sucesso,
    *   *E* exibir uma interface de conclusão com a mensagem estrita de "Processando Cadastro" (sem citar termos técnicos como 'trituração' ou 'exclusão de docs na tela'),
    *   *E* criar um registro na tabela `service_providers` com status `'Pendente'`.

### Cenário 2: Validação reativa de CPF sem alarmismo precoce (Edge Case)
*   **Contexto:**
    *   *Dado* que o prestador está digitando seu documento de identificação no input de CPF.
*   **Ação:**
    *   *Quando* ele estiver preenchendo os primeiros 10 dígitos do CPF,
    *   *Então* o indicador de status do formulário não deve acusar "número inválido" prematuramente.
    *   *Quando* ele terminar de preencher o 11º dígito e o CPF for estruturalmente inválido (falha nos dígitos verificadores),
    *   *Então* o input deve destacar-se visualmente em vermelho e exibir a mensagem de erro formatada.

### Cenário 3: Alinhamento visual e responsividade móvel (Qualidade Visual / UX)
*   **Contexto:**
    *   *Dado* que o prestador acessa o onboarding de um dispositivo móvel (viewport 375px ou menor).
*   **Ação:**
    *   *Quando* a primeira seção do formulário de dados básicos é renderizada na tela.
*   **Resultado Esperado:**
    *   *Então* os campos de **CPF** e **WhatsApp (Celular)** devem estar perfeitamente alinhados verticalmente,
    *   *E* a máscara do telefone não deve sobrepor o ícone do input correspondente, exibindo o layout Obsidian Premium de alto contraste.

---

## 💻 2. Cenários da Workstation Administrativa do Gestor (`gestor-painel.html`)

### Cenário 4: Fila de triagem reativa em tempo real (Happy Path)
*   **Contexto:**
    *   *Dado* que o gestor de atendimento local está autenticado no Painel de Triagem,
    *   *E* a fila de candidatos está carregada e limitada ao máximo de **10 itens simultâneos** na tela.
*   **Ação:**
    *   *Quando* um novo prestador de serviços finalizar o cadastro de onboarding na outra ponta do aplicativo.
*   **Resultado Esperado:**
    *   *Então* os dados deste novo candidato (Nome, Foto de Perfil, Horário) devem brotar reativamente na listagem lateral em tempo real (via realtime channel), sem que o gestor precise recarregar (F5) o painel.

### Cenário 5: Ativação segura dependente de checklist humano (Security Boundary)
*   **Contexto:**
    *   *Dado* que o gestor selecionou um candidato pendente e está analisando seus documentos.
*   **Ação:**
    *   *Quando* o gestor tentar clicar no botão "Aprovar Cadastro" enquanto um ou mais checkboxes do checklist de triagem visual (Ex: "Foto da selfie confere com a CNH", "Documento é original", "Nome coincide") estiverem desmarcados.
*   **Resultado Esperado:**
    *   *Então* o botão "Aprovar Cadastro" deve permanecer cinza e em estado `disabled` inegociável.

### Cenário 6: Homologação e processamento visual premium (Happy Path)
*   **Contexto:**
    *   *Dado* que o gestor marcou todos os checkboxes do checklist de triagem visual de um candidato.
*   **Ação:**
    *   *Quando* o gestor clicar no botão "Aprovar Cadastro".
*   **Resultado Esperado:**
    *   *Então* o painel deve exibir um overlay translúcido premium de carregamento com Spinner animado em tom **Emerald Jade**,
    *   *E* exibir o texto dinâmico *"Processando Cadastro..."*,
    *   *E* encaminhar a requisição com sucesso para o microsserviço de expurgo.

---

## 🔒 3. Cenários de Segurança, RLS e Conformidade Trabalhista (LGPD & Banco)

### Cenário 7: Expurgo físico e irreversível do arquivo criminológico (Conformidade LGPD)
*   **Contexto:**
    *   *Dado* que o gestor clicou em aprovar e a requisição foi disparada.
*   **Ação:**
    *   *Quando* a Edge Function `purge-sensible-doc` processar o payload de homologação.
*   **Resultado Esperado:**
    *   *Então* o arquivo PDF físico do atestado criminal deve ser **deletado de forma física permanente** do bucket `criminologia-temp` no Supabase Storage.
    *   *E* o registro do profissional em `service_providers` deve ter `is_verified` alterado para `true` e `status` para `'Aprovado'`,
    *   *E* o arquivo em PDF não deve mais ser acessado por nenhum link, token ou chave, resguardando o megacomplexo contra vazamentos.

### Cenário 8: Isolamento e restrição a dados cadastrais sensíveis (Security & RLS)
*   **Contexto:**
    *   *Dado* que um morador (role 'client') ou um usuário anônimo está navegando pela plataforma.
*   **Ação:**
    *   *Quando* ele tentar efetuar uma chamada direta via API REST (PostgREST) ou ler diretamente o bucket de Storage de antecedentes criminais de qualquer profissional cadastrado.
*   **Resultado Esperado:**
    *   *Então* o gateway de segurança (Kong/Supabase RLS) deve travar a requisição, retornando `HTTP 401 Unauthorized` ou `403 Forbidden`.
