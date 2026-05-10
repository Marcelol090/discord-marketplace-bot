import { describe, it, expect, vi, beforeEach } from "vitest";
import { DigitalDeliveryService } from "./DigitalDeliveryService";
import axios from "axios";

// Mock axios
vi.mock("axios");
vi.mock("../../storage", () => ({
  storagePut: vi.fn(),
  storageGet: vi.fn().mockResolvedValue({
    url: "https://storage.example.com/file.otbm",
    key: "test-key",
  }),
}));

describe("DigitalDeliveryService", () => {
  let service: DigitalDeliveryService;
  const mockDiscordUserId = "123456789";
  const mockOrderId = 1;
  const mockAssetKey = "test-asset-key";
  const mockProductName = "Hunt Grande com Border";

  beforeEach(() => {
    service = new DigitalDeliveryService();
    vi.clearAllMocks();
  });

  describe("deliverDigitalAsset", () => {
    it("should deliver a single digital asset via DM", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });
      mockAxios.post.mockResolvedValueOnce({ data: { id: "message-123" } });

      const result = await service.deliverDigitalAsset(
        mockDiscordUserId,
        mockProductName,
        mockAssetKey,
        mockOrderId
      );

      expect(result).toBe(true);
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it("should return false if DM channel creation fails", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockRejectedValueOnce(new Error("Failed to create DM"));

      const result = await service.deliverDigitalAsset(
        mockDiscordUserId,
        mockProductName,
        mockAssetKey,
        mockOrderId
      );

      expect(result).toBe(false);
    });

    it("should return false if bot token is not configured", async () => {
      // Temporarily override the bot token
      const originalToken = process.env.DISCORD_BOT_TOKEN;
      delete process.env.DISCORD_BOT_TOKEN;

      const result = await service.deliverDigitalAsset(
        mockDiscordUserId,
        mockProductName,
        mockAssetKey,
        mockOrderId
      );

      expect(result).toBe(false);

      // Restore original token
      if (originalToken) {
        process.env.DISCORD_BOT_TOKEN = originalToken;
      }
    });
  });

  describe("deliverMultipleAssets", () => {
    it("should deliver multiple digital assets", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });
      mockAxios.post.mockResolvedValueOnce({ data: { id: "message-123" } });

      const items = [
        { name: "Hunt Grande", assetKey: "asset-1" },
        { name: "Quest Snow", assetKey: "asset-2" },
      ];

      const result = await service.deliverMultipleAssets(
        mockDiscordUserId,
        items,
        mockOrderId
      );

      expect(result).toBe(true);
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it("should return false if no valid items are found", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });

      // Mock storageGet to return null for all items
      const { storageGet } = await import("../../storage");
      (storageGet as any).mockRejectedValue(new Error("Failed to get URL"));

      const items = [
        { name: "Hunt Grande", assetKey: "asset-1" },
        { name: "Quest Snow", assetKey: "asset-2" },
      ];

      const result = await service.deliverMultipleAssets(
        mockDiscordUserId,
        items,
        mockOrderId
      );

      expect(result).toBe(false);
    });
  });

  describe("notifyOrderConfirmed", () => {
    it("should send order confirmation notification", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });
      mockAxios.post.mockResolvedValueOnce({ data: { id: "message-123" } });

      const result = await service.notifyOrderConfirmed(
        mockDiscordUserId,
        mockOrderId,
        299.97,
        "pix"
      );

      expect(result).toBe(true);
      expect(mockAxios.post).toHaveBeenCalledTimes(2);
    });

    it("should include correct payment method in notification", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });
      mockAxios.post.mockResolvedValueOnce({ data: { id: "message-123" } });

      await service.notifyOrderConfirmed(
        mockDiscordUserId,
        mockOrderId,
        299.97,
        "credit_card"
      );

      const callArgs = mockAxios.post.mock.calls[1][1];
      expect(callArgs.embeds[0].fields).toContainEqual(
        expect.objectContaining({
          name: "💳 Método de Pagamento",
          value: "💳 Cartão de Crédito",
        })
      );
    });
  });

  describe("createDMChannel", () => {
    it("should create a DM channel with the user", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockResolvedValueOnce({ data: { id: "dm-channel-123" } });

      // Access private method through type casting
      const result = await (service as any).createDMChannel(mockDiscordUserId);

      expect(result).toBe("dm-channel-123");
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining("/users/@me/channels"),
        { recipient_id: mockDiscordUserId },
        expect.any(Object)
      );
    });

    it("should return null if DM creation fails", async () => {
      const mockAxios = axios as any;
      mockAxios.post.mockRejectedValueOnce(new Error("Failed to create DM"));

      const result = await (service as any).createDMChannel(mockDiscordUserId);

      expect(result).toBeNull();
    });
  });
});
