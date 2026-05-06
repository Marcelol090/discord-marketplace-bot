import pino from "pino";

const logger = pino();

export interface EmbedVariant {
  id: string;
  productId: number;
  variantName: string; // "Variant A", "Variant B", etc
  embedConfig: {
    color: string; // hex color
    title: string;
    description: string;
    imageUrl?: string;
    fields?: Array<{ name: string; value: string; inline?: boolean }>;
  };
  createdAt: Date;
  isActive: boolean;
}

export interface ABTestResult {
  id: string;
  productId: number;
  variantAId: string;
  variantBId: string;
  variantAClicks: number;
  variantBClicks: number;
  variantAConversion: number;
  variantBConversion: number;
  winner?: string; // "A" or "B"
  startedAt: Date;
  endedAt?: Date;
  status: "running" | "completed" | "paused";
  confidence: number; // 0-100
}

export class EmbedABTestingService {
  private embedVariants: Map<string, EmbedVariant> = new Map();
  private abTests: Map<string, ABTestResult> = new Map();
  private variantClicks: Map<string, number> = new Map();
  private variantConversions: Map<string, number> = new Map();

  /**
   * Create a new embed variant
   */
  createVariant(
    productId: number,
    variantName: string,
    embedConfig: EmbedVariant["embedConfig"]
  ): EmbedVariant {
    const id = `variant-${productId}-${Date.now()}`;
    const variant: EmbedVariant = {
      id,
      productId,
      variantName,
      embedConfig,
      createdAt: new Date(),
      isActive: true,
    };

    this.embedVariants.set(id, variant);
    this.variantClicks.set(id, 0);
    this.variantConversions.set(id, 0);

    logger.info(
      { variantId: id, productId, variantName },
      "[ABTesting] Embed variant created"
    );

    return variant;
  }

  /**
   * Start an A/B test between two variants
   */
  startTest(
    productId: number,
    variantAId: string,
    variantBId: string,
    durationHours: number = 24
  ): ABTestResult {
    const testId = `test-${productId}-${Date.now()}`;
    const test: ABTestResult = {
      id: testId,
      productId,
      variantAId,
      variantBId,
      variantAClicks: 0,
      variantBClicks: 0,
      variantAConversion: 0,
      variantBConversion: 0,
      startedAt: new Date(),
      status: "running",
      confidence: 0,
    };

    this.abTests.set(testId, test);

    // Auto-complete test after duration
    setTimeout(() => {
      this.completeTest(testId);
    }, durationHours * 60 * 60 * 1000);

    logger.info(
      { testId, productId, variantAId, variantBId, durationHours },
      "[ABTesting] A/B test started"
    );

    return test;
  }

  /**
   * Track a click for a variant
   */
  trackVariantClick(variantId: string): void {
    const clicks = (this.variantClicks.get(variantId) || 0) + 1;
    this.variantClicks.set(variantId, clicks);

    logger.debug({ variantId, clicks }, "[ABTesting] Variant click tracked");
  }

  /**
   * Track a conversion for a variant
   */
  trackVariantConversion(variantId: string): void {
    const conversions = (this.variantConversions.get(variantId) || 0) + 1;
    this.variantConversions.set(variantId, conversions);

    logger.debug(
      { variantId, conversions },
      "[ABTesting] Variant conversion tracked"
    );
  }

  /**
   * Get variant statistics
   */
  getVariantStats(variantId: string) {
    const clicks = this.variantClicks.get(variantId) || 0;
    const conversions = this.variantConversions.get(variantId) || 0;
    const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;

    return {
      variantId,
      clicks,
      conversions,
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    };
  }

  /**
   * Calculate chi-square test for statistical significance
   */
  private calculateConfidence(variantA: any, variantB: any): number {
    const n1 = variantA.clicks;
    const n2 = variantB.clicks;
    const p1 = variantA.conversions / Math.max(n1, 1);
    const p2 = variantB.conversions / Math.max(n2, 1);
    const p = (variantA.conversions + variantB.conversions) / (n1 + n2);

    const chiSquare =
      ((n1 * p1 - n1 * p) ** 2) / (n1 * p * (1 - p)) +
      ((n2 * p2 - n2 * p) ** 2) / (n2 * p * (1 - p));

    // Approximate confidence level (simplified)
    // Chi-square value of 3.84 = 95% confidence
    const confidence = Math.min(100, (chiSquare / 3.84) * 95);

    return parseFloat(confidence.toFixed(1));
  }

  /**
   * Complete an A/B test and determine winner
   */
  completeTest(testId: string): ABTestResult | null {
    const test = this.abTests.get(testId);
    if (!test) return null;

    const variantAStats = this.getVariantStats(test.variantAId);
    const variantBStats = this.getVariantStats(test.variantBId);

    test.variantAClicks = variantAStats.clicks;
    test.variantBClicks = variantBStats.clicks;
    test.variantAConversion = variantAStats.conversionRate;
    test.variantBConversion = variantBStats.conversionRate;
    test.confidence = this.calculateConfidence(variantAStats, variantBStats);
    test.endedAt = new Date();
    test.status = "completed";

    // Determine winner
    if (test.variantAConversion > test.variantBConversion) {
      test.winner = "A";
    } else if (test.variantBConversion > test.variantAConversion) {
      test.winner = "B";
    }

    this.abTests.set(testId, test);

    logger.info(
      {
        testId,
        winner: test.winner,
        confidence: test.confidence,
        variantAConversion: test.variantAConversion,
        variantBConversion: test.variantBConversion,
      },
      "[ABTesting] A/B test completed"
    );

    return test;
  }

  /**
   * Get all active tests
   */
  getActiveTests(): ABTestResult[] {
    return Array.from(this.abTests.values()).filter((t) => t.status === "running");
  }

  /**
   * Get test by ID
   */
  getTest(testId: string): ABTestResult | undefined {
    return this.abTests.get(testId);
  }

  /**
   * Get all variants for a product
   */
  getProductVariants(productId: number): EmbedVariant[] {
    return Array.from(this.embedVariants.values()).filter(
      (v) => v.productId === productId
    );
  }

  /**
   * Get variant by ID
   */
  getVariant(variantId: string): EmbedVariant | undefined {
    return this.embedVariants.get(variantId);
  }

  /**
   * Activate a variant
   */
  activateVariant(variantId: string): boolean {
    const variant = this.embedVariants.get(variantId);
    if (!variant) return false;

    variant.isActive = true;
    this.embedVariants.set(variantId, variant);

    logger.info({ variantId }, "[ABTesting] Variant activated");
    return true;
  }

  /**
   * Deactivate a variant
   */
  deactivateVariant(variantId: string): boolean {
    const variant = this.embedVariants.get(variantId);
    if (!variant) return false;

    variant.isActive = false;
    this.embedVariants.set(variantId, variant);

    logger.info({ variantId }, "[ABTesting] Variant deactivated");
    return true;
  }

  /**
   * Get test results summary
   */
  getTestSummary(testId: string) {
    const test = this.abTests.get(testId);
    if (!test) return null;

    const variantA = this.embedVariants.get(test.variantAId);
    const variantB = this.embedVariants.get(test.variantBId);

    return {
      testId,
      status: test.status,
      winner: test.winner,
      confidence: test.confidence,
      variantA: {
        name: variantA?.variantName,
        clicks: test.variantAClicks,
        conversions: test.variantAConversion,
      },
      variantB: {
        name: variantB?.variantName,
        clicks: test.variantBClicks,
        conversions: test.variantBConversion,
      },
      duration: test.endedAt
        ? Math.round(
            (test.endedAt.getTime() - test.startedAt.getTime()) / 1000 / 60
          )
        : Math.round(
            (Date.now() - test.startedAt.getTime()) / 1000 / 60
          ),
    };
  }

  /**
   * Get all tests
   */
  getAllTests(): ABTestResult[] {
    return Array.from(this.abTests.values());
  }

  /**
   * Get statistics for all variants of a product
   */
  getProductStats(productId: number) {
    const variants = this.getProductVariants(productId);
    return variants.map((v) => ({
      ...v,
      stats: this.getVariantStats(v.id),
    }));
  }
}

// Global instance
export const embedABTestingService = new EmbedABTestingService();
