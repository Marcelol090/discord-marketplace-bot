import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("Discord Credentials", () => {
  it("should have Discord bot token configured", () => {
    expect(ENV.discordBotToken).toBeDefined();
    expect(ENV.discordBotToken).toMatch(/^[A-Za-z0-9._-]+$/);
    expect(ENV.discordBotToken.length).toBeGreaterThan(20);
  });

  it("should have Discord public key configured", () => {
    expect(ENV.discordPublicKey).toBeDefined();
    expect(ENV.discordPublicKey).toMatch(/^[a-f0-9]{64}$/);
  });

  it("should have Discord application ID configured", () => {
    expect(ENV.discordApplicationId).toBeDefined();
    expect(ENV.discordApplicationId).toMatch(/^\d+$/);
  });

  it("should have PIX key configured", () => {
    expect(ENV.pixKey).toBeDefined();
    // PIX key can be CPF, CNPJ, email or random UUID
    expect(ENV.pixKey.length).toBeGreaterThan(0);
  });

  it("should validate Discord bot token format", () => {
    // Discord tokens can be in various formats
    const token = ENV.discordBotToken;
    expect(token).toMatch(/^[A-Za-z0-9._-]+$/);
  });

  it("should validate Discord public key is hexadecimal", () => {
    const publicKey = ENV.discordPublicKey;
    expect(/^[a-f0-9]+$/.test(publicKey)).toBe(true);
  });
});
