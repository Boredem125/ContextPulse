/**
 * HeatmapGrid — 8×8 grid rendering of a 64-dimensional vector.
 *
 * Color interpolation goes from deep indigo (0) → purple (0.5) → magenta (1).
 * Hover reveals dimension index + raw value in a floating tooltip.
 */

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { interpolateColor } from '@/lib/utils';

/** Human-readable group labels for the 8 dimension groups */
const DIMENSION_GROUPS = [
  'Intent Scores',
  'Scroll',
  'Mouse',
  'Engagement',
  'Context',
  'Temporal',
  'Correlations',
  'Meta',
];

interface HeatmapGridProps {
  vector: number[];
  className?: string;
  showLabels?: boolean;
  cellSize?: number;
}

export function HeatmapGrid({
  vector,
  className = '',
  showLabels = true,
  cellSize = 36,
}: HeatmapGridProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const handleMouseEnter = useCallback(
    (idx: number, e: React.MouseEvent<HTMLDivElement>) => {
      setHovered(idx);
      const rect = e.currentTarget.getBoundingClientRect();
      setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 8 });
    },
    [],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {/* Grid */}
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(8, ${cellSize}px)` }}
      >
        {vector.slice(0, 64).map((val, idx) => (
          <div
            key={idx}
            className="heatmap-cell cursor-pointer relative"
            style={{
              width: cellSize,
              height: cellSize,
              backgroundColor: interpolateColor(val),
              borderRadius: 4,
              border: '1px solid rgba(255,255,255,0.06)',
            }}
            onMouseEnter={(e) => handleMouseEnter(idx, e)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      {/* Tooltip */}
      {hovered !== null && (
        <div
          className="fixed z-50 glass-card px-3 py-2 text-xs pointer-events-none -translate-x-1/2 -translate-y-full"
          style={{ left: tooltipPos.x, top: tooltipPos.y }}
        >
          <span className="text-text-secondary">
            dim[{hovered}] — {DIMENSION_GROUPS[Math.floor(hovered / 8)]}
          </span>
          <br />
          <span className="text-text-primary font-mono font-semibold">
            {vector[hovered]?.toFixed(3)}
          </span>
        </div>
      )}

      {/* Dimension group labels */}
      {showLabels && (
        <div className="grid grid-cols-8 gap-[3px] mt-2">
          {DIMENSION_GROUPS.map((label) => (
            <span
              key={label}
              className="text-[9px] text-text-muted text-center truncate"
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}
