import { motion } from 'framer-motion';
import { TrendingUp, ArrowUpRight, Timer } from 'lucide-react';
import { AnimatedNumber } from '@/components/visualization/AnimatedNumber';

interface UpliftCardProps {
  title: string;
  value: number;
  suffix: string;
  prefix?: string;
  baseline: string;
  optimized: string;
  ratio: number; // 0-1 for progress comparison bar
  description: string;
  icon: React.ReactNode;
  colorClass: string;
  borderGradient: string;
}

function UpliftCard({
  title,
  value,
  suffix,
  prefix = '',
  baseline,
  optimized,
  ratio,
  description,
  icon,
  colorClass,
  borderGradient,
}: UpliftCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between`}
    >
      <div className={`absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r ${borderGradient}`} />
      
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="text-sm font-semibold text-muted">{title}</span>
          <div className={`p-2 rounded-lg ${colorClass} bg-opacity-10`}>
            {icon}
          </div>
        </div>

        <div className="flex items-baseline gap-1.5 mb-3">
          <span className={`text-3xl font-extrabold font-mono ${colorClass}`}>
            {prefix}
            <AnimatedNumber value={value} suffix={suffix} />
          </span>
        </div>

        <p className="text-xs text-secondary leading-relaxed mb-6">{description}</p>
      </div>

      <div className="space-y-2.5">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400">
          <span>Baseline: <span className="text-slate-500">{baseline}</span></span>
          <span className="text-right">ContextPulse: <span className={colorClass}>{optimized}</span></span>
        </div>
        
        {/* Comparison Bar */}
        <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5 relative">
          <div className="absolute left-0 top-0 h-full bg-slate-600 rounded-full" style={{ width: '40%' }} />
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${ratio * 100}%` }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className={`absolute left-0 top-0 h-full rounded-full bg-gradient-to-r ${borderGradient}`}
          />
        </div>
      </div>
    </motion.div>
  );
}

export function UpliftMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <UpliftCard
        title="CTR Uplift"
        value={22.4}
        suffix="%"
        prefix="+"
        baseline="4.2% CTR"
        optimized="5.1% CTR"
        ratio={0.78}
        description="Anonymous visitor click-through rates on dynamically personalized recommendations."
        icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
        colorClass="text-emerald-400"
        borderGradient="from-emerald-500 to-teal-400"
      />

      <UpliftCard
        title="Conversion Uplift"
        value={18.7}
        suffix="%"
        prefix="+"
        baseline="2.14% CR"
        optimized="2.54% CR"
        ratio={0.82}
        description="Direct conversion rate uplift from zero-state intent inference vs. standard view."
        icon={<ArrowUpRight className="w-5 h-5 text-purple-400" />}
        colorClass="text-purple-400"
        borderGradient="from-indigo-500 to-purple-500"
      />

      <UpliftCard
        title="Cold Start Delay"
        value={65.3}
        suffix="%"
        prefix="-"
        baseline="4.8s delay"
        optimized="1.6s delay"
        ratio={0.35}
        description="Reduction in time-to-first-personalization action after page load."
        icon={<Timer className="w-5 h-5 text-blue-400" />}
        colorClass="text-blue-400"
        borderGradient="from-blue-500 to-cyan-400"
      />
    </div>
  );
}
export default UpliftMetrics;
