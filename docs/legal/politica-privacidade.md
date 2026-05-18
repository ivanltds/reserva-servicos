# Política de Privacidade e Proteção de Dados — Reserva Serviços
> **Versão:** 1.0.0  
> **Última Atualização:** 18 de Maio de 2026  
> **Status:** Ativa / Homologada  

Esta **Política de Privacidade e Proteção de Dados** ("Política") descreve a forma como a plataforma **Reserva Serviços** ("Plataforma") coleta, utiliza, compartilha, armazena e protege os dados pessoais dos moradores contratantes ("Moradores") e dos prestadores de serviços autônomos ("Prestadores") cadastrados. 

Esta Política foi estruturada em estrita conformidade com a **Lei Geral de Proteção de Dados Pessoais (LGPD - Lei nº 13.709/2018)** e o Marco Civil da Internet (Lei nº 12.965/2014).

---

## 1. Princípios de Governança de Dados

A Plataforma baseia suas operações de tratamento de dados sob três pilares regulatórios obrigatórios:
1.  **Minimização de Dados (*Data Minimization*):** Coletamos estritamente as informações necessárias para viabilizar o cadastro, o processamento dos repasses financeiros e a autorização de entrada na portaria condominial.
2.  **Segurança por Padrão (*Privacy by Design*):** Toda a arquitetura de banco de dados (PostgreSQL) adota o isolamento rigoroso de Row Level Security (RLS), bloqueando consultas não autorizadas ou vazamento de dados de contatos de usuários.
3.  **Transparência e Finalidade:** Cada dado coletado possui uma finalidade operacional lícita e clara declarada abaixo.

---

## 2. Dados Coletados e Suas Finalidades

### 2.1. Dados Coletados dos Prestadores de Serviços (Profissionais)
| Categoria do Dado | Finalidade Operacional | Base Legal (LGPD) |
| :--- | :--- | :--- |
| **Nome Completo, RG e CPF** | Identificação fiscal e pessoal; emissão de NFS-e de intermediação; preenchimento automatizado para split Asaas. | Execução de Contrato (Art. 7º, V) e Cumprimento de Obrigação Legal (Art. 7º, II). |
| **Fotografia Pessoal (Selfie)** | Verificação de identidade facial para segurança no condomínio e visualização na portaria. | Proteção da Vida / Segurança do Morador (Art. 7º, VII) e Legítimo Interesse (Art. 7º, IX). |
| **Número de WhatsApp** | Comunicação transacional de agendamentos, avisos de novos matches e saques. | Execução de Contrato (Art. 7º, V). |
| **Dados de Endereço (CEP, Rua, etc.)** | Geofencing local para serviços a pé no Reserva Raposo; validação de residência na região. | Legítimo Interesse (Art. 7º, IX). |
| **Atestado de Antecedentes Criminais** | Triagem de segurança de idoneidade moral para ingresso em residências familiares. | Legítimo Interesse (Art. 7º, IX) e Proteção da Vida / Segurança (Art. 7º, VII). |

### 2.2. Dados Coletados dos Moradores (Clientes)
| Categoria do Dado | Finalidade Operacional | Base Legal (LGPD) |
| :--- | :--- | :--- |
| **Nome Completo e CPF** | Identificação contratual; processamento de pagamento via gateway Asaas; emissão de NFS-e. | Execução de Contrato (Art. 7º, V) e Cumprimento de Obrigação Legal (Art. 7º, II). |
| **Número de WhatsApp** | Notificações de confirmação de diárias, cancelamentos e chats com o profissional. | Execução de Contrato (Art. 7º, V). |
| **Torre, Bloco e Apartamento** | Endereço de execução do serviço e indicação da liberação na portaria condominial. | Execução de Contrato (Art. 7º, V). |

---

## 3. A Salvaguarda LGPD de Antecedentes Criminais (Expurgo Seguro)

3.1. **Obrigatoriedade de Expurgo:** Para garantir que a Plataforma não acumule ou exponha dados criminais ou sensíveis que configurem passivos regulatórios da LGPD, adotamos o fluxo de **Expurgo Seguro**.

3.2. **Como Funciona:**
1.  O Prestador envia o arquivo PDF do atestado policial de antecedentes criminais pelo formulário de onboarding.
2.  O arquivo é armazenado em um bucket criptografado e temporário do Supabase Storage (`criminologia-temp`).
3.  O operador de triagem realiza a verificação humana de idoneidade no painel administrativo e confere se a identidade coincide com a selfie fornecida.
4.  No exato instante em que o parecer positivo é emitido ("Aprovar"), o sistema dispara uma transação automatizada no backend que **remove física, permanente e definitivamente o arquivo PDF** do storage.
5.  A Plataforma passa a reter unicamente a flag booleana `is_verified: true` associada ao carimbo de data e hora do processamento (`verified_at`) e ao e-mail do operador auditor, registrando zero mídias sensíveis de histórico de antecedentes na base de dados.

---

## 4. Compartilhamento de Dados Pessoais

4.1. **Compartilhamento Operacional (Match):** No momento em que um agendamento é fechado, a Plataforma compartilha:
*   Com o Morador: Nome, Selfie, RG e CPF do Prestador (para fins de liberação na portaria).
*   Com o Prestador: Nome, Número do Apartamento/Torre do Morador (para fins de execução da diária).

4.2. **Compartilhamento de Meio de Pagamento (Asaas):** Os dados de CPF, Nome e e-mail de ambas as partes são compartilhados estritamente com o gateway de pagamentos **Asaas** para fins de split automático de transações Pix/Cartão e declarações fiscais obrigatórias (DIMP).

4.3. **Proibição de Venda de Dados:** A Plataforma **não vende, aluga, transfere comercialmente ou cede dados pessoais** de seus usuários para terceiros, empresas de marketing ou publicidade em nenhuma hipótese.

---

## 5. Medidas de Segurança da Informação

Adotamos medidas técnicas de segurança de alto padrão para proteger as informações pessoais contra perda, roubo, acessos não autorizados ou divulgação indevida:
*   **Criptografia em Trânsito (HTTPS/SSL):** Todas as conexões entre o navegador dos usuários e a Plataforma são inteiramente criptografadas.
*   **Políticas de RLS (Row Level Security):** O banco de dados PostgreSQL bloqueia qualquer acesso direto anônimo ou de usuários não autorizados às tabelas de perfis.
*   **Tokens Temporários:** O painel do gestor de triagem visualiza documentos de candidatos temporariamente por meio de links assinados de curta duração (5 minutos), impedindo a exposição externa das URLs dos buckets.

---

## 6. Direitos dos Titulares de Dados (Artigo 18 da LGPD)

Em conformidade com o Artigo 18 da LGPD, os usuários (Moradores e Prestadores) podem exercer seus direitos a qualquer momento entrando em contato com a equipe de privacidade da Plataforma para solicitar:
1.  **Confirmação e Acesso:** Saber se a Plataforma trata seus dados e solicitar cópia estruturada dos dados retidos.
2.  **Retificação:** Correção de dados incompletos, inexatos ou desatualizados (ex: alteração de telefone ou erro de digitação do CPF).
3.  **Anonimização ou Eliminação:** Exclusão definitiva de sua conta e eliminação total de seus dados cadastrais das bases ativas da Plataforma (respeitados os prazos legais de guarda fiscal exigidos pela Receita Federal sobre transações de split passadas).
4.  **Revogação do Consentimento:** Retirada da autorização de tratamento de dados a qualquer tempo (acarretando o encerramento imediato do acesso à conta).

---

## 7. Alterações nesta Política

A Plataforma reserva-se o direito de atualizar ou modificar esta Política de Privacidade a qualquer momento para adequação a novas legislações ou alterações de recursos técnicos. Em caso de mudanças significativas, os usuários serão notificados pelo WhatsApp ou por aviso na tela inicial do aplicativo, exigindo-se novo consentimento explícito.

---
*Assinado,*  
**Líder de Privacidade e Proteção de Dados (DPO)** — *Reserva Serviços*
