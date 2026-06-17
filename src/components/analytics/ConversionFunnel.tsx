import { motion } from 'framer-motion';
import { Eye, MousePointer, Cpu, ShoppingBag } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

interface FunnelStageProps {
  label: string;
  count: number;
  rate?: string;
  percent: number; // 0-100 for width
  gradient: string;
  icon: React.ReactNode;
  delay: number;
}

function FunnelStage({ label, count, rate, percent, gradient, icon, delay }: FunnelStageProps) {
  return (
    <div className="space-y-2 relative">
      <div className="flex justify-between items-baseline text-xs font-semibold">
        <div className="flex items-center gap-2 text-slate-300">
          <div className="text-muted">{icon}</div>
          <span>{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-sm text-slate-200">{formatNumber(count)}</span>
          {rate && (
            <span className="text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded font-mono text-indigo-400">
              {rate}
            </span>
          )}
        </div>
      </div>

      <div className="w-full bg-white/5 h-8 rounded-xl overflow-hidden border border-white/5 relative flex items-center px-4">
        {/* Animated Fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1.2, delay, ease: 'easeOut' }}
          className={`absolute left-0 top-0 h-full rounded-xl bg-gradient-to-r ${gradient}`}
        />

        {/* Floating Percentage Indicator */}
        <span className="z-10 text-[10px] font-extrabold text-white font-mono ml-auto">
          {percent}%
        </span>
      </div>
    </div>
  );
}

export function ConversionFunnel() {
  return (
    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-primary">Personalization Funnel Efficiency</h3>
        <p className="text-xs text-muted">Conversion rates across visitor engagement levels using ContextPulse</p>
      </div>

      <div className="space-y-5">
        <FunnelStage
          label="1. Total Traffic (Anonymous)"
          count={45230}
          percent={100}
          gradient="from-blue-600 to-blue-500"
          icon={<Eye className="w-4 h-4" />}
          delay={0.1}
        />

        <FunnelStage
          label="2. Tracked Engagement"
          count={28140}
          rate="62.2% of traffic"
          percent={62.2}
          gradient="from-indigo-600 to-indigo-500"
          icon={<MousePointer className="w-4 h-4" />}
          delay={0.25}
        />

        <FunnelStage
          label="3. Personalized State"
          count={22510}
          rate="80.0% of engaged"
          percent={49.7}
          gradient="from-purple-600 to-purple-500"
          icon={<Cpu className="w-4 h-4" />}
          delay={0.4}
        />

        <FunnelStage
          label="4. Completed Conversions"
          count={8104}
          rate="36.0% of personalized"
          percent={17.9}
          gradient="from-pink-600 to-pink-500"
          icon={<ShoppingBag className="w-4 h-4" />}
          delay={0.55}
        />
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-xl flex items-center justify-between mt-6 text-xs font-semibold">
        <span>Combined Checkout Conversion Rate:</span>
        <span className="font-mono text-sm font-bold bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded">
          17.92% (Baseline: 11.2%)
        </span>
      </div>
    </div>
  );
}
export default ConversionFunnel;
