import { motion } from 'framer-motion';
import { UpliftMetrics } from './UpliftMetrics';
import { SessionChart } from './SessionChart';
import { IntentDistribution } from './IntentDistribution';
import { ConversionFunnel } from './ConversionFunnel';

export function AnalyticsDashboard() {
  return (
    <div className="space-y-6">
      {/* 3 Uplift KPI Cards on Top */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <UpliftMetrics />
      </motion.div>

      {/* Row 2: Session Chart (2/3) + Intent Distribution (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SessionChart />
        </div>
        <div>
          <IntentDistribution />
        </div>
      </div>

      {/* Row 3: Conversion Funnel (Full Width) */}
      <div className="w-full">
        <ConversionFunnel />
      </div>
    </div>
  );
}
export default AnalyticsDashboard;
