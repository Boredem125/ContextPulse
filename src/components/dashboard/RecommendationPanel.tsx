/**
 * RecommendationPanel — Active personalization strategy cards
 * showing what actions are being taken for the detected intent archetype.
 */

import { motion } from 'framer-motion';
import {
  Columns3,
  BarChart3,
  LayoutList,
  Tag,
  Sparkles,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';

interface PersonalizationAction {
  icon: React.ElementType;
  title: string;
  description: string;
  status: 'Applied' | 'Queued';
}

/** Map primary intent to a set of recommended personalization actions */
function getActions(intent: string): PersonalizationAction[] {
  const map: Record<string, PersonalizationAction[]> = {
    Comparator: [
      { icon: Columns3,   title: 'Show Comparison Widget',       description: 'Side-by-side product comparison table injected above the fold.',             status: 'Applied' },
      { icon: BarChart3,  title: 'Highlight Feature Differences', description: 'Key spec differentiators are visually emphasized with badges.',              status: 'Applied' },
      { icon: LayoutList, title: 'Side-by-Side Layout',           description: 'Product grid switches to two-column comparison layout.',                      status: 'Applied' },
      { icon: Tag,        title: 'Show Price Match Guarantee',    description: 'Trust signal surfaces price-match messaging near the CTA.',                   status: 'Queued' },
    ],
    Explorer: [
      { icon: Sparkles, title: 'Expand Category Suggestions',    description: 'Show broader product categories based on browsing pattern.',                  status: 'Applied' },
      { icon: BarChart3, title: 'Trending Products Widget',      description: 'Inject trending items relevant to viewed categories.',                        status: 'Applied' },
      { icon: LayoutList, title: 'Infinite Scroll Feed',         description: 'Switch pagination to infinite scroll for discovery behavior.',                status: 'Queued' },
    ],
  };
  return map[intent] ?? map['Comparator']!;
}

export function RecommendationPanel() {
  const primaryIntent = useDashboardStore((s) => s.currentIntent.primaryIntent);
  const actions = getActions(primaryIntent);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 flex flex-col gap-4"
    >
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-accent-purple" />
        <h3 className="text-sm font-semibold text-text-primary">
          Active Personalization
        </h3>
      </div>

      <p className="text-xs text-text-muted">
        Strategy tailored for <span className="text-accent-purple font-medium">{primaryIntent}</span> archetype
      </p>

      <div className="space-y-3">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i, duration: 0.35 }}
              className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]"
            >
              <div className="w-8 h-8 rounded-lg bg-accent-blue/10 flex items-center justify-center shrink-0 mt-0.5">
                <Icon size={16} className="text-accent-blue" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-text-primary">
                    {action.title}
                  </span>
                  <span
                    className={`status-badge text-[10px] ${
                      action.status === 'Applied'
                        ? 'text-success border-success/20 bg-success/10'
                        : 'text-warning border-warning/20 bg-warning/10'
                    }`}
                  >
                    {action.status}
                  </span>
                </div>
                <p className="text-[11px] text-text-muted mt-1 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
