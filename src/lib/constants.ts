/**
 * ContextPulse — Intent Archetypes & Configuration Constants
 * These represent the core behavioral classifications used by the inference engine.
 */

export const INTENT_ARCHETYPES = [
  'Explorer',
  'Comparator',
  'Deal Seeker',
  'Researcher',
  'Impulse Buyer',
  'Gift Shopper',
  'Returning Buyer',
  'Passive Browser',
] as const;

export type IntentArchetype = typeof INTENT_ARCHETYPES[number];

/** Colors mapped to each intent archetype for visualization consistency */
export const INTENT_COLORS: Record<IntentArchetype, string> = {
  'Explorer': '#6366f1',
  'Comparator': '#8b5cf6',
  'Deal Seeker': '#f59e0b',
  'Researcher': '#3b82f6',
  'Impulse Buyer': '#ef4444',
  'Gift Shopper': '#ec4899',
  'Returning Buyer': '#22d3ee',
  'Passive Browser': '#64748b',
};

/** Icons for each intent archetype (lucide icon names) */
export const INTENT_ICONS: Record<IntentArchetype, string> = {
  'Explorer': 'Compass',
  'Comparator': 'GitCompare',
  'Deal Seeker': 'BadgePercent',
  'Researcher': 'BookOpen',
  'Impulse Buyer': 'Zap',
  'Gift Shopper': 'Gift',
  'Returning Buyer': 'RotateCcw',
  'Passive Browser': 'Eye',
};

/** SDK Configuration Defaults */
export const SDK_CONFIG = {
  COLLECTION_INTERVAL_MS: 500,
  FEATURE_WINDOW_SHORT: 5000,   // 5 second window
  FEATURE_WINDOW_MEDIUM: 15000, // 15 second window
  FEATURE_WINDOW_LONG: 30000,   // 30 second window
  VECTOR_DIMENSIONS: 64,
  MIN_CONFIDENCE_THRESHOLD: 0.3,
  SCROLL_SECTION_IDS: ['hero', 'products', 'pricing', 'reviews', 'comparison', 'checkout'],
} as const;

/** Dashboard refresh intervals */
export const DASHBOARD_CONFIG = {
  EVENT_STREAM_MAX: 50,
  METRICS_REFRESH_MS: 2000,
  VECTOR_REFRESH_MS: 1000,
} as const;

/** Navigation items for the dashboard sidebar */
export const NAV_ITEMS = [
  { label: 'PeopleCloud', path: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'CORE AI', path: '/core-ai', icon: 'Brain' },
  { label: 'Identity', path: '/identity', icon: 'Fingerprint' },
  { label: 'Federated Learning', path: '/federated', icon: 'Network' },
  { label: 'Analytics', path: '/analytics', icon: 'BarChart3' },
  { label: 'Store Demo', path: '/', icon: 'ShoppingBag' },
] as const;
