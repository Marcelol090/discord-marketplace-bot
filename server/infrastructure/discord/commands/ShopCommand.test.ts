import { describe, it, expect, beforeEach, vi } from "vitest";
import { DiscordWebhookService } from "../DiscordWebhookService";
import { DiscordInteraction } from "@shared/discord-types";

describe("ShopCommand", () => {
  let webhookService: DiscordWebhookService;

  beforeEach(() => {
    webhookService = new DiscordWebhookService("test-public-key");
  });

  it("should identify shop command correctly", () => {
    const interaction: DiscordInteraction = {
      type: 2, // COMMAND
      data: {
        name: "shop",
        type: 1,
      },
      user: {
        id: "123456789",
        username: "testuser",
      },
      token: "test-token",
      id: "interaction-id",
    };

    const isCommand = webhookService.isSlashCommand(interaction);
    expect(isCommand).toBe(true);
  });

  it("should create valid command response", () => {
    const response = webhookService.createCommandResponse("Test message");
    expect(response).toEqual({
      type: 4,
      data: {
        content: "Test message",
        flags: 0,
      },
    });
  });

  it("should create ephemeral command response", () => {
    const response = webhookService.createCommandResponse("Test message", true);
    expect(response).toEqual({
      type: 4,
      data: {
        content: "Test message",
        flags: 64,
      },
    });
  });

  it("should identify button clicks", () => {
    const interaction: DiscordInteraction = {
      type: 3, // MESSAGE_COMPONENT
      data: {
        custom_id: "add_to_cart_1",
        component_type: 2,
      },
      user: {
        id: "123456789",
        username: "testuser",
      },
      token: "test-token",
      id: "interaction-id",
    };

    const isButton = webhookService.isButtonClick(interaction);
    expect(isButton).toBe(true);
  });

  it("should identify select menus", () => {
    const interaction: DiscordInteraction = {
      type: 3, // MESSAGE_COMPONENT
      data: {
        custom_id: "category_select",
        component_type: 3,
        values: ["1"],
      },
      user: {
        id: "123456789",
        username: "testuser",
      },
      token: "test-token",
      id: "interaction-id",
    };

    const isSelectMenu = webhookService.isSelectMenu(interaction);
    expect(isSelectMenu).toBe(true);
  });
});
