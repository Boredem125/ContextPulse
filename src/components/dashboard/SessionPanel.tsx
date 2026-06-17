/**
 * SessionPanel — Active session card showing visitor details,
 * device info, location, session duration timer, and activity counters.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Monitor,
  Globe,
  Clock,
  MousePointerClick,
  FileText,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

/** Live duration counter that ticks every second */
function useDuration(startTime: Date): string {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    const tick = () => {
      const s = Math.floor((Date.now() - startTime.getTime()) / 1000);
      const m = Math.floor(s / 60);
      const sec = s % 60;
      setElapsed(`${m}m ${sec.toString().padStart(2, '0')}s`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startTime]);
  return elapsed;
}

export function SessionPanel() {
  const session = useDashboardStore((s) => s.sessionData);
  const duration = useDuration(session.startTime);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-6 flex flex-col gap-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Active Session
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="live-dot" />
          <span className="text-success text-xs">Live</span>
        </div>
      </div>

      {/* Anonymous avatar */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center shrink-0">
          <span className="text-white text-xl font-bold">??</span>
        </div>
        <div>
          <p className="text-text-primary font-medium text-sm">
            Anonymous Visitor
          </p>
          <p className="text-text-muted text-xs font-mono">{session.id}</p>
        </div>
      </div>

      {/* Details grid */}
      <div className="grid grid-cols-2 gap-3 text-sm">
        <InfoRow icon={Monitor} label="Device" value={`${session.browser} / ${session.os}`} />
        <InfoRow icon={Globe} label="Location" value={session.location} />
        <InfoRow icon={Clock} label="Duration" value={duration} />
        <InfoRow icon={FileText} label="Current Page" value={session.currentPage} />
        <InfoRow icon={FileText} label="Pages Viewed" value={String(session.pagesViewed)} />
        <InfoRow icon={MousePointerClick} label="Interactions" value={String(session.interactions)} />
      </div>
    </motion.div>
  );
}

function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon size={14} className="text-text-muted shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-text-muted uppercase tracking-wider">{label}</p>
        <p className="text-text-primary text-xs font-medium truncate">{value}</p>
      </div>
    </div>
  );
}
