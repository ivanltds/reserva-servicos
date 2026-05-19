import { test, expect } from "@playwright/test";

test.describe("Landing Page Comercial Principal - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Deve carregar a Landing Page Comercial Geral com elementos principais", async ({ page }) => {
    // Verifica logo e badges principais
    await expect(page.locator("text=RESERVA SERVIÇOS")).toBeVisible();
    await expect(page.locator("text=SERVIÇOS PERTO DE VOCÊ")).toBeVisible();
    
    // Deve exibir o cabeçalho principal
    await expect(page.locator("h1")).toContainText("Serviços de Confiança, Bem do seu Lado");
  });

  test("Deve exibir painéis Split Lado Morador e Lado Prestador", async ({ page }) => {
    const moradorTab = page.locator("text=Sou Morador (Contratar)");
    const isMobile = await moradorTab.isVisible();

    if (isMobile) {
      await moradorTab.click({ force: true });
      await page.waitForTimeout(200); // Aguarda a transição de estado do React
    }
    // Painel do Morador
    await expect(page.locator("text=Ajuda de Confiança, bem do seu lado")).toBeVisible();
    await expect(page.locator("text=CADASTRAR E CONTRATAR")).toBeVisible();

    if (isMobile) {
      const prestadorTab = page.locator("text=Sou Prestador (Trabalhar)");
      await prestadorTab.click({ force: true });
      await page.waitForTimeout(200); // Aguarda transição do React
    }
    // Painel do Prestador
    await expect(page.locator("text=Trabalhe Perto de Casa")).toBeVisible();
    await expect(page.locator("text=CADASTRAR E TRABALHAR")).toBeVisible();
  });



  test("Deve interagir com simuladores de Orçamento e Ganhos na LP Comercial", async ({ page }) => {
    // No simulador do morador, troca para "Marido de Aluguel"
    const maridoBtn = page.locator("button:has-text('Marido de Aluguel')").first();
    await maridoBtn.click();
    
    // Verifica se mostra valor correspondente
    await expect(page.locator("text=Valor Estimado da Visita")).toBeVisible();
  });
});

test.describe("Jornada de Onboarding do Morador (Cliente) - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/cliente/cadastro");
    
    // Aceita termos se banner de cookies estiver visível
    try {
      const acceptBtn = page.locator("text=Aceitar Termos");
      if (await acceptBtn.isVisible()) {
        await acceptBtn.click();
      }
    } catch (e) {}
  });

  test("Deve carregar a página de cadastro do morador com simulador", async ({ page }) => {
    await expect(page.locator("h2:has-text('Simule o Orçamento')")).toBeVisible();
    await expect(page.locator("text=CADASTRE-SE E CHAME UM PROFISSIONAL")).toBeVisible();
  });

  test("Deve avançar para a ficha cadastral do morador e testar CEP autofill", async ({ page }) => {
    // Avança para o Step 1
    await page.click("text=CADASTRE-SE E CHAME UM PROFISSIONAL", { force: true });
    
    // Preenche CEP específico para disparar preenchimento automático
    const cepInput = page.locator("#reg-cep");
    await expect(cepInput).toBeVisible();
    
    await cepInput.fill("05386-300");
    
    // Aguarda o preenchimento automático do bairro e rua
    const ruaInput = page.locator("#reg-rua");
    await expect(ruaInput).toHaveValue("Av. Engenheiro Heitor Antônio Eiras Garcia");
    
    const bairroInput = page.locator("#reg-bairro");
    await expect(bairroInput).toHaveValue("Jardim Raposo Tavares");
  });
});
