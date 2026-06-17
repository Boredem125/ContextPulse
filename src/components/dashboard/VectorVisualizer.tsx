/**
 * VectorVisualizer — 64-dimensional intent vector rendered as an 8×8 heatmap.
 * Wraps the reusable HeatmapGrid component with card chrome and labels.
 */

import { motion } from 'framer-motion';
import { Grid3x3 } from 'lucide-react';
import { HeatmapGrid } from '@/components/visualization/HeatmapGrid';
import { useDashboardStore } from '@/store/dashboardStore';

export function VectorVisualizer() {
  const intentVector = useDashboardStore((s) => s.intentVector);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <Grid3x3 size={16} className="text-accent-purple" />
        <h3 className="text-sm font-semibold text-text-primary">
          Intent Vector (64-dim)
        </h3>
      </div>

      <p className="text-xs text-text-muted leading-relaxed">
        Real-time feature representation across 8 behavioral signal groups.
        Brighter cells indicate stronger activation.
      </p>

      <HeatmapGrid vector={intentVector} cellSize={32} />
    </motion.div>
  );
}
