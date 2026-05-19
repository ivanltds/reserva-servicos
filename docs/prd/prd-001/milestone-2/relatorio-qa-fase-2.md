# Relatório de Garantia de Qualidade (QA) - Milestone 2
> STATUS: APROVADO E HOMOLOGADO 

Este documento consolida os resultados dos testes automatizados e validações manuais executados no Milestone 2, atestando o funcionamento seguro da nova **Landing Page Comercial Geral** e da **Jornada de Onboarding do Morador (Cliente)**.

---

## 1. Cobertura de Testes Executados
Neste milestone, implementamos uma nova suíte modular de testes de ponta a ponta (E2E) com o Playwright para certificar a nova jornada comercial de moradores e a integridade do fluxo dos prestadores.

### Testes E2E (Playwright) — `tests/e2e/cliente-onboarding.spec.js`
- **Landing Page Comercial Principal**:
  - `Deve carregar a Landing Page Comercial Geral com elementos principais`: Certifica que o cabeçalho, logo neutra "Reserva Serviços", e badges do megacomplexo "Reserva Raposo" estão visíveis.
  - `Deve exibir painéis Split Lado Morador e Lado Prestador`: Garante a visibilidade e reatividade de ambos os lados no desktop e a correta alternância reativa via abas no mobile.
  - `Deve interagir com simuladores de Orçamento e Ganhos na LP Comercial`: Valida que o estimador de orçamentos responde instantaneamente a cliques de mudança de escopo.
- **Jornada de Onboarding do Morador (Cliente)**:
  - `Deve carregar a página de cadastro do morador com simulador`: Valida a exibição da calculadora em cor Emerald e dos termos de privacidade da LGPD.
  - `Deve avançar para a ficha cadastral do morador e testar CEP autofill`: Insere o CEP hiperlocal `05386-300` e verifica se os campos de bairro ("Jardim Raposo Tavares") e logradouro ("Av. Engenheiro Heitor Antônio Eiras Garcia") são preenchidos instantaneamente por preenchimento automático.

---

## 2. Resumo da Execução de Testes

Toda a suíte de testes (Jest para testes unitários de formatadores reativos e Playwright para as jornadas de navegador) foi executada e homologada localmente com **100% de aproveitamento**:

```bash
> reserva-servicos@1.0.0 test:e2e
> playwright test

Running 18 tests using 6 workers

  18 passed (17.9s)
Exit code: 0
```

---

## 3. Conformidade Legal e de Experiência
1. **Minimização de Dados (LGPD)**: O onboarding de moradores coleta estritamente dados civis básicos para fins de cadastro e verificação física em portaria condominial (Rua, Número, Bloco/Torre e CEP). Não há arquivamento de biometrias ou dados excessivos.
2. **Diretrizes de Salvaguarda de Propriedade Intelectual**: Toda a interface foi projetada de forma neutra, utilizando a denominação oficial **Reserva Serviços**, sem ferir patentes ou marcas registradas.
3. **Trava Trabalhista (Anti-Vínculo)**: Foram inseridas as devidas cláusulas de intermediação neutra (C2C) e proteção mutualista diretamente nos modais de Termos de Uso e Políticas de Privacidade.
