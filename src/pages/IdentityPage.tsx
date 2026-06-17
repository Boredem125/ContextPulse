import { IdentityPanel } from '@/components/identity/IdentityPanel';
import { Fingerprint } from 'lucide-react';

export function IdentityPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-2">
          <Fingerprint className="w-6 h-6 text-accent-blue" />
          Identity Resolution
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          Securely stitches anonymous behavioral histories to authenticated CRM records using privacy-compliant graph resolution.
        </p>
      </div>

      {/* Main Panel */}
      <IdentityPanel />
    </div>
  );
}
