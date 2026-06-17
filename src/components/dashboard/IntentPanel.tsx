/**
 * IntentPanel — Primary intent display with animated SVG confidence ring,
 * archetype name, and horizontal score bars for all 8 intents.
 */

import { motion } from 'framer-motion';
import { useDashboardStore } from '@/store/dashboardStore';
import { INTENT_COLORS, type IntentArchetype } from '@/lib/constants';

/** SVG animated confidence ring */
function ConfidenceRing({ confidence }: { confidence: number }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const filled = circumference * confidence;

  return (
    <div className="relative w-36 h-36 mx-auto">
      <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
        {/* Background ring */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="8"
        />
        {/* Animated value ring */}
        <motion.circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="url(#ringGradient)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - filled }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        />
        <defs>
          <linearGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
      </svg>
      {/* Centered label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-text-primary font-mono">
          {Math.round(confidence * 100)}%
        </span>
        <span className="text-[10px] text-text-muted uppercase tracking-wider">
          Confidence
        </span>
      </div>
    </div>
  );
}

/** Horizontal bar for a single archetype score */
function ScoreBar({
  archetype,
  score,
  isPrimary,
}: {
  archetype: IntentArchetype;
  score: number;
  isPrimary: boolean;
}) {
  const color = INTENT_COLORS[archetype];
  return (
    <div className="flex items-center gap-3">
      <span
        className={`text-xs w-28 truncate ${isPrimary ? 'text-text-primary font-semibold' : 'text-text-secondary'}`}
      >
        {archetype}
      </span>
      <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${score * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
      <span className="text-xs font-mono text-text-muted w-10 text-right">
        {(score * 100).toFixed(0)}%
      </span>
    </div>
  );
}

export function IntentPanel() {
  const { primaryIntent, confidence, scores } = useDashboardStore(
    (s) => s.currentIntent,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="glass-card p-6 flex flex-col gap-5"
    >
      <h3 className="text-sm font-semibold text-text-primary">
        Detected Intent
      </h3>

      {/* Confidence ring */}
      <ConfidenceRing confidence={confidence} />

      {/* Primary intent label */}
      <p className="text-center text-xl font-bold gradient-text">
        {primaryIntent}
      </p>

      {/* Score bars */}
      <div className="space-y-2 mt-2">
        {scores
          .slice()
          .sort((a, b) => b.score - a.score)
          .map((s) => (
            <ScoreBar
              key={s.archetype}
              archetype={s.archetype}
              score={s.score}
              isPrimary={s.archetype === primaryIntent}
            />
          ))}
      </div>
    </motion.div>
  );
}
