/**
 * @module EngagementCollector
 * @description Captures high-level user engagement signals from semantic page interactions.
 *
 * Unlike low-level input collectors (scroll, mouse), this module tracks
 * **meaningful user actions** that indicate purchase intent or content interest:
 *
 * - CTA clicks (`data-track="cta"`)
 * - Product views/hovers (`data-track="product"`)
 * - Review reads (`data-track="review"`)
 * - Comparison usage (`data-track="compare"`)
 * - Add-to-cart actions (`data-track="cart"`)
 * - Search queries (`data-track="search"`)
 * - Filter/facet interactions (`data-track="filter"`)
 * - Price element interactions (`data-track="price"`, `data-track="discount"`)
 *
 * @remarks
 * Uses **event delegation** on the document body for click handling, avoiding
 * per-element listener binding. A **MutationObserver** watches for dynamically
 * inserted tracked elements to support SPA and lazy-loaded content.
 *
 * Category breadth tracking uses a Set to count unique `data-category` values
 * across product interactions, enabling Gift Shopper archetype detection.
 *
 * @packageDocumentation
 */

import type { EngagementFeatures, BehavioralEvent, Collector } from '@/sdk/types';

/**
 * Mapping of `data-track` attribute values to their behavioral event type.
 */
const TRACK_TYPE_MAP: Record<string, BehavioralEvent['type']> = {
  cta: 'cta',
  product: 'view',
  review: 'review',
  compare: 'compare',
  cart: 'cart',
  search: 'search',
  filter: 'filter',
  price: 'click',
  discount: 'click',
} as const;

/**
 * Maximum depth to walk up the DOM when searching for a trackable ancestor.
 */
const MAX_ANCESTOR_DEPTH = 10;

/**
 * Collector for semantic engagement signals using event delegation.
 *
 * @example
 * ```html
 * <!-- Markup convention for tracked elements -->
 * <button data-track="cta" data-label="Buy Now">Buy Now</button>
 * <div data-track="product" data-category="electronics">Product Card</div>
 * <section data-track="review">Customer Reviews</section>
 * <button data-track="compare">Compare</button>
 * <button data-track="cart">Add to Cart</button>
 * ```
 *
 * @example
 * ```ts
 * const collector = new EngagementCollector((event) => {
 *   console.log(`${event.type} on ${event.target}`);
 * });
 * collector.start();
 * ```
 */
export class EngagementCollector implements Collector<EngagementFeatures> {
  // ── Counters ────────────────────────────────────────────────────────────

  private ctaClicks = 0;
  private productViews = 0;
  private productHovers = 0;
  private reviewReads = 0;
  private comparisonUses = 0;
  private addToCartCount = 0;
  private searchCount = 0;
  private filterUses = 0;
  private priceInteractions = 0;

  /** Unique product categories encountered (for category breadth). */
  private categoriesViewed = new Set<string>();

  /** Products whose review sections have been observed (dedup). */
  private observedReviewSections = new Set<Element>();

  // ── DOM References ──────────────────────────────────────────────────────

  private mutationObserver: MutationObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;
  private isRunning = false;

  // ── Bound Handlers ──────────────────────────────────────────────────────

  private readonly handleClick: (e: MouseEvent) => void;
  private readonly handleMouseOver: (e: MouseEvent) => void;
  private readonly onEvent: (event: BehavioralEvent) => void;

  /**
   * @param onEvent - Callback invoked for each emitted engagement event.
   */
  constructor(onEvent: (event: BehavioralEvent) => void) {
    this.onEvent = onEvent;
    this.handleClick = this.onClick.bind(this);
    this.handleMouseOver = this.onMouseOver.bind(this);
  }

  // ── Collector Interface ─────────────────────────────────────────────────

  /** Begin tracking engagement interactions. Idempotent. */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    // Event delegation on document for clicks
    document.addEventListener('click', this.handleClick, { passive: true, capture: true });
    document.addEventListener('mouseover', this.handleMouseOver, { passive: true });

    // Observe review sections coming into view
    this.initReviewObserver();

    // Watch for dynamically inserted tracked elements
    this.initMutationObserver();
  }

  /** Stop tracking and release all listeners and observers. */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    document.removeEventListener('click', this.handleClick, { capture: true });
    document.removeEventListener('mouseover', this.handleMouseOver);

    this.mutationObserver?.disconnect();
    this.mutationObserver = null;

    this.intersectionObserver?.disconnect();
    this.intersectionObserver = null;
  }

  /** Return the current engagement feature snapshot. */
  public getFeatures(): EngagementFeatures {
    return {
      ctaClicks: this.ctaClicks,
      productViews: this.productViews,
      productHovers: this.productHovers,
      reviewReads: this.reviewReads,
      comparisonUses: this.comparisonUses,
      addToCartCount: this.addToCartCount,
      searchCount: this.searchCount,
      filterUses: this.filterUses,
      categoryViews: this.categoriesViewed.size,
      priceInteractions: this.priceInteractions,
    };
  }

  /** Reset all accumulated state. */
  public reset(): void {
    this.ctaClicks = 0;
    this.productViews = 0;
    this.productHovers = 0;
    this.reviewReads = 0;
    this.comparisonUses = 0;
    this.addToCartCount = 0;
    this.searchCount = 0;
    this.filterUses = 0;
    this.priceInteractions = 0;
    this.categoriesViewed.clear();
    this.observedReviewSections.clear();
  }

  // ── Click Delegation ────────────────────────────────────────────────────

  /**
   * Delegated click handler — walks up from the event target to find
   * the nearest `data-track` ancestor and dispatches to the appropriate counter.
   */
  private onClick(e: MouseEvent): void {
    const trackedEl = this.findTrackedAncestor(e.target as Element);
    if (!trackedEl) return;

    const trackType = trackedEl.getAttribute('data-track');
    if (!trackType) return;

    const label = trackedEl.getAttribute('data-label') || undefined;
    const category = trackedEl.getAttribute('data-category') || undefined;

    switch (trackType) {
      case 'cta':
        this.ctaClicks++;
        this.emitEvent('cta', trackType, { label });
        break;

      case 'product':
        this.productViews++;
        if (category) this.categoriesViewed.add(category);
        this.emitEvent('view', trackType, { label, category });
        break;

      case 'review':
        this.reviewReads++;
        this.emitEvent('review', trackType, { label });
        break;

      case 'compare':
        this.comparisonUses++;
        this.emitEvent('compare', trackType, { label });
        break;

      case 'cart':
        this.addToCartCount++;
        this.emitEvent('cart', trackType, { label, category });
        break;

      case 'search':
        this.searchCount++;
        this.emitEvent('click', trackType, { label });
        break;

      case 'filter':
        this.filterUses++;
        this.emitEvent('click', trackType, { label });
        break;

      case 'price':
      case 'discount':
        this.priceInteractions++;
        this.emitEvent('click', trackType, { label });
        break;

      default:
        // Unknown track type — emit as generic click
        this.emitEvent('click', trackType, { label });
    }
  }

  /**
   * Hover handler for product elements — tracks product browsing behavior
   * independently of click events.
   */
  private onMouseOver(e: MouseEvent): void {
    const target = this.findTrackedAncestor(e.target as Element);
    if (!target) return;

    const trackType = target.getAttribute('data-track');
    if (trackType === 'product') {
      this.productHovers++;
      const category = target.getAttribute('data-category');
      if (category) this.categoriesViewed.add(category);
    }
  }

  // ── Review Section Visibility ───────────────────────────────────────────

  /**
   * Uses IntersectionObserver to detect when review sections scroll into
   * the viewport, counting them as "read" engagements.
   */
  private initReviewObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            if (!this.observedReviewSections.has(entry.target)) {
              this.observedReviewSections.add(entry.target);
              this.reviewReads++;
              this.emitEvent('review', 'review', {
                action: 'view',
                sectionId: entry.target.id || undefined,
              });
            }
          }
        }
      },
      { threshold: [0.5] },
    );

    // Observe existing review sections
    this.observeReviewSections();
  }

  /**
   * Queries the DOM for review-trackable sections and observes them.
   */
  private observeReviewSections(): void {
    if (!this.intersectionObserver) return;

    const reviewSections = document.querySelectorAll(
      '[data-track="review"], [data-track-section="reviews"], .reviews-section',
    );

    reviewSections.forEach((el) => {
      if (!this.observedReviewSections.has(el)) {
        this.intersectionObserver!.observe(el);
      }
    });
  }

  // ── Mutation Observation ────────────────────────────────────────────────

  /**
   * Watches for dynamically inserted DOM nodes with `data-track` attributes.
   * This is critical for SPAs where product cards, reviews, and CTAs are
   * rendered asynchronously.
   */
  private initMutationObserver(): void {
    if (typeof MutationObserver === 'undefined') return;

    this.mutationObserver = new MutationObserver((mutations) => {
      let hasNewReviewSections = false;

      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType !== Node.ELEMENT_NODE) continue;
          const el = node as Element;

          // Check if the added element itself is trackable
          if (el.hasAttribute?.('data-track')) {
            const trackType = el.getAttribute('data-track');
            if (trackType === 'review') hasNewReviewSections = true;
          }

          // Check children of the added subtree
          const tracked = el.querySelectorAll?.('[data-track]');
          tracked?.forEach((child) => {
            if (child.getAttribute('data-track') === 'review') {
              hasNewReviewSections = true;
            }
          });
        }
      }

      // Re-observe review sections if new ones appeared
      if (hasNewReviewSections) {
        this.observeReviewSections();
      }
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  // ── Utilities ───────────────────────────────────────────────────────────

  /**
   * Walks up the DOM tree from the event target to find the nearest
   * ancestor with a `data-track` attribute.
   */
  private findTrackedAncestor(el: Element | null): Element | null {
    let current = el;
    let depth = 0;

    while (current && depth < MAX_ANCESTOR_DEPTH) {
      if (current.hasAttribute?.('data-track')) return current;
      current = current.parentElement;
      depth++;
    }
    return null;
  }

  /**
   * Emits a structured behavioral event.
   */
  private emitEvent(
    type: BehavioralEvent['type'],
    target: string,
    metadata?: Record<string, unknown>,
  ): void {
    this.onEvent({
      id: `eng_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type,
      target,
      metadata,
      timestamp: Date.now(),
    });
  }
}
