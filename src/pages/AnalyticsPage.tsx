import { AnalyticsDashboard } from '@/components/analytics/AnalyticsDashboard';
import { BarChart3 } from 'lucide-react';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-accent-blue" />
          Performance Analytics
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Measure CTR improvements, conversion increases, and zero-state latency reductions driven by ContextPulse behavioral intelligence.
        </p>
      </div>

      {/* Main Panel */}
      <AnalyticsDashboard />
    </div>
  );
}
