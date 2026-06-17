import { motion } from 'framer-motion';
import { Fingerprint, Monitor, Cookie, Mail, User, ShieldAlert, Cpu } from 'lucide-react';

interface NodeProps {
  x: number;
  y: number;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  delay?: number;
  isActive: boolean;
}

function GraphNode({ x, y, label, sublabel, icon, delay = 0, isActive }: NodeProps) {
  return (
    <g>
      {/* Glow Effect when active */}
      {isActive && (
        <motion.circle
          cx={x}
          cy={y}
          r={45}
          fill="rgba(139, 92, 246, 0.15)"
          stroke="rgba(139, 92, 246, 0.4)"
          strokeWidth={1}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ repeat: Infinity, duration: 3, delay }}
        />
      )}

      {/* Main Node Circle */}
      <motion.g
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 100, delay }}
        whileHover={{ scale: 1.1 }}
      >
        <circle
          cx={x}
          cy={y}
          r={isActive ? 38 : 34}
          fill={isActive ? 'url(#activeGrad)' : 'url(#inactiveGrad)'}
          stroke={isActive ? 'rgba(168, 85, 247, 0.5)' : 'rgba(255, 255, 255, 0.1)'}
          strokeWidth={2}
          className="cursor-pointer"
        />

        {/* Icon */}
        <g transform={`translate(${x - 12}, ${y - 12})`}>
          <foreignObject width="24" height="24">
            <div className={`text-center ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
              {icon}
            </div>
          </foreignObject>
        </g>

        {/* Label */}
        <text
          x={x}
          y={y + 55}
          textAnchor="middle"
          className="text-xs font-semibold fill-slate-200 pointer-events-none"
        >
          {label}
        </text>

        {/* Sublabel */}
        {sublabel && (
          <text
            x={x}
            y={y + 70}
            textAnchor="middle"
            className="text-[10px] font-medium fill-slate-500 pointer-events-none"
          >
            {sublabel}
          </text>
        )}
      </motion.g>
    </g>
  );
}

export function NodeGraph({ isMerged }: { isMerged: boolean }) {
  const width = 600;
  const height = 400;
  const cx = width / 2;
  const cy = height / 2;

  // Outer nodes positioned in a circle
  const nodes = [
    { id: 'device', x: cx - 180, y: cy - 90, label: 'Device ID', sublabel: 'dev_mac_22a1', icon: <Monitor className="w-5 h-5" />, delay: 0.1 },
    { id: 'cookie', x: cx - 180, y: cy + 90, label: 'Cookie ID', sublabel: 'cookie_7c2f82', icon: <Cookie className="w-5 h-5" />, delay: 0.2 },
    { id: 'email', x: cx + 180, y: cy - 90, label: 'Email Address', sublabel: 's.chen@gmail.com', icon: <Mail className="w-5 h-5" />, delay: 0.3 },
    { id: 'crm', x: cx + 180, y: cy + 90, label: 'CRM Record', sublabel: 'crm_994182', icon: <Fingerprint className="w-5 h-5" />, delay: 0.4 },
    { id: 'intent', x: cx, y: cy - 130, label: 'Behavioral Vector', sublabel: '64-dim float', icon: <Cpu className="w-5 h-5" />, delay: 0.5 },
  ];

  return (
    <div className="w-full flex justify-center bg-white/2 rounded-2xl border border-white/5 p-4 overflow-hidden">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="max-w-[600px] h-auto">
        <defs>
          {/* Active node gradient */}
          <radialGradient id="activeGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2e1065" />
            <stop offset="100%" stopColor="#0f0f1a" />
          </radialGradient>

          {/* Inactive node gradient */}
          <radialGradient id="inactiveGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </radialGradient>

          {/* Line gradients */}
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Connections */}
        <g>
          {nodes.map((n) => {
            const isConnected = isMerged || n.id === 'device' || n.id === 'cookie' || n.id === 'intent';
            return (
              <g key={n.id}>
                {/* Connection line */}
                <motion.line
                  x1={n.x}
                  y1={n.y}
                  x2={cx}
                  y2={cy}
                  stroke={isConnected ? '#8b5cf6' : '#334155'}
                  strokeWidth={isConnected ? 2 : 1}
                  strokeDasharray={isConnected ? '4 4' : '0'}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: n.delay }}
                />

                {/* Animated pulse particles traveling down the lines */}
                {isConnected && (
                  <circle r={3} fill="#ec4899">
                    <animateMotion
                      dur="2.5s"
                      repeatCount="indefinite"
                      path={`M ${n.x} ${n.y} L ${cx} ${cy}`}
                      keyTimes="0;1"
                    />
                  </circle>
                )}
              </g>
            );
          })}
        </g>

        {/* Surrounding Nodes */}
        {nodes.map((n) => {
          const isActive = isMerged || n.id === 'device' || n.id === 'cookie' || n.id === 'intent';
          return (
            <GraphNode
              key={n.id}
              x={n.x}
              y={n.y}
              label={n.label}
              sublabel={n.sublabel}
              icon={n.icon}
              delay={n.delay}
              isActive={isActive}
            />
          );
        })}

        {/* Central Core Node (Unified Profile) */}
        <g>
          {isMerged && (
            <motion.circle
              cx={cx}
              cy={cy}
              r={60}
              fill="rgba(236, 72, 153, 0.1)"
              stroke="rgba(236, 72, 153, 0.3)"
              strokeWidth={1.5}
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 4 }}
            />
          )}

          <motion.g
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 80, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
          >
            <circle
              cx={cx}
              cy={cy}
              r={46}
              fill={isMerged ? '#1e1b4b' : '#1e293b'}
              stroke={isMerged ? '#ec4899' : '#475569'}
              strokeWidth={3}
              className="cursor-pointer"
            />
            {/* Inner pulsing stroke for merged */}
            {isMerged && (
              <motion.circle
                cx={cx}
                cy={cy}
                r={46}
                fill="none"
                stroke="#8b5cf6"
                strokeWidth={3}
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <g transform={`translate(${cx - 16}, ${cy - 16})`}>
              <foreignObject width="32" height="32">
                <div className={`text-center ${isMerged ? 'text-pink-400' : 'text-slate-500'}`}>
                  <User className="w-8 h-8" />
                </div>
              </foreignObject>
            </g>

            <text
              x={cx}
              y={cy + 65}
              textAnchor="middle"
              className="text-sm font-bold fill-white tracking-wide"
            >
              {isMerged ? 'Sarah Chen' : 'Anonymous Client'}
            </text>
            <text
              x={cx}
              y={cy + 80}
              textAnchor="middle"
              className="text-[10px] font-semibold fill-slate-500 uppercase tracking-wider"
            >
              {isMerged ? 'Unified Profile Resolve' : 'Awaiting Merge'}
            </text>
          </motion.g>
        </g>
      </svg>
    </div>
  );
}
export default NodeGraph;
