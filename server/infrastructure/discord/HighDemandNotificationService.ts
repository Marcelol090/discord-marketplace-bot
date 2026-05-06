import pino from "pino";
import { ChannelPostingService } from "./ChannelPostingService";

const logger = pino();

export interface DemandAlert {
  id: string;
  productId: number;
  productName: string;
  clickCount: number;
  threshold: number;
  alertedAt: Date;
  guildId: string;
  channelId: string;
  status: "active" | "resolved";
}

export class HighDemandNotificationService {
  private channelPostingService: ChannelPostingService;
  private productClickCounts: Map<number, number> = new Map();
  private demandAlerts: Map<string, DemandAlert> = new Map();
  private monitoringInterval: NodeJS.Timeout | null = null;
  private readonly CLICK_THRESHOLD = 10; // Alerta quando atinge 10 cliques
  private readonly RESET_INTERVAL = 3600000; // Reset a cada 1 hora

  constructor() {
    this.channelPostingService = new ChannelPostingService();
    this.startMonitoring();
  }

  /**
   * Track a click and check if threshold is reached
   */
  trackClick(productId: number, productName: string): DemandAlert | null {
    const currentCount = (this.productClickCounts.get(productId) || 0) + 1;
    this.productClickCounts.set(productId, currentCount);

    logger.info(
      { productId, productName, clickCount: currentCount },
      "[HighDemand] Click tracked"
    );

    // Check if threshold is reached
    if (currentCount === this.CLICK_THRESHOLD) {
      return this.createDemandAlert(productId, productName, currentCount);
    }

    return null;
  }

  /**
   * Create and send demand alert
   */
  private createDemandAlert(
    productId: number,
    productName: string,
    clickCount: number
  ): DemandAlert {
    const id = `alert-${productId}-${Date.now()}`;
    const alert: DemandAlert = {
      id,
      productId,
      productName,
      clickCount,
      threshold: this.CLICK_THRESHOLD,
      alertedAt: new Date(),
      guildId: process.env.DISCORD_APPLICATION_ID || "",
      channelId: process.env.PROMOTION_CHANNEL_ID || "",
      status: "active",
    };

    this.demandAlerts.set(id, alert);

    logger.info(
      { alertId: id, productId, productName, clickCount },
      "[HighDemand] Demand alert created"
    );

    // Send notification to Discord
    this.sendDemandNotification(alert);

    return alert;
  }

  /**
   * Send demand notification to Discord
   */
  private async sendDemandNotification(alert: DemandAlert): Promise<void> {
    try {
      const originalPrice = 100; // Preco base simulado
      const discountedPrice = originalPrice * 0.9; // 10% de desconto
      
      const message = {
        guildId: alert.guildId,
        promotionChannelId: alert.channelId,
        title: "🔥 Produto em Alta Demanda!",
        discount: 10, // 10% de desconto
        products: [
          {
            id: alert.productId,
            name: alert.productName,
            originalPrice,
            discountedPrice,
          },
        ],
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24h
      };

      await this.channelPostingService.postPromotion(message);

      logger.info(
        { alertId: alert.id },
        "[HighDemand] Notification sent to Discord"
      );
    } catch (error) {
      logger.error(
        { alertId: alert.id, error },
        "[HighDemand] Failed to send notification"
      );
    }
  }

  /**
   * Get all active demand alerts
   */
  getActiveAlerts(): DemandAlert[] {
    return Array.from(this.demandAlerts.values()).filter((a) => a.status === "active");
  }

  /**
   * Get demand alert by product ID
   */
  getAlertByProductId(productId: number): DemandAlert | undefined {
    return Array.from(this.demandAlerts.values()).find(
      (a) => a.productId === productId && a.status === "active"
    );
  }

  /**
   * Resolve a demand alert
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.demandAlerts.get(alertId);
    if (!alert) return false;

    alert.status = "resolved";
    this.demandAlerts.set(alertId, alert);

    logger.info({ alertId }, "[HighDemand] Alert resolved");
    return true;
  }

  /**
   * Get product click count
   */
  getClickCount(productId: number): number {
    return this.productClickCounts.get(productId) || 0;
  }

  /**
   * Get all product click counts
   */
  getAllClickCounts(): Record<number, number> {
    const result: Record<number, number> = {};
    this.productClickCounts.forEach((count, productId) => {
      result[productId] = count;
    });
    return result;
  }

  /**
   * Reset click counts for a product
   */
  resetProductClicks(productId: number): void {
    this.productClickCounts.delete(productId);
    logger.info({ productId }, "[HighDemand] Product clicks reset");
  }

  /**
   * Start monitoring for high demand products
   */
  private startMonitoring(): void {
    // Reset click counts every hour
    this.monitoringInterval = setInterval(() => {
      const activeAlerts = this.getActiveAlerts();

      activeAlerts.forEach((alert) => {
        // Auto-resolve alerts after 24 hours
        const ageInMs = Date.now() - alert.alertedAt.getTime();
        if (ageInMs > 24 * 60 * 60 * 1000) {
          this.resolveAlert(alert.id);
        }
      });

      // Log current state
      logger.info(
        { clickCounts: this.getAllClickCounts(), activeAlerts: activeAlerts.length },
        "[HighDemand] Monitoring check"
      );
    }, this.RESET_INTERVAL);

    logger.info("[HighDemand] Monitoring started");
  }

  /**
   * Stop monitoring
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      logger.info("[HighDemand] Monitoring stopped");
    }
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return {
      totalProductsTracked: this.productClickCounts.size,
      activeAlerts: this.getActiveAlerts().length,
      totalAlerts: this.demandAlerts.size,
      topProducts: Array.from(this.productClickCounts.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([productId, count]) => ({ productId, count })),
    };
  }
}

// Global instance
export const highDemandNotificationService = new HighDemandNotificationService();
