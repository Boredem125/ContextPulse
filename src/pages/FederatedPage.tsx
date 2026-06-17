import { FederatedPanel } from '@/components/federated/FederatedPanel';
import { Network } from 'lucide-react';

export function FederatedPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Network className="w-6 h-6 text-accent-blue" />
          Federated Learning Pipeline
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Trains user classification models locally on-device. Aggregates parameter updates back to standard models using Differential Privacy.
        </p>
      </div>

      {/* Main Panel */}
      <FederatedPanel />
    </div>
  );
}
