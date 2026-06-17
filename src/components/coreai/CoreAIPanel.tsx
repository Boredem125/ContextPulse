import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cpu, ArrowRight, CheckCircle2, RefreshCw, BarChart2, ShieldAlert } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { HeatmapGrid } from '@/components/visualization/HeatmapGrid';
import { INTENT_COLORS } from '@/lib/constants';

interface DecisionHistoryItem {
  id: string;
  timestamp: string;
  visitorId: string;
  primaryIntent: string;
  confidence: number;
  actionTaken: string;
  lift: string;
}

const mockHistory: DecisionHistoryItem[] = [
  { id: 'dec_001', timestamp: '12 seconds ago', visitorId: 'anon_9d8e72', primaryIntent: 'Comparator', confidence: 0.89, actionTaken: 'Inject Spec Table & Compare Widget', lift: '+24.1%' },
  { id: 'dec_002', timestamp: '1 minute ago', visitorId: 'anon_f43c8a', primaryIntent: 'Deal Seeker', confidence: 0.94, actionTaken: 'Highlight $150 Coupon Code', lift: '+18.3%' },
  { id: 'dec_003', timestamp: '3 minutes ago', visitorId: 'anon_3a7d2e', primaryIntent: 'Impulse Buyer', confidence: 0.78, actionTaken: 'Activate Countdown Timer & Low Stock Alert', lift: '+31.4%' },
  { id: 'dec_004', timestamp: '5 minutes ago', visitorId: 'anon_e8f2c1', primaryIntent: 'Researcher', confidence: 0.85, actionTaken: 'Prioritize Full Customer Reviews Tab', lift: '+12.7%' },
  { id: 'dec_005', timestamp: '7 minutes ago', visitorId: 'anon_1c9b3d', primaryIntent: 'Explorer', confidence: 0.62, actionTaken: 'Show Category Carousel and Trending Products', lift: '+9.4%' },
];

export function CoreAIPanel() {
  const { currentIntent, intentVector } = useDashboardStore();
  const [processingState, setProcessingState] = useState<'idle' | 'analyzing' | 'done'>('done');

  // Trigger analysis animation when intent changes
  useEffect(() => {
    setProcessingState('analyzing');
    const timer = setTimeout(() => {
      setProcessingState('done');
    }, 1200);
    return () => clearTimeout(timer);
  }, [currentIntent.primaryIntent]);

  const getActionForIntent = (intent: string) => {
    switch (intent) {
      case 'Explorer':
        return 'Show discovery banner, highlight trending gadgets';
      case 'Comparator':
        return 'Display comparison widget, highlight specifications';
      case 'Deal Seeker':
        return 'Apply sale badge, show promo code SAVE15';
      case 'Researcher':
        return 'Expand technical specification reviews, show FAQs';
      case 'Impulse Buyer':
        return 'Trigger countdown timer, display urgency stocks';
      case 'Gift Shopper':
        return 'Show curated gift guides and holiday bundles';
      case 'Returning Buyer':
        return 'Personalize greeting banner, show recently viewed';
      default:
        return 'Deliver standard brand experience';
    }
  };

  return (
    <div className="space-y-8">
      {/* Three Column Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Stage 1: Vector Input */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-indigo-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Stage 1: Input Vector</h3>
              <p className="text-xs text-muted">Real-time normalized features (64-dim)</p>
            </div>
          </div>

          <div className="mb-4 flex justify-center">
            <div className="w-48 h-48">
              <HeatmapGrid vector={intentVector} />
            </div>
          </div>

          <div className="space-y-2 text-xs text-secondary bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between">
              <span>Intent Dimension Group</span>
              <span>Normalized Value</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-1.5">
              <span>Scroll Velocity & Depth</span>
              <span className="text-blue-400 font-mono">{(intentVector[8] ?? 0.5).toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>Mouse Velocity & Idle</span>
              <span className="text-blue-400 font-mono">{(intentVector[16] ?? 0.5).toFixed(3)}</span>
            </div>
            <div className="flex justify-between">
              <span>CTA/Product Engagement</span>
              <span className="text-blue-400 font-mono">{(intentVector[24] ?? 0.5).toFixed(3)}</span>
            </div>
          </div>
        </motion.div>

        {/* Connector Line 1 to 2 */}
        <div className="hidden lg:flex absolute left-[31%] top-1/2 -translate-y-1/2 z-10 text-white/20 items-center justify-center">
          <motion.div
            animate={{ x: [0, 24, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowRight className="w-8 h-8 text-indigo-400" />
          </motion.div>
        </div>

        {/* Stage 2: Processing AI Model */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 to-purple-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Stage 2: CORE AI Model</h3>
              <p className="text-xs text-muted">Rule-based Neural Inference Engine</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center h-48 relative">
            {processingState === 'analyzing' ? (
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-t-2 border-indigo-500 border-r-2 border-transparent"
                  />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-400">
                    <Cpu className="w-6 h-6 animate-pulse" />
                  </div>
                </div>
                <p className="text-sm text-indigo-400 font-medium animate-pulse">Running Inference...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-16 h-16 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400"
                >
                  <Cpu className="w-8 h-8" />
                </motion.div>
                <div className="text-center">
                  <p className="text-sm text-indigo-400 font-semibold flex items-center gap-1.5 justify-center">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Decision Resolved
                  </p>
                  <p className="text-xs text-muted mt-0.5">Confidence margin optimized</p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2 text-xs bg-white/5 p-3 rounded-lg border border-white/5">
            <div className="flex justify-between">
              <span>Primary Class</span>
              <span className="font-semibold text-indigo-400">{currentIntent.primaryIntent}</span>
            </div>
            <div className="flex justify-between">
              <span>Vector Dimension</span>
              <span>64 Dimensions</span>
            </div>
            <div className="flex justify-between">
              <span>Latency</span>
              <span className="font-mono text-emerald-400">1.8 ms</span>
            </div>
          </div>
        </motion.div>

        {/* Connector Line 2 to 3 */}
        <div className="hidden lg:flex absolute left-[64%] top-1/2 -translate-y-1/2 z-10 text-white/20 items-center justify-center">
          <motion.div
            animate={{ x: [0, 24, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut", delay: 0.5 }}
          >
            <ArrowRight className="w-8 h-8 text-purple-400" />
          </motion.div>
        </div>

        {/* Stage 3: Output Decision */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary">Stage 3: Decision Output</h3>
              <p className="text-xs text-muted">Dynamically Generated Strategies</p>
            </div>
          </div>

          <div className="h-48 flex flex-col justify-center gap-4">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden">
              <div
                className="absolute top-0 left-0 w-[4px] h-full"
                style={{ backgroundColor: INTENT_COLORS[currentIntent.primaryIntent] }}
              />
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Target Segment</p>
              <h4 className="text-lg font-bold text-primary mt-1">{currentIntent.primaryIntent}</h4>
              <p className="text-xs text-secondary mt-2 line-clamp-2">
                {getActionForIntent(currentIntent.primaryIntent)}
              </p>
            </div>
          </div>

          <div className="flex gap-2.5 mt-2.5">
            <div className="flex-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-center py-2 px-1 rounded-lg">
              <p className="text-[10px] text-emerald-500/70 font-semibold">CONFIDENCE</p>
              <p className="text-lg font-bold font-mono">{(currentIntent.confidence * 100).toFixed(0)}%</p>
            </div>
            <div className="flex-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-center py-2 px-1 rounded-lg">
              <p className="text-[10px] text-blue-500/70 font-semibold">PREDICTED LIFT</p>
              <p className="text-lg font-bold font-mono">+22.4%</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Decision History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-semibold text-primary">Real-Time Decision Log</h3>
            <p className="text-xs text-muted">Historical decisions evaluated by the CORE AI decision system</p>
          </div>
          <button className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-secondary hover:text-primary py-1.5 px-3 rounded-lg transition">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh Log
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-xs text-muted font-medium pb-2">
                <th className="py-3 px-4">Decision ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Visitor UUID</th>
                <th className="py-3 px-4">Primary Intent</th>
                <th className="py-3 px-4">Confidence</th>
                <th className="py-3 px-4">Personalization Trigger</th>
                <th className="py-3 px-4 text-right">Conversion Lift</th>
              </tr>
            </thead>
            <tbody>
              {/* Dynamic current decision */}
              <tr className="border-b border-white/5 text-sm bg-indigo-500/5 hover:bg-indigo-500/10 transition">
                <td className="py-3 px-4 font-mono text-xs text-indigo-400 font-semibold">dec_live</td>
                <td className="py-3 px-4 text-xs text-secondary font-medium">Just now</td>
                <td className="py-3 px-4 font-mono text-xs text-muted">anon_88d2f1</td>
                <td className="py-3 px-4">
                  <span
                    className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{
                      backgroundColor: `${INTENT_COLORS[currentIntent.primaryIntent]}20`,
                      color: INTENT_COLORS[currentIntent.primaryIntent],
                      border: `1px solid ${INTENT_COLORS[currentIntent.primaryIntent]}30`,
                    }}
                  >
                    {currentIntent.primaryIntent}
                  </span>
                </td>
                <td className="py-3 px-4 font-mono font-medium">{(currentIntent.confidence * 100).toFixed(0)}%</td>
                <td className="py-3 px-4 text-xs text-secondary max-w-xs truncate">
                  {getActionForIntent(currentIntent.primaryIntent)}
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">+22.4%</td>
              </tr>
              {/* Predefined mock history */}
              {mockHistory.map((item) => (
                <tr key={item.id} className="border-b border-white/5 text-sm hover:bg-white/5 transition">
                  <td className="py-3 px-4 font-mono text-xs text-secondary">{item.id}</td>
                  <td className="py-3 px-4 text-xs text-secondary">{item.timestamp}</td>
                  <td className="py-3 px-4 font-mono text-xs text-muted">{item.visitorId}</td>
                  <td className="py-3 px-4">
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${INTENT_COLORS[item.primaryIntent as keyof typeof INTENT_COLORS] || '#555'}20`,
                        color: INTENT_COLORS[item.primaryIntent as keyof typeof INTENT_COLORS] || '#aaa',
                        border: `1px solid ${INTENT_COLORS[item.primaryIntent as keyof typeof INTENT_COLORS] || '#555'}30`,
                      }}
                    >
                      {item.primaryIntent}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono font-medium">{(item.confidence * 100).toFixed(0)}%</td>
                  <td className="py-3 px-4 text-xs text-secondary max-w-xs truncate">{item.actionTaken}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">{item.lift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
