import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { KeyRound, ShieldCheck, Mail, Phone, Tag, Link2, AlertCircle, ArrowRight, UserCheck } from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { NodeGraph } from './NodeGraph';
import { HeatmapGrid } from '@/components/visualization/HeatmapGrid';
import { INTENT_COLORS } from '@/lib/constants';

export function IdentityPanel() {
  const { currentIntent, intentVector, sessionData, events } = useDashboardStore();
  const [isMerged, setIsMerged] = useState(false);
  const [isMerging, setIsMerging] = useState(false);

  const handleMerge = () => {
    setIsMerging(true);
    setTimeout(() => {
      setIsMerged(true);
      setIsMerging(false);
    }, 1500);
  };

  const handleReset = () => {
    setIsMerged(false);
  };

  return (
    <div className="space-y-8">
      {/* Top Section: Split Panel Merge */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 items-stretch relative">
        {/* Left Side: Anonymous Profile */}
        <div className="lg:col-span-3 glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">Session Identifier</h4>
                <p className="text-lg font-mono font-bold text-slate-100 mt-0.5">{sessionData.id}</p>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Anonymous
              </span>
            </div>

            <div className="space-y-4 my-6">
              {/* Behavioral Indicators */}
              <div className="space-y-2">
                <p className="text-xs text-muted font-semibold">Real-Time Context</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-secondary bg-white/2 p-2.5 rounded-lg border border-white/5">
                  <div>
                    <span className="text-slate-500">Device:</span> <span className="text-slate-300 font-medium">{sessionData.device}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Location:</span> <span className="text-slate-300 font-medium">{sessionData.location}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Events:</span> <span className="text-slate-300 font-medium">{events.length} tracked</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Pages:</span> <span className="text-slate-300 font-medium">{sessionData.pagesViewed} viewed</span>
                  </div>
                </div>
              </div>

              {/* Vector representation */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted font-semibold">Intent Signal</span>
                  <span
                    className="font-bold"
                    style={{ color: INTENT_COLORS[currentIntent.primaryIntent] }}
                  >
                    {currentIntent.primaryIntent}
                  </span>
                </div>
                <div className="h-10 w-full overflow-hidden rounded-lg">
                  <HeatmapGrid vector={intentVector.slice(0, 32)} />
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5 pt-4 border-t border-white/5">
            <AlertCircle className="w-4 h-4 text-slate-500" />
            No Personally Identifiable Information (PII) captured
          </div>
        </div>

        {/* Center: Merge Trigger Button */}
        <div className="lg:col-span-1 flex flex-col justify-center items-center gap-4 py-4 lg:py-0">
          {!isMerged ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleMerge}
              disabled={isMerging}
              className={`w-full max-w-[200px] lg:w-16 lg:h-16 rounded-full flex flex-col lg:flex-row items-center justify-center gap-2 p-4 lg:p-0 relative font-semibold text-sm ${
                isMerging
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:shadow-purple-500/40 border border-purple-400/30'
              }`}
            >
              {isMerging ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  className="w-5 h-5 rounded-full border-t-2 border-purple-300 border-r-2 border-transparent"
                />
              ) : (
                <>
                  <KeyRound className="w-5 h-5 lg:w-6 lg:h-6" />
                  <span className="lg:hidden">Simulate Login</span>
                </>
              )}

              {/* Glowing ring animation on wait */}
              {!isMerging && (
                <span className="absolute -inset-1 rounded-full border border-purple-500/30 animate-ping pointer-events-none hidden lg:block" />
              )}
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold bg-white/5 hover:bg-white/10 text-secondary hover:text-primary border border-white/10 rounded-xl transition"
            >
              Unlink Profiles
            </motion.button>
          )}

          {!isMerged && !isMerging && (
            <span className="text-[10px] text-muted font-semibold uppercase tracking-wider text-center hidden lg:block">
              Simulate Login
            </span>
          )}
        </div>

        {/* Right Side: Unified CRM Profile */}
        <div className="lg:col-span-3 relative overflow-hidden">
          <AnimatePresence mode="wait">
            {!isMerged ? (
              <motion.div
                key="locked"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full glass-card p-6 rounded-2xl bg-white/1 border border-white/5 backdrop-blur-sm flex flex-col items-center justify-center text-center group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800/50 border border-slate-700/50 flex items-center justify-center text-slate-500 mb-3 group-hover:border-slate-600 transition">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-semibold text-slate-400">Unified CRM Profile</h4>
                <p className="text-xs text-muted max-w-[200px] mt-1.5 leading-relaxed">
                  Authentication required to bind anonymous session to customer profile.
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="unlocked"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="w-full h-full glass-card p-6 rounded-2xl bg-white/5 border border-purple-500/30 backdrop-blur-xl flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-muted uppercase tracking-wider">Resolved Customer</h4>
                      <p className="text-lg font-bold text-slate-100 mt-0.5">Sarah Chen</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Resolved
                    </span>
                  </div>

                  <div className="space-y-2.5 my-5 text-xs">
                    <div className="flex items-center gap-2.5 text-secondary">
                      <Mail className="w-4 h-4 text-purple-400/80" />
                      <span>s.chen@example.com</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-secondary">
                      <Phone className="w-4 h-4 text-purple-400/80" />
                      <span>+1 (415) 555-8921</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-secondary">
                      <Tag className="w-4 h-4 text-purple-400/80" />
                      <span>Enterprise Segment: <span className="font-semibold text-slate-200">High-Value (A+)</span></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-secondary">
                      <Link2 className="w-4 h-4 text-purple-400/80" />
                      <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-[10px] text-muted">
                        crm_994182
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 p-3 rounded-xl flex items-center gap-3">
                  <div className="p-1.5 bg-purple-500/20 text-purple-300 rounded-lg">
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="text-[11px] text-purple-300 leading-tight">
                    <span className="font-semibold">Identity Resolved:</span> Captured behavioral history appended to CRM ledger.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Identity Graph Visualization */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-primary">Identity Resolution Topology</h3>
          <p className="text-xs text-muted">Graph-based resolution connecting device parameters, behavioral context, and CRM structures</p>
        </div>

        <NodeGraph isMerged={isMerged} />
      </motion.div>
    </div>
  );
}
export default IdentityPanel;
