/**
 * @module ContextCollector
 * @description Captures environmental and session context signals.
 *
 * This collector provides the "who/where/when" context that augments
 * behavioral signals with situational awareness:
 *
 * - **Device type**: Classified from viewport width and user-agent heuristics
 * - **Browser family**: Extracted from navigator.userAgent
 * - **Referrer classification**: Direct, search, social, or external
 * - **Viewport dimensions**: Current window size in CSS pixels
 * - **Time of day**: Bucketed into morning/afternoon/evening/night
 * - **Session tracking**: Duration since init and page view count
 *
 * @remarks
 * This collector intentionally avoids fingerprinting techniques. Device
 * classification uses only viewport width and broad UA family detection.
 * No IP, geolocation, or persistent identifiers are collected.
 *
 * @packageDocumentation
 */

import type { ContextFeatures, BehavioralEvent, Collector } from '@/sdk/types';

/**
 * Known search engine referrer domain patterns.
 */
const SEARCH_ENGINE_PATTERNS = [
  'google.', 'bing.', 'yahoo.', 'duckduckgo.', 'baidu.',
  'yandex.', 'ecosia.', 'ask.', 'aol.',
] as const;

/**
 * Known social media referrer domain patterns.
 */
const SOCIAL_PATTERNS = [
  'facebook.', 'twitter.', 'instagram.', 'linkedin.', 'pinterest.',
  'reddit.', 'tiktok.', 'youtube.', 't.co', 'fb.me',
] as const;

/**
 * Viewport width breakpoints for device classification.
 * Aligned with common responsive design breakpoints.
 */
const DEVICE_BREAKPOINTS = {
  mobile: 768,
  tablet: 1024,
} as const;

/**
 * Time-of-day hour boundaries (24h format, local time).
 */
const TIME_OF_DAY_RANGES = {
  morning: { start: 6, end: 12 },
  afternoon: { start: 12, end: 17 },
  evening: { start: 17, end: 21 },
  // night: 21-6 (default/fallthrough)
} as const;

/**
 * Abbreviated day names for consistent day-of-week representation.
 */
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;

/**
 * Collector for environmental and session context features.
 *
 * @example
 * ```ts
 * const ctx = new ContextCollector((event) => {
 *   console.log('Context captured:', event);
 * });
 * ctx.start();
 *
 * const features = ctx.getFeatures();
 * console.log(`Device: ${features.deviceType}, Browser: ${features.browser}`);
 * ```
 */
export class ContextCollector implements Collector<ContextFeatures> {
  // ── Session State ───────────────────────────────────────────────────────

  private sessionStart: number;
  private pageCount = 1;
  private isRunning = false;

  // ── Cached Context (computed once or on resize) ─────────────────────────

  private cachedDeviceType: ContextFeatures['deviceType'];
  private cachedBrowser: string;
  private cachedReferrer: string;
  private cachedIsDirect: boolean;
  private cachedIsSearchReferral: boolean;
  private currentViewport: { width: number; height: number };

  // ── Bound Handlers ──────────────────────────────────────────────────────

  private readonly handleResize: () => void;
  private readonly handleVisibilityChange: () => void;
  private readonly handlePopState: () => void;
  private readonly onEvent: (event: BehavioralEvent) => void;

  /**
   * @param onEvent - Callback invoked when context events are emitted.
   */
  constructor(onEvent: (event: BehavioralEvent) => void) {
    this.onEvent = onEvent;
    this.sessionStart = Date.now();

    // Compute initial context
    this.cachedDeviceType = this.detectDeviceType();
    this.cachedBrowser = this.detectBrowser();
    this.cachedReferrer = this.sanitizeReferrer(document.referrer);
    this.cachedIsDirect = this.isDirectNavigation();
    this.cachedIsSearchReferral = this.isSearchReferrer();
    this.currentViewport = this.getViewportDimensions();

    // Bind handlers
    this.handleResize = this.onResize.bind(this);
    this.handleVisibilityChange = this.onVisibilityChange.bind(this);
    this.handlePopState = this.onNavigate.bind(this);
  }

  // ── Collector Interface ─────────────────────────────────────────────────

  /** Begin tracking context signals. Idempotent. */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    window.addEventListener('resize', this.handleResize, { passive: true });
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    window.addEventListener('popstate', this.handlePopState);

    // Emit initial context event
    this.emitContextSnapshot('init');
  }

  /** Stop tracking and release listeners. */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    window.removeEventListener('resize', this.handleResize);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    window.removeEventListener('popstate', this.handlePopState);
  }

  /** Return the current context feature snapshot. */
  public getFeatures(): ContextFeatures {
    return {
      deviceType: this.cachedDeviceType,
      browser: this.cachedBrowser,
      referrer: this.cachedReferrer,
      viewport: { ...this.currentViewport },
      timeOfDay: this.getTimeOfDay(),
      dayOfWeek: DAY_NAMES[new Date().getDay()],
      sessionDuration: Date.now() - this.sessionStart,
      pageCount: this.pageCount,
      isDirect: this.cachedIsDirect,
      isSearchReferral: this.cachedIsSearchReferral,
    };
  }

  /** Reset session-level state (preserves environment context). */
  public reset(): void {
    this.sessionStart = Date.now();
    this.pageCount = 1;
  }

  // ── Device Detection ────────────────────────────────────────────────────

  /**
   * Classifies device type using a combination of viewport width and
   * user-agent heuristics. Viewport is the primary signal; UA is used
   * for disambiguation (e.g., tablets in landscape mode).
   *
   * @returns Device classification: 'mobile', 'tablet', or 'desktop'
   */
  private detectDeviceType(): ContextFeatures['deviceType'] {
    const width = window.innerWidth;
    const ua = navigator.userAgent.toLowerCase();

    // Mobile-specific UA patterns
    const isMobileUA = /android.*mobile|iphone|ipod|blackberry|iemobile|opera mini/i.test(ua);
    const isTabletUA = /ipad|android(?!.*mobile)|tablet/i.test(ua);

    if (width < DEVICE_BREAKPOINTS.mobile || isMobileUA) return 'mobile';
    if (width < DEVICE_BREAKPOINTS.tablet || isTabletUA) return 'tablet';
    return 'desktop';
  }

  // ── Browser Detection ───────────────────────────────────────────────────

  /**
   * Extracts the browser family from the user agent string.
   * Uses feature detection ordering to handle UA spoofing.
   *
   * @returns Browser family name (e.g., 'Chrome', 'Firefox', 'Safari')
   */
  private detectBrowser(): string {
    const ua = navigator.userAgent;

    // Order matters — Chrome's UA contains "Safari", Edge contains "Chrome"
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('OPR/') || ua.includes('Opera')) return 'Opera';
    if (ua.includes('Brave')) return 'Brave';
    if (ua.includes('Vivaldi')) return 'Vivaldi';
    if (ua.includes('Chrome') && ua.includes('Safari')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari';
    if (ua.includes('MSIE') || ua.includes('Trident')) return 'IE';

    return 'Unknown';
  }

  // ── Referrer Analysis ───────────────────────────────────────────────────

  /**
   * Sanitizes the referrer URL to extract only the hostname.
   * Strips paths, query parameters, and fragments to avoid PII leakage.
   *
   * @param referrer - Raw document.referrer value
   * @returns Hostname-only referrer or empty string
   */
  private sanitizeReferrer(referrer: string): string {
    if (!referrer) return '';

    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return '';
    }
  }

  /**
   * Determines if the current navigation is a direct visit
   * (no referrer, or referrer is the same origin).
   */
  private isDirectNavigation(): boolean {
    const referrer = document.referrer;
    if (!referrer) return true;

    try {
      const referrerHost = new URL(referrer).hostname;
      return referrerHost === window.location.hostname;
    } catch {
      return true;
    }
  }

  /**
   * Checks if the referrer originates from a known search engine.
   */
  private isSearchReferrer(): boolean {
    const referrer = this.cachedReferrer.toLowerCase();
    if (!referrer) return false;
    return SEARCH_ENGINE_PATTERNS.some((pattern) => referrer.includes(pattern));
  }

  // ── Time Classification ─────────────────────────────────────────────────

  /**
   * Buckets the current local hour into a time-of-day category.
   *
   * | Range    | Label       |
   * |----------|-------------|
   * | 06–12    | morning     |
   * | 12–17    | afternoon   |
   * | 17–21    | evening     |
   * | 21–06    | night       |
   */
  private getTimeOfDay(): ContextFeatures['timeOfDay'] {
    const hour = new Date().getHours();

    if (hour >= TIME_OF_DAY_RANGES.morning.start && hour < TIME_OF_DAY_RANGES.morning.end) {
      return 'morning';
    }
    if (hour >= TIME_OF_DAY_RANGES.afternoon.start && hour < TIME_OF_DAY_RANGES.afternoon.end) {
      return 'afternoon';
    }
    if (hour >= TIME_OF_DAY_RANGES.evening.start && hour < TIME_OF_DAY_RANGES.evening.end) {
      return 'evening';
    }
    return 'night';
  }

  // ── Viewport Tracking ──────────────────────────────────────────────────

  /**
   * Returns current viewport dimensions in CSS pixels.
   */
  private getViewportDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  }

  /**
   * Handles viewport resize — updates device type and viewport dimensions.
   */
  private onResize(): void {
    this.currentViewport = this.getViewportDimensions();
    this.cachedDeviceType = this.detectDeviceType();
  }

  // ── Navigation Tracking ─────────────────────────────────────────────────

  /**
   * Tracks SPA-style navigation via popstate events.
   * Increments the page counter for multi-page journey tracking.
   */
  private onNavigate(): void {
    this.pageCount++;
    this.emitContextSnapshot('navigate');
  }

  /**
   * Tracks page visibility changes for session continuity awareness.
   */
  private onVisibilityChange(): void {
    if (document.visibilityState === 'visible') {
      this.emitContextSnapshot('resume');
    }
  }

  // ── Event Emission ──────────────────────────────────────────────────────

  /**
   * Emits a context snapshot as a behavioral event.
   */
  private emitContextSnapshot(trigger: string): void {
    this.onEvent({
      id: `ctx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      type: 'context',
      metadata: {
        trigger,
        deviceType: this.cachedDeviceType,
        browser: this.cachedBrowser,
        referrer: this.cachedReferrer,
        viewport: { ...this.currentViewport },
        timeOfDay: this.getTimeOfDay(),
        sessionDuration: Date.now() - this.sessionStart,
        pageCount: this.pageCount,
      },
      timestamp: Date.now(),
    });
  }
}
