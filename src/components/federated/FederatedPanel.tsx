import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Server, ShieldCheck, ArrowRight, TrendingUp, Info } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface RoundData {
  round: number;
  accuracy: number;
}

const mockTimelineData: RoundData[] = [
  { round: 5, accuracy: 0.71 },
  { round: 10, accuracy: 0.74 },
  { round: 15, accuracy: 0.77 },
  { round: 20, accuracy: 0.79 },
  { round: 25, accuracy: 0.81 },
  { round: 30, accuracy: 0.82 },
  { round: 35, accuracy: 0.84 },
  { round: 40, accuracy: 0.85 },
  { round: 45, accuracy: 0.86 },
];

export function FederatedPanel() {
  const [round, setRound] = useState(47);
  const [globalAccuracy, setGlobalAccuracy] = useState(86.2);
  const [isAggregating, setIsAggregating] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsAggregating(true);
      setTimeout(() => {
        setIsAggregating(false);
        setRound((prev) => (prev >= 100 ? 1 : prev + 1));
        setGlobalAccuracy((prev) => {
          if (prev >= 95) return 81.0;
          return +(prev + 0.1).toFixed(1);
        });
      }, 1500);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Three Stage Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative items-stretch">
        {/* Stage 1: Local Device Models */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-primary">Stage 1: Local Edge Models</h3>
                <p className="text-xs text-muted">On-device local training (PII safe)</p>
              </div>
            </div>

            <div className="space-y-4 my-4">
              {/* Device 1 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Client Device #1 (Mobile)</span>
                  <span className="text-indigo-400 font-mono">78% Acc</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    animate={{ width: ['75%', '78%', '75%'] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Device 2 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Client Device #2 (Desktop)</span>
                  <span className="text-indigo-400 font-mono">81% Acc</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    animate={{ width: ['79%', '81%', '79%'] }}
                    transition={{ repeat: Infinity, duration: 3.5, delay: 0.5 }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
              </div>

              {/* Device 3 */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">Client Device #3 (Tablet)</span>
                  <span className="text-indigo-400 font-mono">79% Acc</span>
                </div>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden border border-white/5">
                  <motion.div
                    animate={{ width: ['77%', '79%', '77%'] }}
                    transition={{ repeat: Infinity, duration: 4.5, delay: 0.2 }}
                    className="bg-indigo-500 h-full rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 bg-white/2 p-2 rounded-lg border border-white/5">
            Raw clicks and scroll sequences are never exported. Only model updates (gradients) leave client viewports.
          </div>
        </motion.div>

        {/* Stage 2: Secure Aggregator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between relative"
        >
          {isAggregating && (
            <div className="absolute inset-0 bg-purple-500/5 backdrop-blur-[1px] rounded-2xl flex items-center justify-center pointer-events-none">
              <div className="absolute w-full h-1/3 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent top-0 animate-pulse" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-primary">Stage 2: Secure Aggregator</h3>
                <p className="text-xs text-muted">Federated Parameter Consensus</p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center my-6 gap-3">
              <div className="relative">
                <motion.div
                  animate={{ scale: isAggregating ? [1, 1.15, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-14 h-14 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400"
                >
                  <Server className="w-7 h-7" />
                </motion.div>
                {/* Floating particles flowing from sides */}
                {isAggregating && (
                  <>
                    <motion.div
                      animate={{ x: [-40, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute left-[-20px] top-[25px] w-2 h-2 rounded-full bg-purple-400"
                    />
                    <motion.div
                      animate={{ x: [40, 0], opacity: [0, 1, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                      className="absolute right-[-20px] top-[25px] w-2 h-2 rounded-full bg-purple-400"
                    />
                  </>
                )}
              </div>
              
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/20 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Differential Privacy Active
              </span>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 bg-white/2 p-2 rounded-lg border border-white/5">
            Aggregates gradients via Secure Multiparty Computation (SMC). Adds Gaussian noise to prevent target membership inference.
          </div>
        </motion.div>

        {/* Stage 3: Global Update */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-primary">Stage 3: Global Model</h3>
                <p className="text-xs text-muted">Federated consensus deployment</p>
              </div>
            </div>

            <div className="space-y-4 my-6">
              <div className="bg-white/5 border border-white/10 p-3.5 rounded-xl text-center">
                <p className="text-[10px] text-muted font-semibold uppercase tracking-wider">Active Iteration Round</p>
                <p className="text-2xl font-bold font-mono text-pink-400 mt-1">Round {round} of 100</p>
              </div>

              <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl text-center">
                <p className="text-[10px] text-emerald-500/70 font-semibold uppercase tracking-wider">Global Model Accuracy</p>
                <div className="flex justify-center items-baseline gap-2 mt-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400">{globalAccuracy.toFixed(1)}%</span>
                  <span className="text-xs font-semibold text-emerald-500/70">(Baseline: 81.0%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] text-slate-500 bg-white/2 p-2 rounded-lg border border-white/5">
            Redeploys generalized neural weights back to edge viewports. Restores inference accuracy with zero footprint.
          </div>
        </motion.div>
      </div>

      {/* Before / After Metrics & Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Metric Comparison */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-semibold text-primary mb-1">Model Progression Metrics</h3>
            <p className="text-xs text-muted mb-4">Precision accuracy comparison after 47 aggregate rounds</p>

            <div className="space-y-4">
              {/* Accuracy metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary font-medium">Inference Accuracy</span>
                  <span className="font-semibold text-primary">81% → <span className="text-emerald-400">86.2%</span></span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '86.2%' }} />
                </div>
              </div>

              {/* Precision metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary font-medium">Precision Target</span>
                  <span className="font-semibold text-primary">78% → <span className="text-emerald-400">84.0%</span></span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              {/* Recall metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary font-medium">Recall Rate</span>
                  <span className="font-semibold text-primary">76% → <span className="text-emerald-400">82.1%</span></span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '82.1%' }} />
                </div>
              </div>

              {/* F1 Metric */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-secondary font-medium">F1-Score consensus</span>
                  <span className="font-semibold text-primary">0.77 → <span className="text-emerald-400">0.83</span></span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '83%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted bg-white/2 p-2.5 rounded-xl border border-white/5 mt-4">
            <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
            Accuracy gains reflect cold-start response improvements across 4,200 unique anonymous customer records.
          </div>
        </motion.div>

        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3 glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between"
        >
          <div>
            <h3 className="text-base font-semibold text-primary mb-1">Global Accuracy Progress</h3>
            <p className="text-xs text-muted mb-6">Model improvement timeline across aggregate rounds</p>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockTimelineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
                  <XAxis dataKey="round" stroke="#8888a0" fontSize={10} tickLine={false} />
                  <YAxis
                    stroke="#8888a0"
                    fontSize={10}
                    domain={[0.6, 0.9]}
                    tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                    tickLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#e0e0e8',
                    }}
                    formatter={(val: any) => [`${(val * 100).toFixed(1)}%`, 'Accuracy']}
                    labelFormatter={(label) => `Round ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#a855f7"
                    strokeWidth={3}
                    dot={{ fill: '#a855f7', strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <p className="text-[10px] text-slate-500 italic mt-4">
            * Simulation aggregates local weights computed client-side in standard browser tabs.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
export default FederatedPanel;
