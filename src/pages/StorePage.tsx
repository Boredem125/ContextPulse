import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Star, ChevronRight, Shield, Truck, RotateCcw,
  ArrowRight, Zap, Timer, Eye, GitCompare, BadgePercent, Gift,
  LayoutDashboard, Sparkles, Activity, TrendingUp, Heart,
  Package, Check, Clock
} from 'lucide-react';
import { products, reviews } from '@/data/products';
import { usePersonalizationStore } from '@/store/personalizationStore';
import { cn } from '@/lib/utils';
import type { Product } from '@/data/products';

/* ─────────────── Floating Debug Panel ─────────────── */
function DebugPanel() {
  const { currentArchetype, confidence, isPersonalized, transitionCount } = usePersonalizationStore();
  const [signals, setSignals] = useState({ scrollDepth: 0, interactions: 0, dwellTime: 0 });

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => ({
        scrollDepth: Math.min(100, prev.scrollDepth + Math.random() * 2),
        interactions: prev.interactions + (Math.random() > 0.7 ? 1 : 0),
        dwellTime: prev.dwellTime + 1,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 1 }}
      className="hidden xl:block fixed right-4 top-1/2 -translate-y-1/2 z-50 w-72"
    >
      <div className="glass-card-premium p-4 space-y-4">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-accent-purple" />
          <span className="text-xs font-semibold text-text-primary uppercase tracking-wider">ContextPulse SDK</span>
          <div className="live-dot ml-auto" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-text-secondary">Scroll Depth</span>
            <span className="text-text-primary font-mono">{signals.scrollDepth.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-blue to-accent-purple rounded-full"
              animate={{ width: `${signals.scrollDepth}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-text-muted">Interactions</div>
            <div className="text-text-primary font-mono font-bold text-lg">{signals.interactions}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2">
            <div className="text-text-muted">Dwell Time</div>
            <div className="text-text-primary font-mono font-bold text-lg">{signals.dwellTime}s</div>
          </div>
        </div>

        {isPersonalized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-white/10 pt-3 space-y-2"
          >
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Detected Intent</span>
              <span className="text-accent-purple font-semibold">{currentArchetype}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Confidence</span>
              <span className="text-success font-mono">{(confidence * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">Transitions</span>
              <span className="text-text-primary font-mono">{transitionCount}</span>
            </div>
          </motion.div>
        )}

        <Link
          to="/dashboard"
          className="flex items-center gap-2 w-full text-xs text-accent-blue hover:text-accent-purple transition-colors"
        >
          <LayoutDashboard className="w-3 h-3" />
          Open Dashboard →
        </Link>
      </div>
    </motion.div>
  );
}

/* ─────────────── Intent Selector (Demo Control) ─────────────── */
function IntentSelector() {
  const { setArchetype, currentArchetype } = usePersonalizationStore();
  const intents = [
    { name: 'Explorer' as const, icon: Eye, color: '#6366f1' },
    { name: 'Comparator' as const, icon: GitCompare, color: '#8b5cf6' },
    { name: 'Deal Seeker' as const, icon: BadgePercent, color: '#f59e0b' },
    { name: 'Impulse Buyer' as const, icon: Zap, color: '#ef4444' },
    { name: 'Gift Shopper' as const, icon: Gift, color: '#ec4899' },
  ];

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
    >
      <div className="glass-card-premium px-4 py-3 flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide pointer-events-auto max-w-full">
        <Sparkles className="w-4 h-4 text-accent-purple" />
        <span className="text-xs text-text-secondary whitespace-nowrap">Simulate Intent:</span>
        <div className="flex gap-1.5">
          {intents.map((intent) => (
            <button
              key={intent.name}
              onClick={() => setArchetype(intent.name, 0.82 + Math.random() * 0.15)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                currentArchetype === intent.name
                  ? "bg-white/15 text-white border border-white/20"
                  : "bg-white/5 text-text-secondary hover:bg-white/10 hover:text-text-primary"
              )}
            >
              <intent.icon className="w-3 h-3" />
              {intent.name}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────── Hero Section ─────────────── */
function HeroSection() {
  const { strategy, isPersonalized, confidence } = usePersonalizationStore();

  return (
    <section id="hero" data-track="section" className="relative min-h-[80vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-accent-blue/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-accent-purple/15 rounded-full blur-[120px] animate-pulse-slow" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl">
          {isPersonalized && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent-purple/20 border border-accent-purple/30 text-accent-purple text-xs font-medium mb-6"
            >
              <Sparkles className="w-3 h-3" />
              Personalized for you • {(confidence * 100).toFixed(0)}% confidence
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            <motion.h1
              key={strategy.heroTitle}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="text-5xl md:text-7xl font-bold leading-tight mb-6"
            >
              <span className="gradient-text">{strategy.heroTitle}</span>
            </motion.h1>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.p
              key={strategy.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-xl text-text-secondary mb-8 max-w-xl"
            >
              {strategy.heroSubtitle}
            </motion.p>
          </AnimatePresence>

          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-glow flex items-center gap-2 text-lg"
              data-track="cta"
            >
              {strategy.heroCta}
              <ArrowRight className="w-5 h-5" />
            </motion.button>
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-text-secondary hover:text-white hover:border-white/20 transition-all"
            >
              <LayoutDashboard className="w-5 h-5" />
              View Dashboard
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-8 mt-12 text-text-muted text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Privacy-First</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Free Shipping</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              <span>30-Day Returns</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Product Card ─────────────── */
function ProductCard({ product, index }: { product: Product; index: number }) {
  const { currentArchetype } = usePersonalizationStore();
  const [isHovered, setIsHovered] = useState(false);

  const showDiscount = (currentArchetype === 'Deal Seeker' || currentArchetype === 'Impulse Buyer') && product.originalPrice;
  const savings = product.originalPrice ? product.originalPrice - product.price : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group glass-card overflow-hidden cursor-pointer"
      data-track="product"
      data-product-id={product.id}
    >
      {/* Badge */}
      {product.badge && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-accent-purple/90 text-white">
            {product.badge}
          </span>
        </div>
      )}

      {/* Urgency Badge (Impulse Buyer) */}
      {currentArchetype === 'Impulse Buyer' && product.stockCount && product.stockCount < 15 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute top-3 right-3 z-10"
        >
          <span className="px-2 py-1 rounded-md text-xs font-semibold bg-error/90 text-white flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Only {product.stockCount} left!
          </span>
        </motion.div>
      )}

      {/* Product Image Area */}
      <div className="relative h-48 flex items-center justify-center bg-gradient-to-br from-white/[0.02] to-white/[0.05] overflow-hidden">
        <motion.span
          className="text-6xl"
          animate={isHovered ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          {product.image}
        </motion.span>

        {/* Quick Actions on Hover */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-3 left-3 right-3 flex gap-2"
            >
              <button className="flex-1 bg-accent-blue/90 hover:bg-accent-blue text-white text-xs font-medium py-2 rounded-lg flex items-center justify-center gap-1 transition-colors" data-track="cta">
                <ShoppingCart className="w-3 h-3" />
                Add to Cart
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors" data-track="compare">
                <GitCompare className="w-3 h-3" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg transition-colors">
                <Heart className="w-3 h-3" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-accent-blue font-medium">{product.brand}</span>
          <span className="text-xs text-text-muted">{product.category}</span>
        </div>

        <h3 className="font-semibold text-sm text-text-primary line-clamp-1 group-hover:text-white transition-colors">
          {product.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn("w-3 h-3", i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-text-muted")}
              />
            ))}
          </div>
          <span className="text-xs text-text-secondary">{product.rating}</span>
          <span className="text-xs text-text-muted">({product.reviewCount.toLocaleString()})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 pt-1">
          <span className="text-lg font-bold text-text-primary">${product.price.toLocaleString()}</span>
          {showDiscount && product.originalPrice && (
            <>
              <span className="text-sm text-text-muted line-through">${product.originalPrice.toLocaleString()}</span>
              <span className="text-xs text-success font-medium">Save ${savings}</span>
            </>
          )}
        </div>

        {/* Deal Seeker: Coupon */}
        {currentArchetype === 'Deal Seeker' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2"
          >
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-warning/10 border border-warning/20 text-xs">
              <BadgePercent className="w-3 h-3 text-warning" />
              <span className="text-warning font-medium">Use code SAVE15 for extra 15% off</span>
            </div>
          </motion.div>
        )}

        {/* Gift Shopper: Gift wrap */}
        {currentArchetype === 'Gift Shopper' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2"
          >
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-accent-pink/10 border border-accent-pink/20 text-xs">
              <Gift className="w-3 h-3 text-accent-pink" />
              <span className="text-accent-pink font-medium">Free gift wrapping available</span>
            </div>
          </motion.div>
        )}

        {/* Researcher: specs preview */}
        {currentArchetype === 'Researcher' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-2 space-y-1"
          >
            {Object.entries(product.specs).slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex justify-between text-xs">
                <span className="text-text-muted">{key}</span>
                <span className="text-text-secondary font-mono">{value}</span>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

/* ─────────────── Product Grid ─────────────── */
function ProductGrid() {
  const { strategy, currentArchetype } = usePersonalizationStore();

  let displayProducts = [...products];
  if (strategy.productOrder) {
    displayProducts.sort((a, b) => {
      const aIdx = strategy.productOrder!.indexOf(a.id);
      const bIdx = strategy.productOrder!.indexOf(b.id);
      if (aIdx === -1 && bIdx === -1) return 0;
      if (aIdx === -1) return 1;
      if (bIdx === -1) return -1;
      return aIdx - bIdx;
    });
  }

  return (
    <section id="products" data-track="section" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">
              {currentArchetype === 'Deal Seeker' ? '🔥 Today\'s Best Deals' :
               currentArchetype === 'Gift Shopper' ? '🎁 Gift-Worthy Picks' :
               currentArchetype === 'Comparator' ? '📊 Top Compared Products' :
               'Featured Products'}
            </h2>
            <p className="text-text-secondary">
              {currentArchetype === 'Deal Seeker' ? 'Exclusive savings on premium electronics' :
               currentArchetype === 'Researcher' ? 'Click any product for detailed specifications' :
               'Discover our curated selection of premium electronics'}
            </p>
          </div>
          <button className="flex items-center gap-2 text-accent-blue hover:text-accent-purple text-sm transition-colors">
            View All <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {displayProducts.map((product, index) => (
            <ProductCard key={product.id} product={product} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Personalized Banner ─────────────── */
function PersonalizedBanner() {
  const { currentArchetype, isPersonalized } = usePersonalizationStore();
  if (!isPersonalized) return null;

  const banners: Partial<Record<string, { bg: string; icon: React.ReactNode; text: string; cta: string }>> = {
    'Deal Seeker': {
      bg: 'from-amber-500/20 to-orange-500/20 border-amber-500/30',
      icon: <BadgePercent className="w-6 h-6 text-amber-400" />,
      text: '💰 FLASH SALE: Use code PULSE15 for an extra 15% off your entire order!',
      cta: 'Apply Code',
    },
    'Impulse Buyer': {
      bg: 'from-red-500/20 to-rose-500/20 border-red-500/30',
      icon: <Timer className="w-6 h-6 text-red-400" />,
      text: '⏰ HURRY! This offer expires in 1:47:23 — Free next-day delivery included!',
      cta: 'Shop Now',
    },
    'Comparator': {
      bg: 'from-violet-500/20 to-purple-500/20 border-violet-500/30',
      icon: <GitCompare className="w-6 h-6 text-violet-400" />,
      text: '📊 Compare up to 4 products side-by-side. Find your perfect match instantly.',
      cta: 'Open Comparison',
    },
    'Gift Shopper': {
      bg: 'from-pink-500/20 to-rose-500/20 border-pink-500/30',
      icon: <Gift className="w-6 h-6 text-pink-400" />,
      text: '🎁 Free premium gift wrapping on all orders + personalized gift message!',
      cta: 'Gift Guide',
    },
  };

  const banner = banners[currentArchetype];
  if (!banner) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="px-6"
    >
      <div className={cn("container mx-auto rounded-2xl bg-gradient-to-r border p-5 flex items-center gap-4", banner.bg)}>
        {banner.icon}
        <p className="text-text-primary font-medium flex-1">{banner.text}</p>
        <button className="btn-glow text-sm whitespace-nowrap" data-track="cta">{banner.cta}</button>
      </div>
    </motion.div>
  );
}

/* ─────────────── Comparison Section ─────────────── */
function ComparisonSection() {
  const compareProducts = products.slice(0, 3);

  return (
    <section id="comparison" data-track="section" className="py-20 px-6">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-text-primary mb-2">Compare Products</h2>
        <p className="text-text-secondary mb-10">Side-by-side specifications to help you decide</p>

        <div className="glass-card overflow-hidden" data-track="compare">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="p-4 text-left text-text-muted text-sm font-medium w-40">Feature</th>
                  {compareProducts.map((p) => (
                    <th key={p.id} className="p-4 text-center">
                      <div className="text-3xl mb-2">{p.image}</div>
                      <div className="text-sm font-semibold text-text-primary">{p.name}</div>
                      <div className="text-lg font-bold text-accent-blue mt-1">${p.price.toLocaleString()}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.keys(compareProducts[0].specs).map((specKey) => (
                  <tr key={specKey} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 text-sm text-text-secondary font-medium">{specKey}</td>
                    {compareProducts.map((p) => (
                      <td key={p.id} className="p-4 text-center text-sm text-text-primary font-mono">
                        {p.specs[specKey] || '—'}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="p-4 text-sm text-text-secondary font-medium">Rating</td>
                  {compareProducts.map((p) => (
                    <td key={p.id} className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-text-primary font-semibold">{p.rating}</span>
                        <span className="text-text-muted text-xs">({p.reviewCount.toLocaleString()})</span>
                      </div>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Reviews Section ─────────────── */
function ReviewsSection() {
  return (
    <section id="reviews" data-track="section" className="py-20 px-6 bg-bg-1/50">
      <div className="container mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-text-primary mb-2">Customer Reviews</h2>
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-text-primary font-semibold">4.7 out of 5</span>
              <span className="text-text-muted">(47,486 reviews)</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="glass-card p-6"
              data-track="review"
            >
              <div className="flex items-start gap-4">
                <span className="text-2xl">{review.avatar}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-text-primary">{review.author}</span>
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs text-success">
                        <Check className="w-3 h-3" /> Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={cn("w-3 h-3", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-text-muted")} />
                      ))}
                    </div>
                    <span className="text-xs text-text-muted">{review.date}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-text-primary mb-2">{review.title}</h4>
                  <p className="text-sm text-text-secondary leading-relaxed">{review.body}</p>
                  <div className="flex items-center gap-4 mt-4 text-xs text-text-muted">
                    <button className="hover:text-text-primary transition-colors flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Helpful ({review.helpful})
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Pricing Section ─────────────── */
function PricingSection() {
  const tiers = [
    { name: 'Starter', price: 0, period: 'Free forever', features: ['1 Site', '1K sessions/mo', 'Basic intent detection', 'Standard dashboard'], cta: 'Get Started', popular: false },
    { name: 'Professional', price: 299, period: '/month', features: ['10 Sites', '100K sessions/mo', 'Advanced 64-dim vectors', 'CORE AI Engine', 'Identity resolution', 'Priority support'], cta: 'Start Free Trial', popular: true },
    { name: 'Enterprise', price: null, period: 'Custom', features: ['Unlimited sites', 'Unlimited sessions', 'Federated learning', 'PeopleCloud integration', 'CORE AI full suite', 'Dedicated CSM', 'SLA guarantee'], cta: 'Contact Sales', popular: false },
  ];

  return (
    <section id="pricing" data-track="section" className="py-20 px-6">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-2">Simple, Transparent Pricing</h2>
          <p className="text-text-secondary">Start free. Scale as you grow.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className={cn(
                "relative rounded-2xl p-8",
                tier.popular
                  ? "glass-card-premium bg-gradient-to-b from-accent-blue/10 to-accent-purple/10"
                  : "glass-card"
              )}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full text-xs font-bold bg-gradient-accent text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-xl font-bold text-text-primary mb-2">{tier.name}</h3>
              <div className="mb-6">
                {tier.price !== null ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold gradient-text">${tier.price}</span>
                    <span className="text-text-muted">{tier.period}</span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold gradient-text">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-text-secondary">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-sm transition-all",
                  tier.popular ? "btn-glow" : "border border-white/10 text-text-primary hover:bg-white/5"
                )}
                data-track="cta"
              >
                {tier.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────── Checkout CTA ─────────────── */
function CheckoutCTA() {
  const { currentArchetype } = usePersonalizationStore();

  return (
    <section id="checkout" data-track="section" className="py-20 px-6">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card-premium p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-mesh opacity-50" />
          <div className="relative z-10">
            <Package className="w-12 h-12 text-accent-purple mx-auto mb-6" />
            <h2 className="text-4xl font-bold gradient-text mb-4">
              {currentArchetype === 'Impulse Buyer' ? 'Don\'t Wait — Order Now!' :
               currentArchetype === 'Deal Seeker' ? 'Grab These Deals Before They\'re Gone' :
               'Ready to Experience the Future?'}
            </h2>
            <p className="text-text-secondary text-lg mb-8 max-w-xl mx-auto">
              Join 50,000+ customers who trust us for their premium electronics needs.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="btn-glow text-lg flex items-center gap-2" data-track="cta">
                <ShoppingCart className="w-5 h-5" />
                Start Shopping
              </button>
              <div className="flex items-center gap-2 text-text-muted text-sm">
                <Clock className="w-4 h-4" />
                <span>Free next-day delivery</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─────────────── Store Page (Main) ─────────────── */
export function StorePage() {
  return (
    <div className="min-h-screen bg-bg-0">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-bg-0/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg gradient-text">ContextPulse</span>
            <span className="text-text-muted text-sm">× TechStore</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-text-secondary">
            <a href="#products" className="hover:text-white transition-colors">Products</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#reviews" className="hover:text-white transition-colors">Reviews</a>
            <a href="#comparison" className="hover:text-white transition-colors">Compare</a>
            <Link to="/dashboard" className="flex items-center gap-1 text-accent-blue hover:text-accent-purple transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </Link>
          </nav>
          <button className="flex items-center gap-2 btn-glow text-sm py-2">
            <ShoppingCart className="w-4 h-4" />
            Cart (0)
          </button>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Page Sections */}
      <HeroSection />
      <AnimatePresence>
        <PersonalizedBanner />
      </AnimatePresence>
      <ProductGrid />
      <ComparisonSection />
      <ReviewsSection />
      <PricingSection />
      <CheckoutCTA />

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="container mx-auto flex items-center justify-between text-sm text-text-muted">
          <span>© 2026 ContextPulse Demo — Privacy-First Behavioral Intelligence</span>
          <span>Powered by Epsilon PeopleCloud</span>
        </div>
      </footer>

      {/* Floating Panels */}
      <DebugPanel />
      <IntentSelector />
    </div>
  );
}
