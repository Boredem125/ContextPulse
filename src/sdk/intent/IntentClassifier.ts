import type { NormalizedFeatures, IntentArchetype, IntentScore } from '@/sdk/types';
import { INTENT_ARCHETYPES } from '@/sdk/types';

/**
 * IntentClassifier evaluates normalized behavioral features against heuristic rules
 * for the 8 core intent archetypes. It outputs normalized scores and confidence estimates.
 */
export class IntentClassifier {
  /**
   * Classifies user intent based on current normalized features.
   * Can optionally smooth results using the previous cycle's scores.
   *
   * @param features - The current normalized features.
   * @param prevScores - The scores from the previous classification cycle.
   * @param smoothingFactor - The smoothing coefficient (alpha) between 0 and 1.
   */
  public static classify(
    features: NormalizedFeatures,
    prevScores?: IntentScore[],
    smoothingFactor = 0.3
  ): { primaryIntent: IntentArchetype; confidence: number; scores: IntentScore[] } {
    const scroll = features.scroll;
    const mouse = features.mouse;
    const engagement = features.engagement;
    const context = features.context;

    // ── 1. Calculate Raw Heuristic Scores ────────────────────────────────────
    
    // Explorer: High scroll depth, high speed, scanning multiple sections
    const explorerRaw =
      0.3 * scroll.depth +
      0.25 * scroll.speed +
      0.25 * scroll.sectionsVisited +
      0.2 * scroll.totalDistance;

    // Comparator: High comparison page dwell, multiple product hovers, comparison tool usage
    const comparatorRaw =
      0.45 * engagement.comparisonUses +
      0.3 * engagement.productHovers +
      0.15 * mouse.hoverCount +
      0.1 * scroll.sectionDwellAvg;

    // Deal Seeker: Price-related interactions, search & filters, discount banner views
    const dealSeekerRaw =
      0.5 * engagement.priceInteractions +
      0.3 * engagement.searchAndFilter +
      0.2 * scroll.upScrollRatio;

    // Researcher: Review reads, detailed specs, long session, high hover duration
    const researcherRaw =
      0.4 * engagement.reviewReads +
      0.3 * mouse.avgHoverDuration +
      0.15 * context.sessionDuration +
      0.15 * context.pageCount;

    // Impulse Buyer: Fast CTA clicks, low click hesitation, add to carts, short session duration
    const clickHesitationInv = 1 - mouse.clickHesitation;
    const sessionDurationInv = 1 - context.sessionDuration;
    const impulseBuyerRaw =
      0.35 * engagement.ctaClicks +
      0.35 * engagement.addToCartCount +
      0.15 * clickHesitationInv +
      0.15 * sessionDurationInv;

    // Gift Shopper: Reviews read, moderate page views, product hovers, category views
    const giftShopperRaw =
      0.35 * engagement.reviewReads +
      0.25 * engagement.productHovers +
      0.2 * engagement.productViews +
      0.2 * context.pageCount;

    // Returning Buyer: Direct referrer, low click hesitation, fast page navigation
    const returningBuyerRaw =
      0.5 * context.referrerType +
      0.35 * clickHesitationInv +
      0.15 * context.pageCount;

    // Passive Browser: High cursor idle ratio, slow scroll, low engagement counters
    const engagementSum =
      engagement.ctaClicks +
      engagement.productViews +
      engagement.productHovers;
    const engagementInv = 1 - Math.min(engagementSum / 3, 1);
    const scrollSpeedInv = 1 - scroll.speed;
    const passiveBrowserRaw =
      0.45 * mouse.cursorIdleRatio +
      0.3 * scrollSpeedInv +
      0.25 * engagementInv;

    // ── 2. Softmax Normalization ─────────────────────────────────────────────
    const rawScoresMap: Record<IntentArchetype, number> = {
      Explorer: explorerRaw,
      Comparator: comparatorRaw,
      'Deal Seeker': dealSeekerRaw,
      Researcher: researcherRaw,
      'Impulse Buyer': impulseBuyerRaw,
      'Gift Shopper': giftShopperRaw,
      'Returning Buyer': returningBuyerRaw,
      'Passive Browser': passiveBrowserRaw,
    };

    const rawValues = INTENT_ARCHETYPES.map((arch) => rawScoresMap[arch]);
    
    // Softmax with temperature scale to enhance contrast between scores
    const tempScale = 4.5;
    const exps = rawValues.map((val) => Math.exp(val * tempScale));
    const expsSum = exps.reduce((a, b) => a + b, 0);
    const normalizedScores = exps.map((val) => val / (expsSum || 1));

    // ── 3. Apply Exponential Smoothing (Temporal Stability) ──────────────────
    let smoothedScores = INTENT_ARCHETYPES.map((arch, idx) => {
      const newScore = normalizedScores[idx];
      let confidence = 0.5;

      // Estimate confidence based on signal strength
      if (arch === 'Passive Browser') {
        confidence = 0.4 + 0.3 * mouse.cursorIdleRatio;
      } else {
        const activeSignals =
          scroll.depth * 0.2 +
          mouse.hoverCount * 0.3 +
          (engagement.ctaClicks + engagement.addToCartCount) * 0.5;
        confidence = 0.3 + 0.6 * Math.min(activeSignals, 1);
      }

      return {
        archetype: arch,
        score: newScore,
        confidence: Math.round(confidence * 100) / 100,
      };
    });

    if (prevScores && prevScores.length === INTENT_ARCHETYPES.length) {
      const prevMap = new Map(prevScores.map((s) => [s.archetype, s]));
      smoothedScores = smoothedScores.map((s) => {
        const prev = prevMap.get(s.archetype);
        if (prev) {
          const smoothedScore =
            smoothingFactor * s.score + (1 - smoothingFactor) * prev.score;
          const smoothedConf =
            smoothingFactor * s.confidence + (1 - smoothingFactor) * prev.confidence;
          return {
            archetype: s.archetype,
            score: smoothedScore,
            confidence: Math.round(smoothedConf * 100) / 100,
          };
        }
        return s;
      });

      // Re-normalize smoothed scores to ensure they sum to exactly 1.0
      const sum = smoothedScores.reduce((acc, s) => acc + s.score, 0);
      smoothedScores = smoothedScores.map((s) => ({
        ...s,
        score: sum > 0 ? s.score / sum : s.score,
      }));
    }

    // Sort scores in descending order of strength
    const sortedScores = [...smoothedScores].sort((a, b) => b.score - a.score);

    // Primary intent is the one with the highest score
    const primary = sortedScores[0].archetype;

    // Confidence: margins between top two scores combined with target confidence
    const margin = sortedScores.length > 1 ? sortedScores[0].score - sortedScores[1].score : sortedScores[0].score;
    const finalConfidence = Math.min(
      Math.max(sortedScores[0].confidence * 0.7 + margin * 0.3, 0.1),
      0.99
    );

    return {
      primaryIntent: primary,
      confidence: Math.round(finalConfidence * 100) / 100,
      scores: sortedScores,
    };
  }
}
