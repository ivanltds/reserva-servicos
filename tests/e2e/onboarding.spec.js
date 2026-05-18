import { test, expect } from "@playwright/test";

test.describe("Jornada de Onboarding do Prestador - E2E", () => {

  test.beforeEach(async ({ page }) => {
    // Carrega a página de onboarding (Landing Page principal)
    await page.goto("/index.html");
    
    // Aceita os termos de privacidade para fechar o cookie banner se estiver visível
    const acceptBtn = page.locator("text=Aceitar Termos");
    try {
      if (await acceptBtn.isVisible()) {
        await acceptBtn.click();
        // Aguarda o banner de cookies sumir completamente da tela (animação de fadeOut)
        await expect(page.locator("#cookiesBanner")).toBeHidden();
      }
    } catch (e) {
      // Ignore if not present
    }
  });

  test("Deve carregar a tela de onboarding com sucesso", async ({ page }) => {
    // Verifica se a tela renderizou os elementos fundamentais
    const heading = page.locator("h1, h2");
    await expect(heading.first()).toBeVisible();
  });

  test("Deve exibir campos do formulário para o onboarding", async ({ page }) => {
    // Clica no botão para iniciar e abrir o formulário (forçando o clique devido à animação infinita de pulso)
    await page.click("text=COMEÇAR A FATURAR AGORA", { force: true });

    // Verifica input crucial de CPF
    const cpfInput = page.locator("#reg-cpf");
    await expect(cpfInput).toBeVisible();
  });

  test("Deve garantir conformidade LGPD e ausência de termos de trituração/exclusão", async ({ page }) => {
    await page.click("text=COMEÇAR A FATURAR AGORA", { force: true });
    
    const bodyText = await page.locator("body").innerText();
    // Garante que termos inadequados ou assustadores foram removidos
    expect(bodyText).not.toContain("trituração");
    expect(bodyText).not.toContain("exclusão");
    expect(bodyText).not.toContain("triturado");
  });

});

test.describe("Painel de Triagem do Gestor - E2E", () => {

  test("Deve carregar o Painel de Triagem Desktop", async ({ page }) => {
    await page.goto("/gestor-painel.html");
    // Verifica título ou elemento do cabeçalho do gestor
    const dashboardTitle = page.locator("h1, h2");
    await expect(dashboardTitle.first()).toBeVisible();
  });

});
