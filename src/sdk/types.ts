/**
 * @module types
 * @description Core type definitions for the ContextPulse behavioral intent inference engine.
 *
 * This module defines the complete type surface for the SDK including:
 * - Raw behavioral signal shapes from each collector
 * - Normalized feature structures for classification
 * - Intent archetype taxonomy and scoring interfaces
 * - SDK configuration and lifecycle types
 * - Event bus message contracts
 *
 * @remarks
 * All numeric feature values are designed to be normalizable to [0, 1] for
 * vector embedding. String enumerations use union types rather than enums
 * for tree-shaking compatibility.
 *
 * @packageDocumentation
 */

// ─────────────────────────────────────────────────────────────────────────────
// Intent Taxonomy
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The eight behavioral intent archetypes recognized by the classifier.
 *
 * Each archetype represents a distinct user intent pattern derived from
 * real-time behavioral signals. The taxonomy is grounded in e-commerce
 * UX research and validated against common purchasing journey models.
 *
 * | Archetype        | Primary Signal                                    |
 * |------------------|---------------------------------------------------|
 * | Explorer         | Broad browsing, high scroll depth, many sections  |
 * | Comparator       | Side-by-side evaluation, spec/feature focus       |
 * | Deal Seeker      | Pricing focus, discount sensitivity               |
 * | Researcher       | Deep content consumption, reviews, long sessions  |
 * | Impulse Buyer    | Fast CTA engagement, low hesitation               |
 * | Gift Shopper     | Cross-category browsing, review-heavy             |
 * | Returning Buyer  | Direct navigation, familiar patterns              |
 * | Passive Browser  | Low engagement, high idle time                     |
 */
export type IntentArchetype =
  | 'Explorer'
  | 'Comparator'
  | 'Deal Seeker'
  | 'Researcher'
  | 'Impulse Buyer'
  | 'Gift Shopper'
  | 'Returning Buyer'
  | 'Passive Browser';

/** Ordered list of all archetypes for consistent indexing in vectors. */
export const INTENT_ARCHETYPES: readonly IntentArchetype[] = [
  'Explorer',
  'Comparator',
  'Deal Seeker',
  'Researcher',
  'Impulse Buyer',
  'Gift Shopper',
  'Returning Buyer',
  'Passive Browser',
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// Behavioral Event Types
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Enumeration of trackable event types emitted by collectors.
 *
 * These are low-level behavioral signals that feed into feature extraction.
 * Each event type maps to one or more collector modules.
 */
export type BehavioralEventType =
  | 'scroll'
  | 'hover'
  | 'click'
  | 'view'
  | 'compare'
  | 'cta'
  | 'review'
  | 'cart'
  | 'search'
  | 'filter'
  | 'context';

/**
 * A single behavioral event captured by a collector.
 *
 * Events are immutable, timestamped records that form the raw input
 * stream for the feature extraction pipeline.
 *
 * @example
 * ```ts
 * const event: BehavioralEvent = {
 *   id: 'evt_abc123',
 *   type: 'click',
 *   target: '[data-track="cta"]',
 *   value: 1,
 *   metadata: { label: 'Buy Now', hesitationMs: 340 },
 *   timestamp: Date.now(),
 * };
 * ```
 */
export interface BehavioralEvent {
  /** Unique event identifier (UUID v4 or monotonic counter). */
  readonly id: string;

  /** The behavioral signal category. */
  readonly type: BehavioralEventType;

  /** CSS selector or data-track identifier of the interacted element. */
  readonly target?: string;

  /** Numeric magnitude associated with the event (e.g., scroll delta in px). */
  readonly value?: number;

  /** Arbitrary key-value metadata specific to the event type. */
  readonly metadata?: Record<string, unknown>;

  /** Unix epoch millisecond timestamp of event capture. */
  readonly timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collector Feature Shapes
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Scroll behavior features extracted from the ScrollCollector.
 *
 * All spatial values reference the document's scroll height as the
 * frame of reference. Speed and distance metrics use CSS pixels.
 */
export interface ScrollFeatures {
  /** Deepest scroll position reached as a ratio of total scrollable height [0, 1]. */
  depth: number;

  /** Instantaneous scroll speed in px/s, capped and normalized. */
  speed: number;

  /**
   * Number of direction reversals (up↔down) within the observation window.
   * High reversal counts indicate scanning behavior.
   */
  directionChanges: number;

  /**
   * Cumulative dwell time (ms) per observed section.
   * Keys are `data-section` attribute values or auto-generated section IDs.
   */
  sectionDwellTimes: Record<string, number>;

  /** Total absolute scroll distance in CSS pixels across all directions. */
  totalScrollDistance: number;

  /** Number of distinct page sections the user has scrolled through. */
  sectionsVisited: number;

  /** Ratio of time spent scrolling up vs. total scroll time [0, 1]. */
  upScrollRatio: number;

  /** Average scroll speed over the observation window (px/s). */
  averageSpeed: number;
}

/**
 * Mouse behavior features extracted from the MouseCollector.
 *
 * Velocity and acceleration are computed from position deltas between
 * successive mousemove events with sub-frame timestamp precision.
 */
export interface MouseFeatures {
  /** Instantaneous cursor velocity magnitude in px/s. */
  velocity: number;

  /** Rate of velocity change in px/s². */
  acceleration: number;

  /** Total number of discrete hover events (entering a tracked element). */
  hoverCount: number;

  /** Mean hover duration across all tracked elements (ms). */
  avgHoverDuration: number;

  /** Total click count in the observation window. */
  clickCount: number;

  /**
   * Mean time between hover-start and click on the same element (ms).
   * Lower values indicate decisiveness; higher values indicate hesitation.
   */
  clickHesitationMs: number;

  /** Cumulative time the cursor has been stationary (ms). */
  cursorIdleTime: number;

  /**
   * Ordered list of `data-track` values for elements the cursor hovered over.
   * Used for interaction sequence analysis.
   */
  hoverTargets: string[];

  /** Total distance traveled by the cursor in CSS pixels. */
  totalDistance: number;
}

/**
 * Engagement features tracking meaningful user interactions.
 *
 * These signals go beyond raw input events to capture semantic
 * interactions that indicate purchase intent or content interest.
 */
export interface EngagementFeatures {
  /** Number of call-to-action button clicks. */
  ctaClicks: number;

  /** Number of product detail views (page loads or modal opens). */
  productViews: number;

  /** Number of product card hover events (browsing behavior). */
  productHovers: number;

  /** Number of review sections scrolled into view or expanded. */
  reviewReads: number;

  /** Number of comparison tool invocations or compare-list additions. */
  comparisonUses: number;

  /** Number of add-to-cart actions. */
  addToCartCount: number;

  /** Number of search queries submitted. */
  searchCount: number;

  /** Number of filter/facet interactions (applied, removed, modified). */
  filterUses: number;

  /** Number of unique product categories browsed. */
  categoryViews: number;

  /** Number of price-related element interactions (price hover, discount click). */
  priceInteractions: number;
}

/**
 * Contextual features describing the user's environment and session.
 *
 * These features are largely static per session but can shift
 * (e.g., viewport resize, time progression).
 */
export interface ContextFeatures {
  /** Device form factor classification based on viewport width + UA heuristics. */
  deviceType: 'desktop' | 'tablet' | 'mobile';

  /** Browser engine family (e.g., 'Chrome', 'Firefox', 'Safari'). */
  browser: string;

  /** The document referrer URL (empty string if direct navigation). */
  referrer: string;

  /** Current viewport dimensions in CSS pixels. */
  viewport: { width: number; height: number };

  /** Time-of-day bucket based on the user's local hour. */
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';

  /** Abbreviated day of the week (e.g., 'Mon', 'Tue'). */
  dayOfWeek: string;

  /** Time elapsed since SDK initialization (ms). */
  sessionDuration: number;

  /** Number of page views tracked in this session. */
  pageCount: number;

  /** Whether the referrer indicates a direct/bookmarked visit. */
  isDirect: boolean;

  /** Whether the referrer is from a search engine. */
  isSearchReferral: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Composite Feature Structures
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Aggregated behavioral features from all collectors at a point in time.
 *
 * This is the primary input to the FeatureExtractor and represents a
 * complete snapshot of all behavioral dimensions being tracked.
 */
export interface BehavioralFeatures {
  scroll: ScrollFeatures;
  mouse: MouseFeatures;
  engagement: EngagementFeatures;
  context: ContextFeatures;

  /** Capture timestamp (Unix epoch ms). */
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Classification Output
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Score for a single intent archetype.
 *
 * Scores are not probabilities — they represent weighted evidence
 * accumulation and can exceed 1.0 before normalization.
 */
export interface IntentScore {
  /** The archetype this score pertains to. */
  archetype: IntentArchetype;

  /**
   * Raw weighted score [0, 1] after softmax normalization.
   * Scores across all archetypes sum to 1.0.
   */
  score: number;

  /**
   * Classifier confidence in this particular score [0, 1].
   * Based on signal density, temporal consistency, and feature variance.
   */
  confidence: number;
}

/**
 * Complete intent classification result for a single inference cycle.
 *
 * Returned by `ContextPulseSDK.getState()` and emitted via the
 * `onIntentUpdate` callback on every classification tick.
 */
export interface IntentResult {
  /** The highest-scoring archetype. */
  primaryIntent: IntentArchetype;

  /**
   * Overall classifier confidence [0, 1].
   * Derived from the margin between the top two scores and
   * the temporal stability of the classification.
   */
  confidence: number;

  /** Scores for all eight archetypes, sorted by descending score. */
  scores: IntentScore[];

  /**
   * 64-dimensional normalized intent vector.
   * All values clamped to [0, 1]. See `IntentVector` module for
   * dimension semantics.
   */
  vector: number[];

  /** Timestamp of this classification cycle (Unix epoch ms). */
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Normalized Feature Vector
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fully normalized feature set produced by the FeatureExtractor.
 *
 * All values are in [0, 1] after min-max normalization with
 * domain-appropriate bounds. This structure is the direct input
 * to the IntentClassifier.
 */
export interface NormalizedFeatures {
  /** Normalized scroll features (8 dimensions). */
  scroll: {
    depth: number;
    speed: number;
    directionChanges: number;
    sectionDwellAvg: number;
    totalDistance: number;
    sectionsVisited: number;
    upScrollRatio: number;
    averageSpeed: number;
  };

  /** Normalized mouse features (8 dimensions). */
  mouse: {
    velocity: number;
    acceleration: number;
    hoverCount: number;
    avgHoverDuration: number;
    clickCount: number;
    clickHesitation: number;
    cursorIdleRatio: number;
    totalDistance: number;
  };

  /** Normalized engagement features (8 dimensions). */
  engagement: {
    ctaClicks: number;
    productViews: number;
    productHovers: number;
    reviewReads: number;
    comparisonUses: number;
    addToCartCount: number;
    searchAndFilter: number;
    priceInteractions: number;
  };

  /** Encoded context features (8 dimensions). */
  context: {
    deviceType: number;
    browserFamily: number;
    referrerType: number;
    viewportArea: number;
    timeOfDay: number;
    dayOfWeek: number;
    sessionDuration: number;
    pageCount: number;
  };

  /** Feature capture timestamp. */
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Temporal Windowing
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Supported temporal window sizes for feature aggregation.
 * Values represent seconds.
 */
export type TemporalWindow = 5 | 15 | 30;

/**
 * A timestamped snapshot used for temporal windowing and decay.
 */
export interface TemporalSnapshot<T> {
  /** The data payload. */
  data: T;

  /** Capture timestamp (Unix epoch ms). */
  timestamp: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SDK Configuration
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Configuration options for the ContextPulse SDK.
 *
 * @example
 * ```ts
 * ContextPulseSDK.init({
 *   siteId: 'my-store-prod',
 *   collectionInterval: 500,
 *   debug: false,
 *   onIntentUpdate: (result) => analytics.track('intent', result),
 * });
 * ```
 */
export interface SDKConfig {
  /**
   * Unique site identifier for multi-tenant isolation.
   * Used as a namespace prefix for storage keys and event tagging.
   */
  siteId: string;

  /**
   * Interval in milliseconds between feature extraction and classification cycles.
   * Lower values increase CPU usage; higher values reduce classification responsiveness.
   * @default 500
   */
  collectionInterval?: number;

  /**
   * Enable verbose console logging for development.
   * @default false
   */
  debug?: boolean;

  /**
   * Callback invoked on every classification cycle with the updated intent result.
   * This is the primary integration point for consuming applications.
   */
  onIntentUpdate?: (result: IntentResult) => void;

  /**
   * Callback invoked on every behavioral event capture.
   * Useful for debugging, analytics pipelines, or custom processing.
   */
  onEvent?: (event: BehavioralEvent) => void;

  /**
   * Exponential smoothing factor for temporal stability of classifications.
   * Higher values weight recent observations more heavily.
   * @default 0.3
   */
  smoothingFactor?: number;

  /**
   * Maximum number of behavioral events to retain in memory.
   * Older events are evicted in FIFO order.
   * @default 500
   */
  maxEventBuffer?: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// Collector Interface
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Contract that all behavioral collectors must implement.
 *
 * Collectors are responsible for binding to DOM/browser APIs,
 * emitting events, and providing a snapshot of current features.
 */
export interface Collector<T> {
  /** Start collecting behavioral signals. Idempotent. */
  start(): void;

  /** Stop collecting and release all event listeners. Idempotent. */
  stop(): void;

  /** Return the current feature snapshot. */
  getFeatures(): T;

  /** Reset internal state and accumulated features. */
  reset(): void;
}
