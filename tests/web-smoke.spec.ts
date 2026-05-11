import { expect, test } from "@playwright/test";

test.describe("Discord Marketplace web smoke", () => {
  test("renders shop page", async ({ page }) => {
    await page.goto("/shop");

    await expect(page.getByRole("heading", { name: /Marketplace/ })).toBeVisible();
    await expect(page.getByText("Nenhum produto disponível no momento.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Carrinho/ })).toBeVisible();
  });

  test("navigates from cart to shop", async ({ page }) => {
    await page.goto("/cart");

    await expect(page.getByRole("heading", { name: /Carrinho de Compras/ })).toBeVisible();
    await page.getByRole("button", { name: /Continuar comprando/ }).click();

    await expect(page).toHaveURL(/\/shop$/);
    await expect(page.getByRole("heading", { name: /Marketplace/ })).toBeVisible();
  });

  test("renders checkout and orders pages", async ({ page }) => {
    await page.goto("/checkout");

    await expect(page.getByRole("heading", { name: /Checkout/ })).toBeVisible();
    await expect(page.getByText("Endereço de Entrega")).toBeVisible();
    await expect(page.getByText("Método de Pagamento")).toBeVisible();

    await page.goto("/orders");
    await expect(page.getByRole("heading", { name: /Meus Pedidos/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /Nenhum pedido realizado/ })).toBeVisible();
  });

  test("generates PIX checkout QR code", async ({ page }) => {
    await page.goto("/checkout");

    await page.getByRole("button", { name: "Gerar QR Code PIX" }).click();

    await expect(page.getByRole("img", { name: "QR Code PIX" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Copiar" })).toBeVisible();
  });

  test("completes card checkout flow", async ({ page }) => {
    await page.goto("/checkout");

    await page.getByRole("tab", { name: "Cartão de Crédito" }).click();
    await page.getByLabel("Número do Cartão").fill("4111111111111111");
    await page.getByLabel("Nome no Cartão").fill("JOÃO SILVA");
    await page.getByLabel("Validade").fill("12/29");
    await page.getByLabel("CVV").fill("123");

    await page.getByRole("button", { name: "Finalizar Pedido" }).click();

    await expect(page).toHaveURL(/\/orders$/);
    await expect(page.getByRole("heading", { name: /Meus Pedidos/ })).toBeVisible();
  });

  test("goes home from not found", async ({ page }) => {
    await page.goto("/missing-route");

    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await page.getByRole("button", { name: /Go Home/ }).click();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("button", { name: "Example Button" })).toBeVisible();
  });
});