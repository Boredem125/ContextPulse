/**
 * ContextPulse Dashboard Store (Zustand)
 *
 * Central state management for the enterprise dashboard.
 * Includes realistic mock data generators and a live simulation
 * that periodically adds events and varies metrics to mimic a
 * production analytics platform.
 */

import { create } from 'zustand';
import { INTENT_ARCHETYPES, type IntentArchetype } from '@/lib/constants';
import { clamp, randomInRange } from '@/lib/utils';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface IntentScore {
  archetype: IntentArchetype;
  score: number;
}

export interface CurrentIntent {
  primaryIntent: IntentArchetype;
  confidence: number;
  scores: IntentScore[];
}

export interface SessionData {
  id: string;
  startTime: Date;
  device: string;
  browser: string;
  os: string;
  location: string;
  pagesViewed: number;
  interactions: number;
  currentPage: string;
}

export type EventType =
  | 'scroll'
  | 'hover'
  | 'click'
  | 'view'
  | 'compare'
  | 'cta'
  | 'review'
  | 'cart';

export interface BehavioralEvent {
  id: string;
  type: EventType;
  description: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}

export interface DashboardMetrics {
  activeSessions: number;
  avgConfidence: number;
  personalizationRate: number;
  intentAccuracy: number;
  ctrUplift: number;
  conversionUplift: number;
  coldStartReduction: number;
}

export interface DashboardState {
  currentIntent: CurrentIntent;
  intentVector: number[];
  sessionData: SessionData;
  events: BehavioralEvent[];
  metrics: DashboardMetrics;
  simulationInterval: ReturnType<typeof setInterval> | null;

  sidebarCollapsed: boolean;

  // Actions
  addEvent: (event: BehavioralEvent) => void;
  updateIntent: (intent: Partial<CurrentIntent>) => void;
  updateVector: (vector: number[]) => void;
  refreshMetrics: () => void;
  startSimulation: () => void;
  stopSimulation: () => void;
  toggleSidebar: () => void;
}

/* ------------------------------------------------------------------ */
/*  Seed data helpers                                                  */
/* ------------------------------------------------------------------ */

/** Generate a realistic 64-dim intent vector with meaningful clusters. */
function generateIntentVector(): number[] {
  // Group structure: 8 groups of 8 dimensions each
  // Group 0: Intent scores — higher for Comparator archetype
  // Group 1: Scroll behavior — moderate
  // Group 2: Mouse dynamics — high activity
  // Group 3: Engagement signals — high
  // Group 4: Contextual features — mixed
  // Group 5: Temporal patterns — moderate-high
  // Group 6: Cross-signal correlations — moderate
  // Group 7: Meta features — low-moderate
  const bases = [0.62, 0.45, 0.58, 0.71, 0.39, 0.53, 0.41, 0.28];
  const vector: number[] = [];
  for (let g = 0; g < 8; g++) {
    for (let d = 0; d < 8; d++) {
      const noise = (Math.random() - 0.5) * 0.25;
      vector.push(clamp(bases[g] + noise, 0, 1));
    }
  }
  return vector;
}

/** Pre-seeded behavioral events to populate the stream on load. */
function generateSeedEvents(): BehavioralEvent[] {
  const now = Date.now();
  const events: BehavioralEvent[] = [
    { id: 'e01', type: 'view',    description: 'Viewed Homepage hero section',          timestamp: new Date(now - 120000) },
    { id: 'e02', type: 'scroll',  description: 'Scrolled to Products section (62%)',     timestamp: new Date(now - 115000) },
    { id: 'e03', type: 'hover',   description: 'Hovered Product: MacBook Pro 16"',       timestamp: new Date(now - 108000) },
    { id: 'e04', type: 'click',   description: 'Clicked "View Details" on MacBook Pro',  timestamp: new Date(now - 102000) },
    { id: 'e05', type: 'view',    description: 'Viewed Product Detail Page — MacBook Pro',timestamp: new Date(now - 98000) },
    { id: 'e06', type: 'scroll',  description: 'Scrolled to Specifications tab',         timestamp: new Date(now - 91000) },
    { id: 'e07', type: 'hover',   description: 'Hovered "Compare Models" button',        timestamp: new Date(now - 85000) },
    { id: 'e08', type: 'compare', description: 'Opened comparison: MacBook Pro vs Dell XPS', timestamp: new Date(now - 80000) },
    { id: 'e09', type: 'scroll',  description: 'Scrolled comparison table to Battery Life', timestamp: new Date(now - 72000) },
    { id: 'e10', type: 'hover',   description: 'Hovered price column in comparison',     timestamp: new Date(now - 65000) },
    { id: 'e11', type: 'click',   description: 'Clicked "Add to Compare" — ThinkPad X1', timestamp: new Date(now - 58000) },
    { id: 'e12', type: 'compare', description: 'Updated comparison: 3 laptops side-by-side',timestamp: new Date(now - 52000) },
    { id: 'e13', type: 'review',  description: 'Scrolled to user reviews section',       timestamp: new Date(now - 46000) },
    { id: 'e14', type: 'hover',   description: 'Hovered 4.7★ review badge',              timestamp: new Date(now - 40000) },
    { id: 'e15', type: 'scroll',  description: 'Scrolled to Pricing section (91%)',       timestamp: new Date(now - 34000) },
    { id: 'e16', type: 'cta',     description: 'Hovered "Buy Now" CTA for 2.3s',         timestamp: new Date(now - 28000) },
    { id: 'e17', type: 'click',   description: 'Clicked "See All Configurations"',       timestamp: new Date(now - 22000) },
    { id: 'e18', type: 'hover',   description: 'Hovered product image carousel',         timestamp: new Date(now - 16000) },
    { id: 'e19', type: 'cart',    description: 'Added MacBook Pro M4 to cart',            timestamp: new Date(now - 10000) },
    { id: 'e20', type: 'view',    description: 'Viewing cart — 1 item ($2,499)',          timestamp: new Date(now - 5000) },
    { id: 'e21', type: 'scroll',  description: 'Scrolled to recommended accessories',    timestamp: new Date(now - 3000) },
    { id: 'e22', type: 'hover',   description: 'Hovered USB-C Hub accessory ($79)',       timestamp: new Date(now - 1500) },
  ];
  return events;
}

/** Templates for random new events added during simulation */
const EVENT_TEMPLATES: { type: EventType; description: string }[] = [
  { type: 'scroll',  description: 'Scrolled to Pricing section (88%)' },
  { type: 'hover',   description: 'Hovered Product: Sony WH-1000XM5' },
  { type: 'click',   description: 'Clicked "Compare" on Galaxy S25 Ultra' },
  { type: 'view',    description: 'Viewed Category: Premium Laptops' },
  { type: 'compare', description: 'Added Dell XPS 15 to comparison' },
  { type: 'cta',     description: 'Engaged "Free Trial" CTA for 1.8s' },
  { type: 'review',  description: 'Expanded 5-star review by "TechGuru42"' },
  { type: 'cart',    description: 'Updated cart quantity to 2' },
  { type: 'hover',   description: 'Hovered warranty options tooltip' },
  { type: 'click',   description: 'Clicked "Notify Me" for restock alert' },
  { type: 'scroll',  description: 'Scrolled product gallery — image 3 of 6' },
  { type: 'view',    description: 'Viewed "Customer Also Bought" section' },
  { type: 'compare', description: 'Opened spec comparison overlay' },
  { type: 'hover',   description: 'Hovered financing option — $83/mo' },
  { type: 'click',   description: 'Clicked "Read More Reviews" link' },
  { type: 'cta',     description: 'Hovered "Add to Cart" for 3.1s' },
  { type: 'scroll',  description: 'Scrolled to FAQ section (95%)' },
  { type: 'review',  description: 'Viewed photo in review by "DesignPro"' },
];

let eventCounter = 100;

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useDashboardStore = create<DashboardState>((set, get) => ({
  /* --- Initial state ------------------------------------------------ */

  currentIntent: {
    primaryIntent: 'Comparator',
    confidence: 0.89,
    scores: [
      { archetype: 'Explorer',        score: 0.42 },
      { archetype: 'Comparator',      score: 0.89 },
      { archetype: 'Deal Seeker',     score: 0.35 },
      { archetype: 'Researcher',      score: 0.71 },
      { archetype: 'Impulse Buyer',   score: 0.18 },
      { archetype: 'Gift Shopper',    score: 0.09 },
      { archetype: 'Returning Buyer', score: 0.27 },
      { archetype: 'Passive Browser', score: 0.05 },
    ],
  },

  intentVector: generateIntentVector(),

  sessionData: {
    id: 'sess_4f8a2e7c',
    startTime: new Date(Date.now() - 180000), // 3 min ago
    device: 'Desktop',
    browser: 'Chrome 125',
    os: 'Windows 11',
    location: 'San Francisco, CA',
    pagesViewed: 7,
    interactions: 24,
    currentPage: 'Products',
  },

  events: generateSeedEvents(),

  metrics: {
    activeSessions: 1247,
    avgConfidence: 87.3,
    personalizationRate: 94.1,
    intentAccuracy: 91.2,
    ctrUplift: 22.4,
    conversionUplift: 18.7,
    coldStartReduction: 65.3,
  },

  simulationInterval: null,
  sidebarCollapsed: false,

  /* --- Actions ------------------------------------------------------ */

  addEvent: (event) =>
    set((state) => ({
      events: [event, ...state.events].slice(0, 50),
    })),

  updateIntent: (intent) =>
    set((state) => ({
      currentIntent: { ...state.currentIntent, ...intent },
    })),

  updateVector: (vector) => set({ intentVector: vector }),

  refreshMetrics: () =>
    set((state) => ({
      metrics: {
        activeSessions: Math.round(state.metrics.activeSessions + randomInRange(-15, 20)),
        avgConfidence: clamp(+(state.metrics.avgConfidence + randomInRange(-0.3, 0.4)).toFixed(1), 80, 95),
        personalizationRate: clamp(+(state.metrics.personalizationRate + randomInRange(-0.2, 0.3)).toFixed(1), 88, 99),
        intentAccuracy: clamp(+(state.metrics.intentAccuracy + randomInRange(-0.2, 0.3)).toFixed(1), 85, 96),
        ctrUplift: clamp(+(state.metrics.ctrUplift + randomInRange(-0.3, 0.3)).toFixed(1), 18, 28),
        conversionUplift: clamp(+(state.metrics.conversionUplift + randomInRange(-0.2, 0.3)).toFixed(1), 14, 24),
        coldStartReduction: clamp(+(state.metrics.coldStartReduction + randomInRange(-0.3, 0.3)).toFixed(1), 58, 72),
      },
    })),

  startSimulation: () => {
    const existing = get().simulationInterval;
    if (existing) return; // already running

    const intervalId = setInterval(() => {
      const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)];
      const newEvent: BehavioralEvent = {
        id: `e${++eventCounter}`,
        type: template.type,
        description: template.description,
        timestamp: new Date(),
      };
      get().addEvent(newEvent);
      get().refreshMetrics();

      // Slightly perturb vector
      const vec = get().intentVector.map((v) =>
        clamp(v + (Math.random() - 0.5) * 0.04, 0, 1),
      );
      get().updateVector(vec);

      // Slightly perturb confidence
      const scores = get().currentIntent.scores.map((s) => ({
        ...s,
        score: clamp(s.score + (Math.random() - 0.5) * 0.02, 0, 1),
      }));
      const best = scores.reduce((a, b) => (b.score > a.score ? b : a));
      get().updateIntent({
        scores,
        primaryIntent: best.archetype,
        confidence: +best.score.toFixed(2),
      });

      // Increment session counters
      set((state) => ({
        sessionData: {
          ...state.sessionData,
          interactions: state.sessionData.interactions + 1,
        },
      }));
    }, 3000);

    set({ simulationInterval: intervalId });
  },

  stopSimulation: () => {
    const id = get().simulationInterval;
    if (id) clearInterval(id);
    set({ simulationInterval: null });
  },

  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
