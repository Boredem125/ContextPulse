import type { NormalizedFeatures, IntentScore } from '@/sdk/types';
import { INTENT_ARCHETYPES } from '@/sdk/types';

/**
 * IntentVector generates a structured 64-dimensional float vector representing
 * the complete behavioral fingerprint of the user session.
 *
 * Vector Space Layout:
 * - Dims 0-7: Intent archetype scores (Explorer, Comparator, Deal Seeker, Researcher, Impulse Buyer, Gift Shopper, Returning Buyer, Passive Browser)
 * - Dims 8-15: Scroll features (depth, speed, directionChanges, sectionDwellAvg, totalDistance, sectionsVisited, upScrollRatio, averageSpeed)
 * - Dims 16-23: Mouse features (velocity, acceleration, hoverCount, avgHoverDuration, clickCount, clickHesitation, cursorIdleRatio, totalDistance)
 * - Dims 24-31: Engagement features (ctaClicks, productViews, productHovers, reviewReads, comparisonUses, addToCartCount, searchAndFilter, priceInteractions)
 * - Dims 32-39: Context features (deviceType, browserFamily, referrerType, viewportArea, timeOfDay, dayOfWeek, sessionDuration, pageCount)
 * - Dims 40-47: Temporal features (rates of behavioral changes)
 * - Dims 48-55: Cross-feature correlations (behavioral intersections)
 * - Dims 56-63: Confidence and meta features (inference metrics)
 */
export class IntentVector {
  /**
   * Generates the 64-dimensional vector.
   */
  public static generate(
    features: NormalizedFeatures,
    scores: IntentScore[],
    confidence: number,
    prevFeatures?: NormalizedFeatures
  ): number[] {
    const vector = new Array<number>(64).fill(0);

    // ── Group 0: Intent Archetype Scores (0-7) ──────────────────────────────
    // Map scores according to the stable INTENT_ARCHETYPES ordering
    const scoreMap = new Map(scores.map((s) => [s.archetype, s.score]));
    INTENT_ARCHETYPES.forEach((arch, idx) => {
      vector[idx] = this.clamp(scoreMap.get(arch) ?? 0);
    });

    // ── Group 1: Scroll Features (8-15) ──────────────────────────────────────
    const s = features.scroll;
    vector[8] = this.clamp(s.depth);
    vector[9] = this.clamp(s.speed);
    vector[10] = this.clamp(s.directionChanges);
    vector[11] = this.clamp(s.sectionDwellAvg);
    vector[12] = this.clamp(s.totalDistance);
    vector[13] = this.clamp(s.sectionsVisited);
    vector[14] = this.clamp(s.upScrollRatio);
    vector[15] = this.clamp(s.averageSpeed);

    // ── Group 2: Mouse Features (16-23) ──────────────────────────────────────
    const m = features.mouse;
    vector[16] = this.clamp(m.velocity);
    vector[17] = this.clamp(m.acceleration);
    vector[18] = this.clamp(m.hoverCount);
    vector[19] = this.clamp(m.avgHoverDuration);
    vector[20] = this.clamp(m.clickCount);
    vector[21] = this.clamp(m.clickHesitation);
    vector[22] = this.clamp(m.cursorIdleRatio);
    vector[23] = this.clamp(m.totalDistance);

    // ── Group 3: Engagement Features (24-31) ──────────────────────────────────
    const e = features.engagement;
    vector[24] = this.clamp(e.ctaClicks);
    vector[25] = this.clamp(e.productViews);
    vector[26] = this.clamp(e.productHovers);
    vector[27] = this.clamp(e.reviewReads);
    vector[28] = this.clamp(e.comparisonUses);
    vector[29] = this.clamp(e.addToCartCount);
    vector[30] = this.clamp(e.searchAndFilter);
    vector[31] = this.clamp(e.priceInteractions);

    // ── Group 4: Context Features (32-39) ────────────────────────────────────
    const c = features.context;
    vector[32] = this.clamp(c.deviceType);
    vector[33] = this.clamp(c.browserFamily);
    vector[34] = this.clamp(c.referrerType);
    vector[35] = this.clamp(c.viewportArea);
    vector[36] = this.clamp(c.timeOfDay);
    vector[37] = this.clamp(c.dayOfWeek);
    vector[38] = this.clamp(c.sessionDuration);
    vector[39] = this.clamp(c.pageCount);

    // ── Group 5: Temporal Features (40-47) ───────────────────────────────────
    // Captures the delta in activity levels compared to the previous cycle.
    if (prevFeatures) {
      vector[40] = this.clamp((s.depth - prevFeatures.scroll.depth) * 5 + 0.5);
      vector[41] = this.clamp((s.speed - prevFeatures.scroll.speed) * 2 + 0.5);
      vector[42] = this.clamp((m.velocity - prevFeatures.mouse.velocity) * 2 + 0.5);
      vector[43] = this.clamp((m.hoverCount - prevFeatures.mouse.hoverCount) * 5 + 0.5);
      vector[44] = this.clamp((e.ctaClicks - prevFeatures.engagement.ctaClicks) * 5 + 0.5);
      vector[45] = this.clamp((e.productHovers - prevFeatures.engagement.productHovers) * 3 + 0.5);
      vector[46] = this.clamp((c.sessionDuration - prevFeatures.context.sessionDuration) * 10);
      vector[47] = this.clamp((m.cursorIdleRatio - prevFeatures.mouse.cursorIdleRatio) * 2 + 0.5);
    } else {
      // Base values when no historical snapshot is available
      vector[40] = 0.5;
      vector[41] = 0.5;
      vector[42] = 0.5;
      vector[43] = 0.5;
      vector[44] = 0.5;
      vector[45] = 0.5;
      vector[46] = 0.1;
      vector[47] = 0.5;
    }

    // ── Group 6: Cross-Feature Correlations (48-55) ───────────────────────────
    // Highlights synergistic interactions between scroll, mouse, and engagement.
    vector[48] = this.clamp(s.depth * e.productViews);
    vector[49] = this.clamp(s.speed * m.velocity);
    vector[50] = this.clamp(s.directionChanges * m.hoverCount);
    vector[51] = this.clamp(e.comparisonUses * m.avgHoverDuration);
    vector[52] = this.clamp(e.ctaClicks * (1 - m.clickHesitation));
    vector[53] = this.clamp(e.addToCartCount * e.priceInteractions);
    vector[54] = this.clamp(c.sessionDuration * s.sectionsVisited);
    vector[55] = this.clamp(m.cursorIdleRatio * (1 - s.depth));

    // ── Group 7: Meta & Confidence Features (56-63) ──────────────────────────
    vector[56] = this.clamp(confidence);
    vector[57] = this.clamp(1 - confidence);
    // Normalized current hour
    const date = new Date();
    vector[58] = this.clamp(date.getHours() / 24);
    vector[59] = this.clamp((s.sectionsVisited + m.hoverCount) / 2);
    // Redundancy / parity checks
    vector[60] = this.clamp(vector.slice(0, 8).reduce((sum, v) => sum + v, 0) / 8);
    vector[61] = this.clamp(vector.slice(8, 16).reduce((sum, v) => sum + v, 0) / 8);
    vector[62] = this.clamp(vector.slice(16, 24).reduce((sum, v) => sum + v, 0) / 8);
    vector[63] = this.clamp(vector.slice(24, 32).reduce((sum, v) => sum + v, 0) / 8);

    return vector;
  }

  /**
   * Helper to clamp value to [0, 1] range.
   */
  private static clamp(value: number): number {
    return Math.max(0, Math.min(1, Number.isNaN(value) ? 0 : value));
  }
}
