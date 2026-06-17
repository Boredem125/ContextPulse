/**
 * MetricsOverview — Row of 4 KPI cards with animated counters,
 * sparkline trends, and delta indicators.
 */

import { motion } from 'framer-motion';
import {
  Users,
  Target,
  Sparkles,
  Brain,
  TrendingUp,
} from 'lucide-react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import { AnimatedNumber } from '@/components/visualization/AnimatedNumber';
import { useDashboardStore } from '@/store/dashboardStore';

/** Tiny sparkline data — 7 data points simulating a week of upward trends */
const sparklines: Record<string, { v: number }[]> = {
  sessions:       [{ v: 980 }, { v: 1040 }, { v: 1100 }, { v: 1080 }, { v: 1150 }, { v: 1200 }, { v: 1247 }],
  confidence:     [{ v: 82 }, { v: 83 }, { v: 84 }, { v: 85.5 }, { v: 86 }, { v: 87 }, { v: 87.3 }],
  personalization:[{ v: 88 }, { v: 89 }, { v: 90 }, { v: 91 }, { v: 92 }, { v: 93 }, { v: 94.1 }],
  accuracy:       [{ v: 85 }, { v: 86 }, { v: 87 }, { v: 88 }, { v: 89 }, { v: 90 }, { v: 91.2 }],
};

const cards = [
  { key: 'sessions',        label: 'Active Sessions',      icon: Users,    suffix: '',  decimals: 0, delta: '+12.3%', color: '#6366f1' },
  { key: 'confidence',      label: 'Avg Confidence',        icon: Target,   suffix: '%', decimals: 1, delta: '+4.2%',  color: '#a855f7' },
  { key: 'personalization', label: 'Personalization Rate',  icon: Sparkles, suffix: '%', decimals: 1, delta: '+6.1%',  color: '#22d3ee' },
  { key: 'accuracy',        label: 'Intent Accuracy',       icon: Brain,    suffix: '%', decimals: 1, delta: '+3.8%',  color: '#ec4899' },
] as const;

/** Map card keys to metric values from the store */
function useMetricValue(key: string): number {
  const m = useDashboardStore((s) => s.metrics);
  switch (key) {
    case 'sessions':        return m.activeSessions;
    case 'confidence':      return m.avgConfidence;
    case 'personalization': return m.personalizationRate;
    case 'accuracy':        return m.intentAccuracy;
    default:                return 0;
  }
}

function KPICard({
  card,
  index,
}: {
  card: (typeof cards)[number];
  index: number;
}) {
  const value = useMetricValue(card.key);
  const Icon = card.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="glass-card p-5 flex flex-col gap-3 relative overflow-hidden"
    >
      {/* Gradient top border accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }}
      />

      <div className="flex items-center justify-between">
        <span className="text-text-secondary text-xs font-medium uppercase tracking-wider">
          {card.label}
        </span>
        <Icon size={18} className="text-text-muted" />
      </div>

      <div className="flex items-end justify-between">
        <AnimatedNumber
          value={value}
          decimals={card.decimals}
          suffix={card.suffix}
          className="text-3xl font-bold text-text-primary font-mono"
        />
        {/* Sparkline */}
        <div className="w-20 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparklines[card.key]}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={card.color}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex items-center gap-1 text-success text-xs font-medium">
        <TrendingUp size={14} />
        <span>{card.delta} vs last week</span>
      </div>
    </motion.div>
  );
}

export function MetricsOverview() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KPICard key={card.key} card={card} index={i} />
      ))}
    </div>
  );
}
