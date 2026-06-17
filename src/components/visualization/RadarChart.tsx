/**
 * RadarChart — 8-axis radar visualization for intent archetype scores.
 * Uses Recharts with dark-theme styling and gradient fill.
 */

import {
  Radar,
  RadarChart as RechartsRadar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { motion } from 'framer-motion';

interface RadarChartProps {
  scores: { archetype: string; score: number }[];
  className?: string;
}

/** Custom dark-themed tooltip */
function RadarTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="glass-card p-3 text-xs">
      <p className="text-text-primary font-medium">{data.archetype}</p>
      <p className="text-accent-purple font-mono">
        {(data.score * 100).toFixed(1)}%
      </p>
    </div>
  );
}

export function IntentRadarChart({ scores, className = '' }: RadarChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={className}
    >
      <ResponsiveContainer width="100%" height={280}>
        <RechartsRadar data={scores} cx="50%" cy="50%" outerRadius="72%">
          <defs>
            <linearGradient id="radarFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#a855f7" stopOpacity={0.15} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="rgba(255,255,255,0.06)" />
          <PolarAngleAxis
            dataKey="archetype"
            tick={{ fill: '#8888a0', fontSize: 11 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 1]}
            tick={false}
            axisLine={false}
          />
          <Radar
            name="Intent"
            dataKey="score"
            stroke="#a855f7"
            strokeWidth={2}
            fill="url(#radarFill)"
            animationDuration={800}
          />
          <Tooltip content={<RadarTooltip />} />
        </RechartsRadar>
      </ResponsiveContainer>
    </motion.div>
  );
}
