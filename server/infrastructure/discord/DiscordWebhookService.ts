import crypto from "crypto";
import { DiscordInteraction, DiscordInteractionResponse } from "@shared/discord-types";

/**
 * Service to handle Discord webhook verification and interaction processing
 */
export class DiscordWebhookService {
  private publicKey: string;

  constructor(publicKey: string) {
    this.publicKey = publicKey;
  }

  /**
   * Verify Discord webhook signature
   * Discord sends: X-Signature-Ed25519 and X-Signature-Timestamp headers
   */
  verifySignature(
    rawBody: string,
    signature: string,
    timestamp: string
  ): boolean {
    try {
      const message = timestamp + rawBody;
      const isValid = crypto.verify(
        "ed25519",
        Buffer.from(message),
        this.publicKey,
        Buffer.from(signature, "hex")
      );
      return isValid;
    } catch (error) {
      console.error("Signature verification failed:", error);
      return false;
    }
  }

  /**
   * Parse interaction from request body
   */
  parseInteraction(body: string): DiscordInteraction {
    return JSON.parse(body);
  }

  /**
   * Handle PING interaction (Discord verification)
   */
  handlePing(): DiscordInteractionResponse {
    return {
      type: 1, // PONG
    };
  }

  /**
   * Create a response for slash command
   */
  createCommandResponse(
    content: string,
    ephemeral: boolean = false
  ): DiscordInteractionResponse {
    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        content,
        flags: ephemeral ? 64 : 0, // 64 = EPHEMERAL
      },
    };
  }

  /**
   * Create a deferred response (for long-running operations)
   */
  createDeferredResponse(ephemeral: boolean = false): DiscordInteractionResponse {
    return {
      type: 5, // DEFERRED_CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        flags: ephemeral ? 64 : 0,
      },
    };
  }

  /**
   * Create an embed response
   */
  createEmbedResponse(
    embeds: any[],
    ephemeral: boolean = false
  ): DiscordInteractionResponse {
    return {
      type: 4, // CHANNEL_MESSAGE_WITH_SOURCE
      data: {
        embeds,
        flags: ephemeral ? 64 : 0,
      },
    };
  }

  /**
   * Create a modal response
   */
  createModalResponse(customId: string, title: string, components: any[]): DiscordInteractionResponse {
    return {
      type: 9, // MODAL
      data: {
        custom_id: customId,
        title,
        components,
      },
    };
  }

  /**
   * Check if interaction is a slash command
   */
  isSlashCommand(interaction: DiscordInteraction): boolean {
    return interaction.type === 2; // APPLICATION_COMMAND
  }

  /**
   * Check if interaction is a button click
   */
  isButtonClick(interaction: DiscordInteraction): boolean {
    return interaction.type === 3; // MESSAGE_COMPONENT
  }

  /**
   * Check if interaction is a select menu
   */
  isSelectMenu(interaction: DiscordInteraction): boolean {
    return (
      interaction.type === 3 &&
      (interaction.data?.custom_id?.includes("select") ?? false)
    );
  }

  /**
   * Check if interaction is a modal submission
   */
  isModalSubmission(interaction: DiscordInteraction): boolean {
    return interaction.type === 5; // MODAL_SUBMIT
  }

  /**
   * Get command name from interaction
   */
  getCommandName(interaction: DiscordInteraction): string | null {
    return interaction.data?.name || null;
  }

  /**
   * Get option value from interaction
   */
  getOptionValue(
    interaction: DiscordInteraction,
    optionName: string
  ): string | number | boolean | null {
    const option = interaction.data?.options?.find((o) => o.name === optionName);
    return option?.value ?? null;
  }

  /**
   * Get all option values from interaction
   */
  getOptions(interaction: DiscordInteraction): Record<string, any> {
    const options: Record<string, any> = {};
    interaction.data?.options?.forEach((option) => {
      options[option.name] = option.value;
    });
    return options;
  }
}
