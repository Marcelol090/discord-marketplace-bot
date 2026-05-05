import pino from "pino";

const logger = pino();

export interface ButtonClick {
  id: string;
  buttonId: string;
  userId: string;
  productId: number;
  timestamp: Date;
  action: "buy" | "view" | "add_to_cart";
}

export interface ButtonAnalytics {
  buttonId: string;
  totalClicks: number;
  uniqueUsers: number;
  clicksByAction: Record<string, number>;
  lastClicked: Date;
  conversionRate?: number;
}

export class ButtonClickTracker {
  private clicks: Map<string, ButtonClick> = new Map();
  private analytics: Map<string, ButtonAnalytics> = new Map();

  /**
   * Track a button click
   */
  trackClick(
    buttonId: string,
    userId: string,
    productId: number,
    action: "buy" | "view" | "add_to_cart" = "buy"
  ): ButtonClick {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const click: ButtonClick = {
      id,
      buttonId,
      userId,
      productId,
      timestamp: new Date(),
      action,
    };

    this.clicks.set(id, click);
    this.updateAnalytics(buttonId, click);

    logger.info(
      { buttonId, userId, productId, action },
      "[ButtonTracker] Click tracked"
    );

    return click;
  }

  /**
   * Get analytics for a button
   */
  getButtonAnalytics(buttonId: string): ButtonAnalytics | undefined {
    return this.analytics.get(buttonId);
  }

  /**
   * Get all analytics
   */
  getAllAnalytics(): ButtonAnalytics[] {
    return Array.from(this.analytics.values());
  }

  /**
   * Get clicks for a specific product
   */
  getProductClicks(productId: number): ButtonClick[] {
    return Array.from(this.clicks.values()).filter((c) => c.productId === productId);
  }

  /**
   * Get clicks by user
   */
  getUserClicks(userId: string): ButtonClick[] {
    return Array.from(this.clicks.values()).filter((c) => c.userId === userId);
  }

  /**
   * Get top clicked buttons
   */
  getTopButtons(limit: number = 10): ButtonAnalytics[] {
    return Array.from(this.analytics.values())
      .sort((a, b) => b.totalClicks - a.totalClicks)
      .slice(0, limit);
  }

  /**
   * Get clicks in a time range
   */
  getClicksInRange(startDate: Date, endDate: Date): ButtonClick[] {
    return Array.from(this.clicks.values()).filter(
      (c) => c.timestamp >= startDate && c.timestamp <= endDate
    );
  }

  /**
   * Clear old analytics (older than 30 days)
   */
  clearOldAnalytics(daysOld: number = 30): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    let removed = 0;
    this.clicks.forEach((click, id) => {
      if (click.timestamp < cutoffDate) {
        this.clicks.delete(id);
        removed++;
      }
    });

    logger.info({ removed, daysOld }, "[ButtonTracker] Old analytics cleared");
    return removed;
  }

  /**
   * Private method to update analytics
   */
  private updateAnalytics(buttonId: string, click: ButtonClick): void {
    let analytics = this.analytics.get(buttonId);

    if (!analytics) {
      analytics = {
        buttonId,
        totalClicks: 0,
        uniqueUsers: 0,
        clicksByAction: {},
        lastClicked: new Date(),
      };
    }

    // Update total clicks
    analytics.totalClicks++;

    // Update clicks by action
    analytics.clicksByAction[click.action] =
      (analytics.clicksByAction[click.action] || 0) + 1;

    // Update last clicked
    analytics.lastClicked = click.timestamp;

    // Count unique users (simplified - in production, use a Set)
    const uniqueUsers = new Set(
      Array.from(this.clicks.values())
        .filter((c) => c.buttonId === buttonId)
        .map((c) => c.userId)
    );
    analytics.uniqueUsers = uniqueUsers.size;

    this.analytics.set(buttonId, analytics);
  }
}

// Global instance
export const buttonTracker = new ButtonClickTracker();
