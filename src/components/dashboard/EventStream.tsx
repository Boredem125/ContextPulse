/**
 * EventStream — Scrollable live feed of behavioral events with
 * type-based icons, descriptions, and relative timestamps.
 * Auto-scrolls to top when new events arrive.
 */

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownUp,
  MousePointer2,
  MousePointerClick,
  Eye,
  GitCompare,
  Zap,
  Star,
  ShoppingCart,
  Radio,
} from 'lucide-react';
import { useDashboardStore, type EventType } from '@/store/dashboardStore';
import { timeAgo } from '@/lib/utils';

/** Icon + accent color per event type */
const EVENT_CONFIG: Record<EventType, { icon: React.ElementType; color: string }> = {
  scroll:  { icon: ArrowDownUp,       color: '#6366f1' },
  hover:   { icon: MousePointer2,     color: '#8b5cf6' },
  click:   { icon: MousePointerClick, color: '#22d3ee' },
  view:    { icon: Eye,               color: '#3b82f6' },
  compare: { icon: GitCompare,        color: '#a855f7' },
  cta:     { icon: Zap,               color: '#f59e0b' },
  review:  { icon: Star,              color: '#ec4899' },
  cart:    { icon: ShoppingCart,       color: '#34d399' },
};

export function EventStream() {
  const events = useDashboardStore((s) => s.events);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top when the event list changes
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = 0;
    }
  }, [events.length]);

  const displayed = events.slice(0, 30);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio size={16} className="text-accent-blue" />
          <h3 className="text-sm font-semibold text-text-primary">
            Live Behavioral Events
          </h3>
        </div>
        <span className="text-xs text-text-muted">{events.length} total</span>
      </div>

      <div
        ref={listRef}
        className="space-y-1 max-h-[380px] overflow-y-auto pr-1"
      >
        <AnimatePresence initial={false}>
          {displayed.map((event) => {
            const cfg = EVENT_CONFIG[event.type];
            const Icon = cfg.icon;
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25 }}
                className="event-item"
                style={{ borderLeftColor: cfg.color }}
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cfg.color}22` }}
                >
                  <Icon size={14} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-text-primary truncate">
                    {event.description}
                  </p>
                  <p className="text-[10px] text-text-muted">
                    {timeAgo(event.timestamp)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
