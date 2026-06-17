/**
 * @module MouseCollector
 * @description Captures cursor movement, hover, and click behavioral signals.
 *
 * Tracked signals:
 * - **Cursor velocity & acceleration**: Computed from successive mousemove position deltas
 * - **Hover targets**: Elements with `data-track` attributes that receive cursor attention
 * - **Hover duration**: Time spent hovering over each tracked element
 * - **Click hesitation**: Latency between hover-start and click on the same target
 * - **Cursor idle time**: Cumulative time with no cursor movement
 *
 * @remarks
 * Mousemove events are throttled to ~60fps via `requestAnimationFrame` to prevent
 * excessive computation on high-DPI trackpads. All tracking uses element-level
 * `data-track` attributes — no selector inference or DOM walking.
 *
 * @packageDocumentation
 */

import type { MouseFeatures, BehavioralEvent, Collector } from '@/sdk/types';

/** Threshold (ms) below which cursor movement is considered continuous motion. */
const IDLE_THRESHOLD_MS = 2_000;

/** Minimum displacement (px) to register as intentional movement vs. jitter. */
const JITTER_DEAD_ZONE_PX = 2;

/** Maximum number of hover targets retained in the interaction sequence log. */
const MAX_HOVER_TARGETS = 100;

/**
 * Internal representation of a cursor position sample.
 */
interface CursorSample {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * State tracking for an in-progress hover interaction.
 */
interface ActiveHover {
  /** The data-track identifier of the hovered element. */
  target: string;

  /** Timestamp when the hover began (ms). */
  startTime: number;

  /** The DOM element being hovered. */
  element: Element;
}

/**
 * Collector that observes mouse movement, hover, and click patterns.
 *
 * @example
 * ```ts
 * const mouse = new MouseCollector((event) => {
 *   analytics.push(event);
 * });
 * mouse.start();
 *
 * // On cleanup
 * mouse.stop();
 * ```
 */
export class MouseCollector implements Collector<MouseFeatures> {
  // ── Kinematics State ────────────────────────────────────────────────────

  private lastSample: CursorSample | null = null;
  private previousVelocity = 0;
  private currentVelocity = 0;
  private currentAcceleration = 0;
  private totalDistance = 0;

  // ── Hover State ─────────────────────────────────────────────────────────

  private activeHover: ActiveHover | null = null;
  private hoverDurations: number[] = [];
  private hoverCount = 0;
  private hoverTargets: string[] = [];

  // ── Click State ─────────────────────────────────────────────────────────

  private clickCount = 0;
  private hesitationSamples: number[] = [];

  // ── Idle Tracking ───────────────────────────────────────────────────────

  private lastMoveTimestamp = 0;
  private cumulativeIdleTime = 0;
  private idleCheckTimer: ReturnType<typeof setInterval> | null = null;

  // ── Lifecycle ───────────────────────────────────────────────────────────

  private isRunning = false;
  private rafId: number | null = null;
  private pendingEvent: MouseEvent | null = null;

  // ── Bound Handlers ──────────────────────────────────────────────────────

  private readonly handleMouseMove: (e: MouseEvent) => void;
  private readonly handleClick: (e: MouseEvent) => void;
  private readonly handleMouseOver: (e: MouseEvent) => void;
  private readonly handleMouseOut: (e: MouseEvent) => void;
  private readonly onEvent: (event: BehavioralEvent) => void;

  /**
   * @param onEvent - Callback invoked for each emitted mouse behavioral event.
   */
  constructor(onEvent: (event: BehavioralEvent) => void) {
    this.onEvent = onEvent;

    // Bind handlers once for deterministic add/remove
    this.handleMouseMove = this.onMouseMove.bind(this);
    this.handleClick = this.onClick.bind(this);
    this.handleMouseOver = this.onMouseOver.bind(this);
    this.handleMouseOut = this.onMouseOut.bind(this);
  }

  // ── Collector Interface ─────────────────────────────────────────────────

  /** Begin capturing mouse events. Idempotent. */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastMoveTimestamp = performance.now();

    document.addEventListener('mousemove', this.handleMouseMove, { passive: true });
    document.addEventListener('click', this.handleClick, { passive: true });
    document.addEventListener('mouseover', this.handleMouseOver, { passive: true });
    document.addEventListener('mouseout', this.handleMouseOut, { passive: true });

    // Periodic idle time accumulation (every 500ms)
    this.idleCheckTimer = setInterval(() => this.checkIdle(), 500);
  }

  /** Stop capturing and release all listeners. */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('mouseover', this.handleMouseOver);
    document.removeEventListener('mouseout', this.handleMouseOut);

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.idleCheckTimer !== null) {
      clearInterval(this.idleCheckTimer);
      this.idleCheckTimer = null;
    }

    // Flush any active hover
    this.flushActiveHover();
  }

  /** Return the current accumulated mouse feature snapshot. */
  public getFeatures(): MouseFeatures {
    const avgHover = this.hoverDurations.length > 0
      ? this.hoverDurations.reduce((a, b) => a + b, 0) / this.hoverDurations.length
      : 0;

    const avgHesitation = this.hesitationSamples.length > 0
      ? this.hesitationSamples.reduce((a, b) => a + b, 0) / this.hesitationSamples.length
      : 0;

    return {
      velocity: this.currentVelocity,
      acceleration: this.currentAcceleration,
      hoverCount: this.hoverCount,
      avgHoverDuration: Math.round(avgHover),
      clickCount: this.clickCount,
      clickHesitationMs: Math.round(avgHesitation),
      cursorIdleTime: Math.round(this.cumulativeIdleTime),
      hoverTargets: [...this.hoverTargets],
      totalDistance: Math.round(this.totalDistance),
    };
  }

  /** Reset all accumulated state to initial values. */
  public reset(): void {
    this.lastSample = null;
    this.previousVelocity = 0;
    this.currentVelocity = 0;
    this.currentAcceleration = 0;
    this.totalDistance = 0;
    this.activeHover = null;
    this.hoverDurations = [];
    this.hoverCount = 0;
    this.hoverTargets = [];
    this.clickCount = 0;
    this.hesitationSamples = [];
    this.cumulativeIdleTime = 0;
    this.lastMoveTimestamp = performance.now();
  }

  // ── Mouse Movement Processing ───────────────────────────────────────────

  /**
   * Throttled mousemove handler — defers processing to the next
   * animation frame to align with display refresh rate.
   */
  private onMouseMove(e: MouseEvent): void {
    this.pendingEvent = e;

    if (this.rafId === null) {
      this.rafId = requestAnimationFrame(() => {
        this.rafId = null;
        if (this.pendingEvent) {
          this.processMouseMove(this.pendingEvent);
          this.pendingEvent = null;
        }
      });
    }
  }

  /**
   * Core movement processor — extracts kinematics from position deltas.
   *
   * Velocity is computed as Euclidean displacement / time.
   * Acceleration is the first derivative of velocity over the sample interval.
   */
  private processMouseMove(e: MouseEvent): void {
    const now = performance.now();
    const sample: CursorSample = { x: e.clientX, y: e.clientY, timestamp: now };

    if (this.lastSample) {
      const dx = sample.x - this.lastSample.x;
      const dy = sample.y - this.lastSample.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const dt = now - this.lastSample.timestamp;

      if (distance >= JITTER_DEAD_ZONE_PX && dt > 0) {
        this.totalDistance += distance;

        // Velocity in px/s
        const velocity = (distance / dt) * 1000;
        this.previousVelocity = this.currentVelocity;
        this.currentVelocity = velocity;

        // Acceleration in px/s²
        if (dt > 0) {
          this.currentAcceleration = Math.abs(
            ((velocity - this.previousVelocity) / dt) * 1000,
          );
        }

        this.lastMoveTimestamp = now;
      }
    }

    this.lastSample = sample;
  }

  // ── Hover Tracking ──────────────────────────────────────────────────────

  /**
   * Handles mouseenter on elements with `data-track` attributes.
   * Uses event delegation on the document to avoid per-element binding.
   */
  private onMouseOver(e: MouseEvent): void {
    const target = this.findTrackableAncestor(e.target as Element);
    if (!target) return;

    const trackId = target.getAttribute('data-track')!;

    // If already hovering the same element, ignore (prevents re-entry flicker)
    if (this.activeHover?.target === trackId && this.activeHover?.element === target) {
      return;
    }

    // Flush previous hover if switching targets
    this.flushActiveHover();

    this.activeHover = {
      target: trackId,
      startTime: performance.now(),
      element: target,
    };

    this.hoverCount++;
    this.addHoverTarget(trackId);

    this.onEvent({
      id: `hover_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'hover',
      target: trackId,
      timestamp: Date.now(),
      metadata: { action: 'enter' },
    });
  }

  /**
   * Handles mouseleave on tracked elements — records hover duration.
   */
  private onMouseOut(e: MouseEvent): void {
    if (!this.activeHover) return;

    const target = this.findTrackableAncestor(e.target as Element);
    if (!target || target.getAttribute('data-track') !== this.activeHover.target) return;

    this.flushActiveHover();
  }

  /**
   * Walks up the DOM from the event target to find the nearest
   * ancestor with a `data-track` attribute.
   *
   * @param el - Starting element
   * @returns The trackable ancestor, or null
   */
  private findTrackableAncestor(el: Element | null): Element | null {
    let current = el;
    let depth = 0;
    const MAX_DEPTH = 8; // Cap traversal to avoid performance issues

    while (current && depth < MAX_DEPTH) {
      if (current.hasAttribute?.('data-track')) return current;
      current = current.parentElement;
      depth++;
    }
    return null;
  }

  /**
   * Finalizes an active hover by recording its duration.
   */
  private flushActiveHover(): void {
    if (!this.activeHover) return;

    const duration = performance.now() - this.activeHover.startTime;
    this.hoverDurations.push(duration);

    // Keep bounded
    if (this.hoverDurations.length > 200) {
      this.hoverDurations = this.hoverDurations.slice(-200);
    }

    this.activeHover = null;
  }

  /**
   * Adds a hover target to the interaction sequence, bounded by MAX_HOVER_TARGETS.
   */
  private addHoverTarget(trackId: string): void {
    this.hoverTargets.push(trackId);
    if (this.hoverTargets.length > MAX_HOVER_TARGETS) {
      this.hoverTargets = this.hoverTargets.slice(-MAX_HOVER_TARGETS);
    }
  }

  // ── Click Processing ────────────────────────────────────────────────────

  /**
   * Click handler — records click count and computes hesitation
   * relative to the active hover start time.
   */
  private onClick(e: MouseEvent): void {
    this.clickCount++;

    const target = this.findTrackableAncestor(e.target as Element);
    const trackId = target?.getAttribute('data-track') ?? undefined;

    // Compute hesitation if clicking on the currently-hovered element
    if (this.activeHover && target && trackId === this.activeHover.target) {
      const hesitation = performance.now() - this.activeHover.startTime;
      this.hesitationSamples.push(hesitation);

      // Bound the hesitation buffer
      if (this.hesitationSamples.length > 100) {
        this.hesitationSamples = this.hesitationSamples.slice(-100);
      }
    }

    this.onEvent({
      id: `click_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'click',
      target: trackId,
      timestamp: Date.now(),
      metadata: {
        hesitationMs: this.hesitationSamples.length > 0
          ? this.hesitationSamples[this.hesitationSamples.length - 1]
          : null,
        x: e.clientX,
        y: e.clientY,
      },
    });
  }

  // ── Idle Detection ──────────────────────────────────────────────────────

  /**
   * Periodic check for cursor inactivity. If the cursor hasn't moved
   * for longer than IDLE_THRESHOLD_MS, accumulate idle time.
   */
  private checkIdle(): void {
    const now = performance.now();
    const timeSinceLastMove = now - this.lastMoveTimestamp;

    if (timeSinceLastMove >= IDLE_THRESHOLD_MS) {
      // Accumulate only the check interval to avoid double-counting
      this.cumulativeIdleTime += 500;
    }
  }
}
