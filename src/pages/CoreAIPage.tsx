import { CoreAIPanel } from '@/components/coreai/CoreAIPanel';
import { Brain } from 'lucide-react';

export function CoreAIPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Brain className="w-6 h-6 text-accent-blue" />
          CORE AI Decision Engine
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Binds behavioral vectors to real-time marketing channels, selecting the highest-performing content treatments.
        </p>
      </div>

      {/* Main Panel */}
      <CoreAIPanel />
    </div>
  );
}
