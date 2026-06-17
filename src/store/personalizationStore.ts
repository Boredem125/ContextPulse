import { create } from 'zustand';
import type { IntentArchetype } from '@/lib/constants';

/**
 * Personalization strategies mapped to each intent archetype.
 * These drive the dynamic UI changes on the store page.
 */
interface PersonalizationAction {
  id: string;
  type: 'banner' | 'badge' | 'widget' | 'promotion' | 'reorder';
  title: string;
  description: string;
}

interface PersonalizationStrategy {
  archetype: IntentArchetype;
  heroTitle: string;
  heroSubtitle: string;
  heroCta: string;
  actions: PersonalizationAction[];
  productOrder?: string[]; // Product IDs to prioritize
  showBadge?: string;
}

const strategies: Record<IntentArchetype, PersonalizationStrategy> = {
  'Explorer': {
    archetype: 'Explorer',
    heroTitle: 'Discover What\'s Trending',
    heroSubtitle: 'Explore our curated collection of the latest tech innovations',
    heroCta: 'Browse All Categories',
    actions: [
      { id: 'e1', type: 'banner', title: 'Trending Now', description: 'Show trending products banner' },
      { id: 'e2', type: 'reorder', title: 'Discovery Mode', description: 'Prioritize diverse categories' },
      { id: 'e3', type: 'widget', title: 'Category Carousel', description: 'Show category exploration widget' },
    ],
  },
  'Comparator': {
    archetype: 'Comparator',
    heroTitle: 'Compare & Choose Confidently',
    heroSubtitle: 'Side-by-side comparisons to find your perfect match',
    heroCta: 'Open Comparison Tool',
    actions: [
      { id: 'c1', type: 'widget', title: 'Comparison Widget', description: 'Enable side-by-side product comparison' },
      { id: 'c2', type: 'badge', title: 'Feature Highlights', description: 'Highlight key differentiators on cards' },
      { id: 'c3', type: 'banner', title: 'vs. Overlays', description: 'Show \"vs\" comparison prompts' },
    ],
    productOrder: ['mbp-16-m4', 'dell-xps-16', 'iphone-16-pro', 'samsung-s25-ultra'],
  },
  'Deal Seeker': {
    archetype: 'Deal Seeker',
    heroTitle: '🔥 Flash Sale — Up to 40% Off',
    heroSubtitle: 'Limited-time deals on premium electronics. Don\'t miss out!',
    heroCta: 'Shop All Deals',
    actions: [
      { id: 'd1', type: 'promotion', title: 'Discount Badges', description: 'Show savings amount on all products' },
      { id: 'd2', type: 'banner', title: 'Coupon Banner', description: 'Display SAVE15 promo code banner' },
      { id: 'd3', type: 'badge', title: 'Price Drop Alerts', description: 'Highlight recently reduced prices' },
    ],
    productOrder: ['lg-oled-c4', 'dell-xps-16', 'dyson-zone-2', 'sony-wh1000xm6'],
    showBadge: 'sale',
  },
  'Researcher': {
    archetype: 'Researcher',
    heroTitle: 'Deep-Dive Into the Details',
    heroSubtitle: 'Expert reviews, detailed specs, and in-depth analysis',
    heroCta: 'Read Expert Reviews',
    actions: [
      { id: 'res1', type: 'widget', title: 'Expanded Reviews', description: 'Show full review excerpts on cards' },
      { id: 'res2', type: 'badge', title: 'Spec Sheets', description: 'Highlight detailed specifications' },
      { id: 'res3', type: 'banner', title: 'Expert Picks', description: 'Show editor choice badges' },
    ],
  },
  'Impulse Buyer': {
    archetype: 'Impulse Buyer',
    heroTitle: '⚡ Only 3 Left in Stock!',
    heroSubtitle: 'Free next-day delivery on orders placed in the next 2 hours',
    heroCta: 'Buy Now — Free Shipping',
    actions: [
      { id: 'i1', type: 'banner', title: 'Urgency Banner', description: 'Show countdown timer and stock alerts' },
      { id: 'i2', type: 'badge', title: 'Limited Stock', description: 'Display low stock warnings' },
      { id: 'i3', type: 'promotion', title: 'Quick Buy', description: 'Add one-click purchase buttons' },
    ],
    productOrder: ['ps5-pro', 'sony-wh1000xm6', 'bose-qc-earbuds3', 'apple-watch-ultra3'],
    showBadge: 'urgency',
  },
  'Gift Shopper': {
    archetype: 'Gift Shopper',
    heroTitle: '🎁 Perfect Gifts for Everyone',
    heroSubtitle: 'Curated gift guides with free gift wrapping on all orders',
    heroCta: 'Shop Gift Guides',
    actions: [
      { id: 'g1', type: 'banner', title: 'Gift Guide', description: 'Show curated gift collections' },
      { id: 'g2', type: 'badge', title: 'Gift Wrapping', description: 'Highlight free gift wrap option' },
      { id: 'g3', type: 'widget', title: 'Budget Filters', description: 'Show price range gift filters' },
    ],
  },
  'Returning Buyer': {
    archetype: 'Returning Buyer',
    heroTitle: 'Welcome Back! 👋',
    heroSubtitle: 'We\'ve picked up right where you left off. Check out what\'s new.',
    heroCta: 'See What\'s New',
    actions: [
      { id: 'rb1', type: 'widget', title: 'Recently Viewed', description: 'Show previously browsed products' },
      { id: 'rb2', type: 'banner', title: 'Welcome Back', description: 'Personalized greeting banner' },
      { id: 'rb3', type: 'promotion', title: 'Loyalty Offer', description: 'Exclusive 10% returning customer discount' },
    ],
  },
  'Passive Browser': {
    archetype: 'Passive Browser',
    heroTitle: 'The Future of Tech, Today',
    heroSubtitle: 'Premium electronics crafted for the extraordinary',
    heroCta: 'Explore Collection',
    actions: [
      { id: 'pb1', type: 'widget', title: 'Interactive Demo', description: 'Show engaging product showcases' },
      { id: 'pb2', type: 'banner', title: 'Video Content', description: 'Display product video highlights' },
      { id: 'pb3', type: 'badge', title: 'Social Proof', description: 'Show popular item indicators' },
    ],
  },
};

interface PersonalizationState {
  currentArchetype: IntentArchetype;
  confidence: number;
  strategy: PersonalizationStrategy;
  isPersonalized: boolean;
  transitionCount: number;
  setArchetype: (archetype: IntentArchetype, confidence: number) => void;
}

export const usePersonalizationStore = create<PersonalizationState>((set) => ({
  currentArchetype: 'Passive Browser',
  confidence: 0,
  strategy: strategies['Passive Browser'],
  isPersonalized: false,
  transitionCount: 0,
  setArchetype: (archetype, confidence) =>
    set((state) => ({
      currentArchetype: archetype,
      confidence,
      strategy: strategies[archetype],
      isPersonalized: true,
      transitionCount: state.transitionCount + 1,
    })),
}));

export { strategies };
export type { PersonalizationStrategy, PersonalizationAction };
