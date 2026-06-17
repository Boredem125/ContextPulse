import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { INTENT_COLORS } from '@/lib/constants';

interface DistributionItem {
  name: string;
  value: number;
}

const data: DistributionItem[] = [
  { name: 'Explorer', value: 24 },
  { name: 'Comparator', value: 19 },
  { name: 'Deal Seeker', value: 16 },
  { name: 'Researcher', value: 14 },
  { name: 'Impulse Buyer', value: 11 },
  { name: 'Gift Shopper', value: 7 },
  { name: 'Returning Buyer', value: 6 },
  { name: 'Passive Browser', value: 3 },
];

export function IntentDistribution() {
  const totalSessions = 42894;

  return (
    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-primary">Intent Distribution</h3>
        <p className="text-xs text-muted">Distribution of inferred user archetypes across all active traffic</p>
      </div>

      <div className="h-56 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={INTENT_COLORS[entry.name as keyof typeof INTENT_COLORS] || '#888'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: '#10101f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e0e0e8',
              }}
              formatter={(val: any) => [`${val}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-2">
          <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Total Evaluated</span>
          <span className="text-xl font-extrabold font-mono text-slate-100">42.8K</span>
        </div>
      </div>

      {/* Grid Legend */}
      <div className="grid grid-cols-4 gap-2 mt-4 text-[10px] text-secondary border-t border-white/5 pt-4">
        {data.map((item) => (
          <div key={item.name} className="flex flex-col">
            <div className="flex items-center gap-1">
              <span
                className="w-1.5 h-1.5 rounded-full inline-block"
                style={{ backgroundColor: INTENT_COLORS[item.name as keyof typeof INTENT_COLORS] }}
              />
              <span className="truncate max-w-[50px] font-medium text-slate-400">{item.name}</span>
            </div>
            <span className="font-mono font-bold text-slate-300 ml-2.5">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default IntentDistribution;
