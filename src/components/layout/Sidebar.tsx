/**
 * Sidebar — Collapsible navigation sidebar with glassmorphism styling.
 *
 * Uses NavLink from react-router-dom for automatic active-state detection.
 * Nav items are driven by NAV_ITEMS from constants, with lucide icons
 * mapped by name.
 */

import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Brain,
  Fingerprint,
  Network,
  BarChart3,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** Map icon name strings to actual lucide components */
const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard,
  Brain,
  Fingerprint,
  Network,
  BarChart3,
  ShoppingBag,
};

import { useDashboardStore } from '@/store/dashboardStore';

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useDashboardStore();
  const width = sidebarCollapsed ? 80 : 280;

  return (
    <motion.aside
      animate={{ width }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="relative z-40 flex flex-col shrink-0 h-screen
                 bg-bg-1/80 backdrop-blur-xl border-r border-white/[0.08]"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/[0.06]">
        <div className="w-9 h-9 rounded-xl bg-gradient-accent flex items-center justify-center shrink-0">
          <Activity size={20} className="text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="gradient-text text-lg font-bold tracking-tight whitespace-nowrap"
            >
              ContextPulse
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'sidebar-item group',
                  isActive && 'active',
                )
              }
            >
              <Icon
                size={20}
                className="shrink-0 transition-colors group-[.active]:text-white"
              />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -4 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="mx-3 mb-3 p-2 rounded-lg bg-white/[0.04] hover:bg-white/[0.08]
                   text-text-secondary hover:text-text-primary transition-colors
                   flex items-center justify-center"
      >
        {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
      </button>

      {/* Powered by */}
      <AnimatePresence>
        {!sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-5 py-4 border-t border-white/[0.06] text-[11px] text-text-muted"
          >
            Powered by <span className="text-text-secondary">Epsilon</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.aside>
  );
}
