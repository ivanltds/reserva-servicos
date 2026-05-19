import { test, expect } from "@playwright/test";

test.describe("Jornada de Onboarding do Prestador - E2E", () => {

  test.beforeEach(async ({ page }) => {
    // Carrega a página de onboarding (Landing Page principal do prestador)
    await page.goto("/prestador/cadastro");
    
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
    // Verifica input crucial de CPF
    const cpfInput = page.locator("#reg-cpf");
    await expect(cpfInput).toBeVisible();
  });

  test("Deve garantir conformidade LGPD e ausência de termos de trituração/exclusão", async ({ page }) => {
    const bodyText = await page.locator("body").innerText();
    // Garante que termos inadequados ou assustadores foram removidos
    expect(bodyText).not.toContain("trituração");
    expect(bodyText).not.toContain("exclusão");
    expect(bodyText).not.toContain("triturado");
  });

});

test.describe("Painel de Triagem do Gestor - E2E", () => {

  test("Deve proteger o painel e redirecionar usuário não autenticado para o login", async ({ page }) => {
    await page.goto("/gestor/painel");
    // Aguarda o redirecionamento automático de segurança para a tela de login
    await page.waitForURL("**/login");
    // Confirma que os inputs do formulário de login estão visíveis e funcionais
    const emailInput = page.locator("#login-email");
    await expect(emailInput).toBeVisible();
    const passwordInput = page.locator("#login-password");
    await expect(passwordInput).toBeVisible();
  });

});
