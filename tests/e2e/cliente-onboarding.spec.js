import { test, expect } from "@playwright/test";

test.describe("Landing Page Comercial Principal - E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("Deve carregar a Landing Page Comercial Geral com elementos principais", async ({ page }) => {
    // Verifica logo e badges principais
    await expect(page.locator("text=RESERVA SERVIÇOS").first()).toBeVisible();
    
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;
    if (!isMobile) {
      await expect(page.locator("text=PLATAFORMA INDEPENDENTE")).toBeVisible();
    }
    
    // Deve exibir o cabeçalho principal
    await expect(page.locator("h1")).toContainText("Serviços de Confiança, Bem do seu Lado");
  });

  test("Deve exibir painéis Split Lado Morador e Lado Prestador", async ({ page }) => {
    const viewport = page.viewportSize();
    const isMobile = viewport && viewport.width < 768;

    if (isMobile) {
      const moradorTab = page.locator("text=Sou Morador (Contratar)").first();
      // Espera até que o botão esteja visível (garante hidratação/renderização móvel)
      await expect(moradorTab).toBeVisible();
      await moradorTab.click();
      await expect(page.locator("text=CADASTRAR E CONTRATAR")).toBeVisible();
      await expect(page.locator("text=CADASTRAR E TRABALHAR")).toBeHidden();

      // Clica na aba do Prestador
      const prestadorTab = page.locator("text=Sou Prestador (Trabalhar)").first();
      await expect(prestadorTab).toBeVisible();
      await prestadorTab.click();
      await expect(page.locator("text=CADASTRAR E TRABALHAR")).toBeVisible();
      await expect(page.locator("text=CADASTRAR E CONTRATAR")).toBeHidden();
    } else {
      // No desktop, ambos os painéis são exibidos lado a lado
      await expect(page.locator("text=Ajuda de Confiança, bem do seu lado")).toBeVisible();
      await expect(page.locator("text=CADASTRAR E CONTRATAR")).toBeVisible();
      await expect(page.locator("text=Trabalhe Perto de Casa")).toBeVisible();
      await expect(page.locator("text=CADASTRAR E TRABALHAR")).toBeVisible();
    }
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

  test("Deve carregar a página de cadastro do morador", async ({ page }) => {
    await expect(page.locator("h2:has-text('Ficha Cadastral do Cliente')")).toBeVisible();
    await expect(page.locator("#reg-name")).toBeVisible();
  });

  test("Deve testar CEP autofill na ficha cadastral do morador", async ({ page }) => {
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
