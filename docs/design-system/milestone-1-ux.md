# Especificação de UX/UI: Onboarding & Triagem Segura (Milestone 1)
> Versão: 1.0.0  
> Status: Aprovado para Implementação  
> Autor: @ux-ui (Designer UX/UI) & @legal (Assessor LGPD)  

Esta especificação detalha a experiência de uso (UX), estados de interface e fluxos lógicos para o **Milestone 1: Base de Confiança e Onboarding do Prestador**, garantindo conformidade absoluta com a LGPD e uma jornada fluida tanto para o profissional autônomo quanto para a equipe de triagem.

---

## 📱 1. O Formulário de Cadastro do Prestador (Mobile-First)

Para maximizar a conversão de profissionais locais, a jornada começa em uma **Landing Page Motivacional e Interativa (Passo 0)**, seguida por um **Wizard de 3 Passos**, evitando sobrecarga cognitiva e guiando o usuário com instruções claras em tom de voz empoderador e focado em renda.

### 📍 Passo 0: Landing Page Motivacional (A Renda Perto de Casa)
*   **Headline de Alto Impacto:** *"Sua Renda Multiplicada Perto de Casa"*
*   **Badges de Destaque:** Selo de Renda Estimada: *"⭐ GANHE ATÉ R$ 7.680/MÊS"*.
*   **Simulador Interativo de Ganhos:**
    *   Um widget interativo que permite ao profissional clicar em chips de quantidade de atendimentos diários (`2 Serviços/dia`, `3 Serviços/dia`, `4 Serviços/dia`).
    *   O widget atualiza em tempo real um contador dourado com sombra brilhante exibindo o rendimento líquido mensal estimado (`R$ 3.840/mês`, `R$ 5.760/mês` ou `R$ 7.680/mês`), calculando automaticamente o split líquido de **80% limpos** livre de tarifas.
*   **Os 3 Pilares de Atração:**
    1.  *Pix na Hora:* Repasse instantâneo via split automático do Asaas diretamente na conta após check-out.
    2.  *Zero Trânsito:* Trabalhe inteiramente dentro das torres vizinhas, eliminando transporte ou condução.
    3.  *Seguro de Acidentes Incluso:* Cobertura integral de acidentes e vida gratuita para todas as diárias.
*   **Ação:** Botão de conversão com animação pulsante (`pulse-glow`) `[ COMEÇAR A FATURAR AGORA ]` que direciona ao Passo 1 do Onboarding.

### 📍 Passo 1: Dados Pessoais & Endereço Completo
*   **Campos de Entrada:** Nome Completo, CPF, Celular (WhatsApp), CEP, Logradouro (Rua/Avenida), Número, Complemento (Torre/Apto), Bairro, Cidade/UF.
*   **UX Guideline:** 
    *   Formatação de masks em tempo real para CPF `000.000.000-00`, Celular `(00) 00000-0000` e CEP `00000-000`.
    *   **Preenchimento Inteligente de CEP:** Ao digitar o CEP `05386-300` (Reserva Raposo), o formulário realiza o auto-preenchimento instantâneo das ruas, bairros e cidade, agilizando a jornada e minimizando erros de digitação.
    *   Validação inline com feedbacks visuais semânticos em verde (sucesso) ou âmbar (erro).
*   **Ação:** Botão *"Continuar para Identidade"* habilitado apenas após o preenchimento válido de todos os dados cadastrais obrigatórios.

### 📍 Passo 2: Selfie & Identidade Oficial (RG/CNH)
*   **Campos de Entrada:** Upload da Selfie (Foto de Rosto) e Upload do Documento de Identidade (Frente e Verso).
*   **UX Guideline:**
    *   Instruções ilustradas claras: *"Tire a selfie em um local bem iluminado, sem boné ou óculos escuros"*.
    *   **Blindagem de Privacidade CNH/RG:** Alerta profissional informando explicitly que o arquivo do documento pessoal (RG/CNH) também será permanentemente triturado e apagado dos servidores logo após a triagem local do gestor.
*   **Ação:** Botão *"Ir para Etapa Final"*.

### 📍 Passo 3: Atestado de Antecedentes Criminais
*   **Campos de Entrada:** Upload do arquivo PDF/Imagem do Atestado de Antecedentes Criminais (emitido pela Polícia Civil/Federal).
*   **UX Guideline:**
    *   Link direto de utilidade pública: *"Não tem o atestado? Clique aqui para emitir gratuitamente no site da Polícia Civil de SP"* (abre em nova guia).
    *   Exibição de tag de aviso de privacidade em Amber dourado: *"🛡️ Seus dados estão seguros. Este arquivo será excluído permanentemente após nossa verificação para sua total privacidade."*
*   **Ação:** Botão *"Finalizar e Enviar Cadastro"*. Ao clicar, exibe tela de agradecimento com progresso animado: *"Seu cadastro foi enviado! Nossa equipe local analisará tudo em menos de 10 minutos."*

---

## 🖥️ 2. O Painel de Triagem Administrativa (Gestor)

O backoffice simplificado foi desenhado para que a gestora local (**Mariana**) processe os candidatos com máxima produtividade e conformidade legal, operando estritamente dentro de uma área logada protegida.

### 📍 Acesso Logado Administrativo (Login da Gestora)
*   **UX Guideline:**
    *   Card de login centralizado com efeito visual de glassmorphism sobre fundo escuro.
    *   Campos de credenciais corporativas pré-validados no servidor: `E-mail` e `Senha`.
    *   Micro-interação de carregamento com *Spinner pulsante* de transição ao clicar em `[ Acessar Painel ]`, garantindo feedback instantâneo e segurança de sessão auditada.
*   **Ação:** Direcionamento direto para a tela principal de triagem somente se autenticado.

### 📍 Tela Principal: Módulo de Prestador e Triagem
*   **Abas de Navegação:** Seletor no painel lateral permitindo gerenciar o ciclo de vida completo dos parceiros:
    *   `⏳ Triagem`: Fila contendo até 10 cadastros pendentes aguardando análise de antecedentes criminais.
    *   `✅ Ativos`: Prestadores homologados ativos aptos a realizar diárias.
    *   `⏸️ Inativos`: Prestadores suspensos a pedido ou temporariamente desativados.
    *   `🚫 Banidos`: Prestadores permanentemente bloqueados por quebras de regras de segurança condominial.
*   **Painel Central Adaptativo:**
    *   **Para Perfis em Triagem:** Exibe selfie de cadastro e cópia do documento sob uma verificação manual checklist (sem comparação biométrica automatizada). A certidão criminal em PDF traz link direto para emissão grátis no portal da Polícia Civil de SP.
    *   **Para Perfis Ativos:** Substitui a exibição de CNH e PDF criminal pelas informações cadastrais persistidas (CPF, Celular e Endereço Residencial Completo). Exibe o score médio de estrelas (Ex: `4.9 ⭐`), contagem de atendimentos, saldo do fundo mutualista e histórico operacional detalhado com comentários dos moradores.
    *   **Para Inativos e Banidos:** Exibe a justificativa administrativa da sanção e o botão para `Reativar Cadastro`.

---

## 🛡️ 3. O Fluxo de Dupla Confirmação & Animação de Destruição Física (Compliance LGPD)

Para cumprir a LGPD de forma profissional e transparente, o processo de aprovação do candidato pelo Gestor não ocorre de forma intempestiva ou automatizada. Ele exige uma dupla confirmação e engaja uma micro-interação visual de **Trituração Multidocumental**:

```
+----------------------------------------------------------------------+
|             Ação: Gestor clica em "APROVAR CADASTRO & PICOTAR"       |
+----------------------------------------------------------------------+
                                   |
                                   v
+----------------------------------------------------------------------+
|             Modal de Dupla Confirmação do Gestor                     |
|                                                                      |
|  Confirme a exclusão física irreversível dos arquivos sensíveis:     |
|   - [RG/CNH] CNH_Frente_Verso.jpg                                    |
|   - [Certidão] Atestado_Civil_Pol_Sp.pdf                             |
|                                                                      |
|  [ Cancelar ]             [🛡️ SIM, CONFIRMAR E DESTRUIR ]            |
+----------------------------------------------------------------------+
                                   |
                                   v
+----------------------------------------------------------------------+
|            Trituradora Digital Segura (Shredder Overlay)             |
|                                                                      |
|  "Picotando e excluindo dados pessoais sensíveis do Supabase..."     |
|  [|||||||||||||||| ===> Documentos triturados visualmente em tiras]  |
+----------------------------------------------------------------------+
                                   |
                                   v
+----------------------------------------------------------------------+
|              Resultado Visual Limpo & Status Habilitado              |
|                                                                      |
|  - Status do Prestador: [✓ Aprovado & Ativo]                         |
|  - Atestado Criminal: [🗑️ CERTIDÃO PDF DESTRUÍDA (NADA CONSTA)]       |
|  - RG/CNH: [🗑️ RG/CNH EXCLUÍDO PERMANENTEMENTE]                       |
|  - Biometria: [✓ Selfie Biométrica Ativa para matching condominial]  |
+----------------------------------------------------------------------+
```

### ⚙️ Detalhamento Técnico do Fluxo e Micro-Interação:
1.  **Dupla Confirmação Administrativa:** Ao clicar em `APROVAR CADASTRO & PICOTAR DOCUMENTOS`, o gestor vê um modal profissional. Este modal exibe uma lista explícita dos arquivos de imagem e PDF contendo dados sensíveis do prestador, exigindo o clique em `[ Sim, Confirmar e Excluir ]` para prosseguir.
2.  **Fragmentação CSS Multidocumental:** A animação de fragmentadora corta visualmente os documentos em tiras e os esvazia. 
3.  **Destruição Física em Servidores:** No backend (Supabase), os arquivos armazenados no bucket de storage temporário são fisicamente excluídos (deleção definitiva, não apenas soft-delete). As colunas de referência do arquivo de identidade e do PDF do antecedente são setadas como `null`.
4.  **Preservação Exclusiva da Biometria Facial:** Para conformidade de segurança local (liberação física na portaria do condomínio Reserva Serviços), apenas a selfie rápida é preservada. O RG/CNH é substituído por um banner de conformidade que certifica a destruição definitiva dos dados confidenciais do prestador.
5.  **Notificação Realtime:** O status do prestador é atualizado em tempo real na fila administrativa e em seu celular, permitindo que ele inicie o faturamento imediato.
