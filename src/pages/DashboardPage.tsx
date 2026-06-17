import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Brain, Activity, Target } from 'lucide-react';
import { MetricsOverview } from '@/components/dashboard/MetricsOverview';
import { IntentPanel } from '@/components/dashboard/IntentPanel';
import { VectorVisualizer } from '@/components/dashboard/VectorVisualizer';
import { SessionPanel } from '@/components/dashboard/SessionPanel';
import { EventStream } from '@/components/dashboard/EventStream';
import { RecommendationPanel } from '@/components/dashboard/RecommendationPanel';
import { IntentRadarChart } from '@/components/visualization/RadarChart';
import { useDashboardStore } from '@/store/dashboardStore';

export function DashboardPage() {
  const { currentIntent, startSimulation, stopSimulation } = useDashboardStore();

  // Start simulating events and metrics changes on page load
  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, [startSimulation, stopSimulation]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-accent-blue" />
            PeopleCloud — Real-Time Intelligence
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Anonymous visitor intent inference and behavioral vector generation.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full text-emerald-400 text-xs font-semibold">
          <Activity className="w-3.5 h-3.5 animate-pulse" />
          Live Processing Engine Active
        </div>
      </div>

      {/* KPI Metrics */}
      <MetricsOverview />

      {/* Bento Grid Layer 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Intent Score Panel */}
        <IntentPanel />

        {/* Vector Visualizer (Heatmap) */}
        <VectorVisualizer />

        {/* Session Panel */}
        <SessionPanel />
      </div>

      {/* Radar Chart Visualizer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-accent-purple" />
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Intent Archetype Signature (Radar)</h3>
            <p className="text-xs text-text-muted mt-0.5">Visualizes the relative activation levels across all 8 customer archetypes.</p>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <IntentRadarChart scores={currentIntent.scores} className="w-full max-w-xl" />
        </div>
      </motion.div>

      {/* Bento Grid Layer 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Live Events Stream */}
        <EventStream />

        {/* Recommendation Strategy Panel */}
        <RecommendationPanel />
      </div>
    </div>
  );
}
