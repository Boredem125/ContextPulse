/**
 * @module ScrollCollector
 * @description Captures scroll behavior signals from the browser viewport.
 *
 * This collector tracks:
 * - **Scroll depth**: Maximum page depth reached as a [0, 1] ratio
 * - **Scroll speed**: Instantaneous and average velocity (px/s)
 * - **Direction changes**: Up↔down reversal count for scanning detection
 * - **Section dwell times**: Per-section visibility duration via IntersectionObserver
 * - **Total scroll distance**: Cumulative absolute displacement
 *
 * @remarks
 * Uses passive event listeners for zero-impact scroll performance.
 * IntersectionObserver thresholds are tuned for content-heavy e-commerce pages.
 * No PII is collected — only behavioral geometry.
 *
 * @packageDocumentation
 */

import type { ScrollFeatures, BehavioralEvent, Collector } from '@/sdk/types';

/** Minimum time delta (ms) between scroll samples to avoid division-by-zero. */
const MIN_SAMPLE_DELTA_MS = 16;

/** Maximum realistic scroll speed (px/s) — values above are clamped as erratic input. */
const MAX_SCROLL_SPEED = 15_000;

/** IntersectionObserver threshold steps for section visibility tracking. */
const INTERSECTION_THRESHOLDS = [0, 0.25, 0.5, 0.75, 1.0];

/** Default section selector when `data-section` attributes are not found. */
const SECTION_SELECTOR = '[data-section], section[id], article[id], [data-track-section]';

/**
 * Internal state for a single scroll sample used in velocity calculations.
 */
interface ScrollSample {
  position: number;
  timestamp: number;
}

/**
 * Tracks section visibility state for dwell time computation.
 */
interface SectionState {
  /** Whether the section is currently intersecting the viewport. */
  isVisible: boolean;

  /** Timestamp when the section last became visible (ms). */
  visibleSince: number;

  /** Accumulated visible time (ms). */
  totalDwell: number;
}

/**
 * Collector that observes scroll behavior and emits structured scroll features.
 *
 * @example
 * ```ts
 * const collector = new ScrollCollector((event) => {
 *   console.log('Scroll event:', event);
 * });
 * collector.start();
 *
 * // Later...
 * const features = collector.getFeatures();
 * console.log(`Max depth: ${features.depth}`);
 * collector.stop();
 * ```
 */
export class ScrollCollector implements Collector<ScrollFeatures> {
  // ── Internal State ──────────────────────────────────────────────────────

  private maxDepth = 0;
  private lastSample: ScrollSample | null = null;
  private lastDirection: 'up' | 'down' | null = null;
  private directionChanges = 0;
  private totalDistance = 0;
  private speedSamples: number[] = [];
  private currentSpeed = 0;
  private upScrollDistance = 0;
  private downScrollDistance = 0;
  private sectionsVisited = new Set<string>();
  private sectionStates = new Map<string, SectionState>();

  // ── DOM References ──────────────────────────────────────────────────────

  private observer: IntersectionObserver | null = null;
  private isRunning = false;

  // ── Bound Handlers (for proper cleanup) ─────────────────────────────────

  private readonly handleScroll: () => void;
  private readonly onEvent: (event: BehavioralEvent) => void;

  /**
   * @param onEvent - Callback invoked for each emitted scroll behavioral event.
   */
  constructor(onEvent: (event: BehavioralEvent) => void) {
    this.onEvent = onEvent;
    this.handleScroll = this.onScroll.bind(this);
  }

  // ── Collector Interface ─────────────────────────────────────────────────

  /** Begin capturing scroll events. Idempotent — safe to call multiple times. */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    window.addEventListener('scroll', this.handleScroll, { passive: true });
    this.initSectionObserver();
  }

  /** Stop capturing and release all listeners and observers. */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    window.removeEventListener('scroll', this.handleScroll);
    this.teardownSectionObserver();
  }

  /** Return the current accumulated scroll feature snapshot. */
  public getFeatures(): ScrollFeatures {
    // Flush any in-progress section dwell times
    const dwellTimes = this.computeSectionDwellTimes();

    const totalDirectional = this.upScrollDistance + this.downScrollDistance;
    const upRatio = totalDirectional > 0
      ? this.upScrollDistance / totalDirectional
      : 0;

    const avgSpeed = this.speedSamples.length > 0
      ? this.speedSamples.reduce((a, b) => a + b, 0) / this.speedSamples.length
      : 0;

    return {
      depth: this.maxDepth,
      speed: this.currentSpeed,
      directionChanges: this.directionChanges,
      sectionDwellTimes: dwellTimes,
      totalScrollDistance: this.totalDistance,
      sectionsVisited: this.sectionsVisited.size,
      upScrollRatio: upRatio,
      averageSpeed: avgSpeed,
    };
  }

  /** Reset all accumulated state to initial values. */
  public reset(): void {
    this.maxDepth = 0;
    this.lastSample = null;
    this.lastDirection = null;
    this.directionChanges = 0;
    this.totalDistance = 0;
    this.speedSamples = [];
    this.currentSpeed = 0;
    this.upScrollDistance = 0;
    this.downScrollDistance = 0;
    this.sectionsVisited.clear();
    this.sectionStates.clear();
  }

  // ── Scroll Event Processing ─────────────────────────────────────────────

  /**
   * Core scroll handler — computes velocity, direction, and depth from
   * the raw scroll event stream.
   */
  private onScroll(): void {
    const now = performance.now();
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight;
    const clientHeight = document.documentElement.clientHeight;

    // ── Depth Tracking ──────────────────────────────────────────────────
    const maxScrollable = Math.max(scrollHeight - clientHeight, 1);
    const currentDepth = Math.min(scrollTop / maxScrollable, 1);
    this.maxDepth = Math.max(this.maxDepth, currentDepth);

    // ── Velocity & Direction ────────────────────────────────────────────
    if (this.lastSample !== null) {
      const dt = now - this.lastSample.timestamp;

      if (dt >= MIN_SAMPLE_DELTA_MS) {
        const dy = scrollTop - this.lastSample.position;
        const absDy = Math.abs(dy);

        // Instantaneous speed (px/s), clamped to sane max
        const speed = Math.min((absDy / dt) * 1000, MAX_SCROLL_SPEED);
        this.currentSpeed = speed;
        this.speedSamples.push(speed);

        // Keep a rolling window of 200 speed samples to bound memory
        if (this.speedSamples.length > 200) {
          this.speedSamples = this.speedSamples.slice(-200);
        }

        // Accumulate absolute distance
        this.totalDistance += absDy;

        // Directional tracking
        if (absDy > 2) { // Dead-zone to filter sub-pixel jitter
          const direction: 'up' | 'down' = dy > 0 ? 'down' : 'up';

          if (direction === 'up') {
            this.upScrollDistance += absDy;
          } else {
            this.downScrollDistance += absDy;
          }

          if (this.lastDirection !== null && direction !== this.lastDirection) {
            this.directionChanges++;
          }
          this.lastDirection = direction;
        }
      }
    }

    this.lastSample = { position: scrollTop, timestamp: now };

    // ── Emit Event ──────────────────────────────────────────────────────
    this.emitEvent(currentDepth, scrollTop);
  }

  /**
   * Emits a structured behavioral event for the current scroll state.
   */
  private emitEvent(depth: number, scrollTop: number): void {
    this.onEvent({
      id: `scroll_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'scroll',
      value: depth,
      metadata: {
        scrollTop,
        speed: this.currentSpeed,
        direction: this.lastDirection,
        directionChanges: this.directionChanges,
      },
      timestamp: Date.now(),
    });
  }

  // ── Section Observation ─────────────────────────────────────────────────

  /**
   * Initializes an IntersectionObserver to track visibility of
   * semantic page sections identified by `data-section` or `section[id]`.
   */
  private initSectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersections(entries),
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: INTERSECTION_THRESHOLDS,
      },
    );

    // Observe all matching section elements
    const sections = document.querySelectorAll(SECTION_SELECTOR);
    sections.forEach((el) => {
      const sectionId = this.getSectionId(el);
      if (sectionId) {
        this.observer!.observe(el);
        if (!this.sectionStates.has(sectionId)) {
          this.sectionStates.set(sectionId, {
            isVisible: false,
            visibleSince: 0,
            totalDwell: 0,
          });
        }
      }
    });
  }

  /**
   * Process intersection entries to update section visibility and dwell times.
   */
  private handleIntersections(entries: IntersectionObserverEntry[]): void {
    const now = performance.now();

    for (const entry of entries) {
      const sectionId = this.getSectionId(entry.target);
      if (!sectionId) continue;

      let state = this.sectionStates.get(sectionId);
      if (!state) {
        state = { isVisible: false, visibleSince: 0, totalDwell: 0 };
        this.sectionStates.set(sectionId, state);
      }

      const isNowVisible = entry.isIntersecting && entry.intersectionRatio >= 0.25;

      if (isNowVisible && !state.isVisible) {
        // Section entered viewport
        state.isVisible = true;
        state.visibleSince = now;
        this.sectionsVisited.add(sectionId);
      } else if (!isNowVisible && state.isVisible) {
        // Section left viewport — accumulate dwell
        state.isVisible = false;
        if (state.visibleSince > 0) {
          state.totalDwell += now - state.visibleSince;
        }
      }
    }
  }

  /**
   * Extracts a stable section identifier from a DOM element.
   * Priority: data-section > data-track-section > id
   */
  private getSectionId(el: Element): string | null {
    return (
      el.getAttribute('data-section') ||
      el.getAttribute('data-track-section') ||
      el.id ||
      null
    );
  }

  /**
   * Computes finalized dwell times, including currently-visible sections.
   */
  private computeSectionDwellTimes(): Record<string, number> {
    const now = performance.now();
    const result: Record<string, number> = {};

    this.sectionStates.forEach((state, id) => {
      let dwell = state.totalDwell;
      if (state.isVisible && state.visibleSince > 0) {
        dwell += now - state.visibleSince;
      }
      result[id] = Math.round(dwell);
    });

    return result;
  }

  /**
   * Disconnects the IntersectionObserver and flushes pending dwell times.
   */
  private teardownSectionObserver(): void {
    if (this.observer) {
      // Flush in-progress dwell times before disconnect
      const now = performance.now();
      this.sectionStates.forEach((state) => {
        if (state.isVisible && state.visibleSince > 0) {
          state.totalDwell += now - state.visibleSince;
          state.isVisible = false;
        }
      });

      this.observer.disconnect();
      this.observer = null;
    }
  }
}
