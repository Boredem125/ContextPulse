import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

interface ChartData {
  day: string;
  sessions: number;
  personalized: number;
}

const data: ChartData[] = [
  { day: 'Mon', sessions: 4200, personalized: 3850 },
  { day: 'Tue', sessions: 3800, personalized: 3510 },
  { day: 'Wed', sessions: 5100, personalized: 4800 },
  { day: 'Thu', sessions: 4900, personalized: 4620 },
  { day: 'Fri', sessions: 6200, personalized: 5900 },
  { day: 'Sat', sessions: 7800, personalized: 7420 },
  { day: 'Sun', sessions: 5400, personalized: 5100 },
];

export function SessionChart() {
  return (
    <div className="glass-card p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl h-full flex flex-col justify-between">
      <div className="mb-6">
        <h3 className="text-base font-semibold text-primary">Session Activity Trends</h3>
        <p className="text-xs text-muted">Weekly comparison of active vs. dynamically personalized sessions</p>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorPersonalized" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#252540" />
            <XAxis dataKey="day" stroke="#8888a0" fontSize={10} tickLine={false} />
            <YAxis stroke="#8888a0" fontSize={10} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#10101f',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                color: '#e0e0e8',
              }}
            />
            <Area
              type="monotone"
              dataKey="sessions"
              stroke="#6366f1"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorSessions)"
              name="Total Sessions"
            />
            <Area
              type="monotone"
              dataKey="personalized"
              stroke="#a855f7"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPersonalized)"
              name="Personalized"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mt-4 text-[10px] text-muted border-t border-white/5 pt-4">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-indigo-500 inline-block" />
          <span>Active Sessions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded bg-purple-500 inline-block" />
          <span>Personalization Rate (Avg 94%)</span>
        </div>
      </div>
    </div>
  );
}
export default SessionChart;
