import type { BehavioralFeatures, NormalizedFeatures } from '@/sdk/types';

/**
 * FeatureExtractor converts raw behavioral signals into normalized 0-1 values.
 * It uses domain-sensible min-max normalization to prepare features for
 * intent classification and vector embedding.
 */
export class FeatureExtractor {
  /**
   * Extract and normalize raw behavioral features.
   */
  public static extract(raw: BehavioralFeatures): NormalizedFeatures {
    const scroll = this.normalizeScroll(raw.scroll);
    const mouse = this.normalizeMouse(raw.mouse, raw.context.sessionDuration);
    const engagement = this.normalizeEngagement(raw.engagement);
    const context = this.normalizeContext(raw.context);

    return {
      scroll,
      mouse,
      engagement,
      context,
      timestamp: raw.timestamp,
    };
  }

  /**
   * Helper to clamp value in [0, 1] range.
   */
  private static clamp(value: number): number {
    return Math.max(0, Math.min(1, value));
  }

  /**
   * Normalize scroll behavioral features to [0, 1].
   */
  private static normalizeScroll(s: BehavioralFeatures['scroll']) {
    // Average section dwell time calculation
    const dwellValues = Object.values(s.sectionDwellTimes);
    const avgDwell = dwellValues.length > 0
      ? dwellValues.reduce((a, b) => a + b, 0) / dwellValues.length
      : 0;

    return {
      depth: this.clamp(s.depth),
      // Typical scroll speeds range up to 3000 px/s
      speed: this.clamp(s.speed / 3000),
      // Direction changes capped at 20 (high scan behavior indication)
      directionChanges: this.clamp(s.directionChanges / 20),
      // Average section dwell capped at 15 seconds
      sectionDwellAvg: this.clamp(avgDwell / 15000),
      // Total scroll distance capped at 10,000 px
      totalDistance: this.clamp(s.totalScrollDistance / 10000),
      // Capped at 6 sections
      sectionsVisited: this.clamp(s.sectionsVisited / 6),
      upScrollRatio: this.clamp(s.upScrollRatio),
      // Capped at 1500 px/s
      averageSpeed: this.clamp(s.averageSpeed / 1500),
    };
  }

  /**
   * Normalize mouse features to [0, 1].
   */
  private static normalizeMouse(m: BehavioralFeatures['mouse'], sessionDuration: number) {
    // Cursor idle ratio is relative to session duration
    const duration = Math.max(sessionDuration, 1000);
    const idleRatio = this.clamp(m.cursorIdleTime / duration);

    return {
      // Typical max velocity ~4000 px/s
      velocity: this.clamp(m.velocity / 4000),
      // Typical max acceleration ~20000 px/s^2
      acceleration: this.clamp(m.acceleration / 20000),
      // Hovers capped at 30
      hoverCount: this.clamp(m.hoverCount / 30),
      // Average hover duration capped at 5 seconds
      avgHoverDuration: this.clamp(m.avgHoverDuration / 5000),
      // Clicks capped at 10 in window
      clickCount: this.clamp(m.clickCount / 10),
      // Click hesitation capped at 4 seconds
      clickHesitation: this.clamp(m.clickHesitationMs / 4000),
      cursorIdleRatio: idleRatio,
      // Total mouse distance capped at 15,000 px
      totalDistance: this.clamp(m.totalDistance / 15000),
    };
  }

  /**
   * Normalize engagement features to [0, 1].
   */
  private static normalizeEngagement(e: BehavioralFeatures['engagement']) {
    return {
      // CTA clicks capped at 5
      ctaClicks: this.clamp(e.ctaClicks / 5),
      // Product views capped at 8
      productViews: this.clamp(e.productViews / 8),
      // Product hovers capped at 15
      productHovers: this.clamp(e.productHovers / 15),
      // Review reads capped at 6
      reviewReads: this.clamp(e.reviewReads / 6),
      // Comparison uses capped at 5
      comparisonUses: this.clamp(e.comparisonUses / 5),
      // Add-to-cart capped at 3
      addToCartCount: this.clamp(e.addToCartCount / 3),
      // Search and Filter uses combined, capped at 8
      searchAndFilter: this.clamp((e.searchCount + e.filterUses) / 8),
      // Price hover/click interactions capped at 8
      priceInteractions: this.clamp(e.priceInteractions / 8),
    };
  }

  /**
   * Encode and normalize context features to [0, 1].
   */
  private static normalizeContext(c: BehavioralFeatures['context']) {
    // Device: desktop=1.0, tablet=0.5, mobile=0.1
    let deviceVal = 1.0;
    if (c.deviceType === 'tablet') deviceVal = 0.5;
    else if (c.deviceType === 'mobile') deviceVal = 0.1;

    // Browser: Chrome/Edge=1.0, Firefox=0.7, Safari=0.5, other=0.2
    let browserVal = 0.2;
    const ua = c.browser.toLowerCase();
    if (ua.includes('chrome') || ua.includes('chrome')) browserVal = 1.0;
    else if (ua.includes('firefox')) browserVal = 0.7;
    else if (ua.includes('safari')) browserVal = 0.5;

    // Referrer: direct=1.0, search=0.7, social=0.4, other=0.1
    let referrerVal = 0.1;
    if (c.isDirect) referrerVal = 1.0;
    else if (c.isSearchReferral) referrerVal = 0.7;
    else if (c.referrer && (c.referrer.includes('facebook') || c.referrer.includes('twitter') || c.referrer.includes('t.co') || c.referrer.includes('linkedin'))) {
      referrerVal = 0.4;
    }

    // Viewport Area relative to full HD
    const area = c.viewport.width * c.viewport.height;
    const viewportVal = this.clamp(area / (1920 * 1080));

    // Time of day: morning=0.25, afternoon=0.5, evening=0.75, night=1.0
    let timeVal = 0.5;
    if (c.timeOfDay === 'morning') timeVal = 0.25;
    else if (c.timeOfDay === 'afternoon') timeVal = 0.5;
    else if (c.timeOfDay === 'evening') timeVal = 0.75;
    else if (c.timeOfDay === 'night') timeVal = 1.0;

    // Day of week: Weekend vs weekday (weekend = 1.0, weekday = 0.5)
    const weekendDays = ['Sat', 'Sun'];
    const dayVal = weekendDays.includes(c.dayOfWeek) ? 1.0 : 0.5;

    // Session duration capped at 3 minutes (180000ms)
    const sessionVal = this.clamp(c.sessionDuration / 180000);

    // Page count capped at 10
    const pageVal = this.clamp(c.pageCount / 10);

    return {
      deviceType: deviceVal,
      browserFamily: browserVal,
      referrerType: referrerVal,
      viewportArea: viewportVal,
      timeOfDay: timeVal,
      dayOfWeek: dayVal,
      sessionDuration: sessionVal,
      pageCount: pageVal,
    };
  }
}
