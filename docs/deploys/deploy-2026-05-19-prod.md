# Relatório de Deploy de Produção — 19/05/2026

## Informações Gerais
- **ID do Deploy:** `deploy-2026-05-19-prod`
- **Ambiente:** Produção (Vercel)
- **URL de Produção:** [https://reserva-servicos.vercel.app](https://reserva-servicos.vercel.app)
- **URL de Preview:** [https://reserva-servicos-7z5a8f5fa-ivan-souzas-projects-6f3b2529.vercel.app](https://reserva-servicos-7z5a8f5fa-ivan-souzas-projects-6f3b2529.vercel.app)
- **Responsável:** DevOps (@devops)
- **Status:** **ONLINE & ESTÁVEL**

---

## Modificações Realizadas
1. **Remoção de Chave Obsoleta no `package.json`**:
   - Removido `"main": "public/index.html"` que confundia o detector de framework da Vercel (fazendo-o identificar como site estático genérico).
   - O projeto agora é corretamente identificado como um projeto **Next.js** completo pela Vercel, otimizando builds e rotas.
2. **Atualização do `.gitignore`**:
   - Adicionada a pasta `.vercel` para prevenir o envio de chaves locais de deploy e configurações de vinculação.
3. **Resolução de Testes E2E (Playwright) & Unitários (Jest)**:
   - Corrigidos testes do Playwright em viewports desktop e mobile (Pixel 5) para se adequar ao design responsivo de abas dinâmicas na Landing Page e a ausência do botão obsoleto na ficha cadastral direta.
   - 100% de cobertura nos formatadores reativos e suite de testes do Playwright validada com **18/18 testes passando com sucesso**.

---

## Testes e Validação
- **Testes Unitários (Jest):** **PASSANDO** (`9/9 testes passados`)
- **Testes E2E (Playwright):** **PASSANDO** (`18/18 testes passados`)
- **Status da Compilação:** `next build` compilado estaticamente com sucesso, sem qualquer erro de transpilação ou dependência.

---

## Sincronização do Histórico Git
- **Estado:** O histórico local e o remoto divergiram de sessões anteriores devido a merges parciais. O estado local possui as correções reais do Milestone 2 e testes funcionais homologados.
- **Ação Recomendada:** Realizar force push (`git push -f origin main`) com a aprovação do operador para sincronizar a base limpa local com a origem.
