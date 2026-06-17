import type {
  SDKConfig,
  IntentResult,
  BehavioralEvent,
  BehavioralFeatures,
  NormalizedFeatures,
} from './types';
import { ScrollCollector } from './collectors/ScrollCollector';
import { MouseCollector } from './collectors/MouseCollector';
import { EngagementCollector } from './collectors/EngagementCollector';
import { ContextCollector } from './collectors/ContextCollector';
import { FeatureExtractor } from './features/FeatureExtractor';
import { IntentClassifier } from './intent/IntentClassifier';
import { IntentVector } from './intent/IntentVector';

/**
 * ContextPulseSDK is the primary entry point for behavior tracking and intent inference.
 * Implements the Singleton pattern.
 */
export class ContextPulseSDK {
  private static instance: ContextPulseSDK | null = null;

  private config: Required<SDKConfig>;
  private scrollCollector: ScrollCollector;
  private mouseCollector: MouseCollector;
  private engagementCollector: EngagementCollector;
  private contextCollector: ContextCollector;

  private isRunning = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private eventBuffer: BehavioralEvent[] = [];
  
  private lastResult: IntentResult | null = null;
  private prevNormalizedFeatures: NormalizedFeatures | null = null;

  /**
   * Private constructor to enforce Singleton pattern.
   */
  private constructor(config: SDKConfig) {
    this.config = {
      siteId: config.siteId,
      collectionInterval: config.collectionInterval ?? 500,
      debug: config.debug ?? false,
      onIntentUpdate: config.onIntentUpdate ?? (() => {}),
      onEvent: config.onEvent ?? (() => {}),
      smoothingFactor: config.smoothingFactor ?? 0.3,
      maxEventBuffer: config.maxEventBuffer ?? 500,
    };

    // Initialize all collectors, forwarding their emitted events
    const eventRouter = (evt: BehavioralEvent) => this.handleEmittedEvent(evt);
    this.scrollCollector = new ScrollCollector(eventRouter);
    this.mouseCollector = new MouseCollector(eventRouter);
    this.engagementCollector = new EngagementCollector(eventRouter);
    this.contextCollector = new ContextCollector(eventRouter);
  }

  /**
   * Initialize the SDK with configuration options.
   * If already initialized, updates the configuration.
   */
  public static init(config: SDKConfig): ContextPulseSDK {
    if (!ContextPulseSDK.instance) {
      ContextPulseSDK.instance = new ContextPulseSDK(config);
      ContextPulseSDK.instance.start();
    } else {
      ContextPulseSDK.instance.updateConfig(config);
    }
    return ContextPulseSDK.instance;
  }

  /**
   * Return the singleton instance. Returns null if not initialized.
   */
  public static getInstance(): ContextPulseSDK | null {
    return ContextPulseSDK.instance;
  }

  /**
   * Update SDK configuration on the fly.
   */
  public updateConfig(newConfig: Partial<SDKConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig,
    };
    if (this.config.debug) {
      console.log('[ContextPulse SDK] Config updated:', this.config);
    }
    // Restart interval if timing changed and we are running
    if (this.isRunning) {
      this.stopInterval();
      this.startInterval();
    }
  }

  /**
   * Get the current inferred intent and 64-dim vector.
   */
  public getState(): IntentResult {
    if (this.lastResult) return this.lastResult;

    // Return a baseline default state if no cycle has run yet
    return {
      primaryIntent: 'Passive Browser',
      confidence: 0.1,
      scores: [
        { archetype: 'Passive Browser', score: 1.0, confidence: 0.1 },
        { archetype: 'Explorer', score: 0.0, confidence: 0.0 },
        { archetype: 'Comparator', score: 0.0, confidence: 0.0 },
        { archetype: 'Deal Seeker', score: 0.0, confidence: 0.0 },
        { archetype: 'Researcher', score: 0.0, confidence: 0.0 },
        { archetype: 'Impulse Buyer', score: 0.0, confidence: 0.0 },
        { archetype: 'Gift Shopper', score: 0.0, confidence: 0.0 },
        { archetype: 'Returning Buyer', score: 0.0, confidence: 0.0 },
      ],
      vector: new Array(64).fill(0),
      timestamp: Date.now(),
    };
  }

  /**
   * Get the buffer of recently tracked events.
   */
  public getEvents(): BehavioralEvent[] {
    return [...this.eventBuffer];
  }

  /**
   * Start collecting behavioral signals.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    if (this.config.debug) {
      console.log('[ContextPulse SDK] Starting collectors...');
    }

    this.scrollCollector.start();
    this.mouseCollector.start();
    this.engagementCollector.start();
    this.contextCollector.start();

    this.startInterval();
  }

  /**
   * Stop collecting behavioral signals and clear intervals.
   */
  public stop(): void {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.config.debug) {
      console.log('[ContextPulse SDK] Stopping collectors...');
    }

    this.scrollCollector.stop();
    this.mouseCollector.stop();
    this.engagementCollector.stop();
    this.contextCollector.stop();

    this.stopInterval();
  }

  /**
   * Destroy the SDK instance and cleanup all bindings.
   */
  public destroy(): void {
    this.stop();
    this.eventBuffer = [];
    this.lastResult = null;
    this.prevNormalizedFeatures = null;
    ContextPulseSDK.instance = null;
    if (this.config.debug) {
      console.log('[ContextPulse SDK] Destroyed.');
    }
  }

  // ── Internal Lifecycle ──────────────────────────────────────────────────

  private startInterval(): void {
    this.intervalId = setInterval(() => {
      this.runInferenceCycle();
    }, this.config.collectionInterval);
  }

  private stopInterval(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Routes events emitted from collectors, stores them in the event buffer,
   * and triggers the onEvent config callback.
   */
  private handleEmittedEvent(event: BehavioralEvent): void {
    this.eventBuffer.unshift(event);
    if (this.eventBuffer.length > this.config.maxEventBuffer) {
      this.eventBuffer.pop();
    }
    
    // Call user-provided listener
    this.config.onEvent(event);
  }

  /**
   * Pulls raw features from collectors, extracts/normalizes features,
   * runs classifier, creates 64-dim vector, updates state, and invokes callbacks.
   */
  private runInferenceCycle(): void {
    try {
      const rawFeatures: BehavioralFeatures = {
        scroll: this.scrollCollector.getFeatures(),
        mouse: this.mouseCollector.getFeatures(),
        engagement: this.engagementCollector.getFeatures(),
        context: this.contextCollector.getFeatures(),
        timestamp: Date.now(),
      };

      // Extract & normalize features
      const normalized = FeatureExtractor.extract(rawFeatures);

      // Classify intent
      const prevScores = this.lastResult?.scores;
      const classification = IntentClassifier.classify(
        normalized,
        prevScores,
        this.config.smoothingFactor
      );

      // Generate 64-dim vector
      const vector = IntentVector.generate(
        normalized,
        classification.scores,
        classification.confidence,
        this.prevNormalizedFeatures ?? undefined
      );

      // Update state
      const result: IntentResult = {
        primaryIntent: classification.primaryIntent,
        confidence: classification.confidence,
        scores: classification.scores,
        vector,
        timestamp: rawFeatures.timestamp,
      };

      this.lastResult = result;
      this.prevNormalizedFeatures = normalized;

      if (this.config.debug) {
        console.log(`[ContextPulse SDK] Inference: ${result.primaryIntent} (${Math.round(result.confidence * 100)}%)`);
      }

      // Invoke callback
      this.config.onIntentUpdate(result);
    } catch (err) {
      console.error('[ContextPulse SDK] Error in inference cycle:', err);
    }
  }
}
export default ContextPulseSDK;
