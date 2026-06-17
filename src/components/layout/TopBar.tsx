/**
 * TopBar — Fixed top navigation bar with breadcrumbs, live indicator,
 * notification bell, and user avatar.
 */

import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bell, Search, User } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';

/** Resolve current route to a human-readable breadcrumb label */
function useBreadcrumb(): string {
  const { pathname } = useLocation();
  const match = NAV_ITEMS.find((n) => n.path === pathname);
  return match?.label ?? 'Dashboard';
}

export function TopBar() {
  const breadcrumb = useBreadcrumb();

  return (
    <header
      className="sticky top-0 z-30 h-16 flex items-center justify-between
                 px-8 bg-bg-1/60 backdrop-blur-xl border-b border-white/[0.06]"
    >
      {/* Left — breadcrumb */}
      <div className="flex items-center gap-3">
        <span className="text-text-muted text-sm">Enterprise</span>
        <span className="text-text-muted">/</span>
        <motion.span
          key={breadcrumb}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-text-primary text-sm font-medium"
        >
          {breadcrumb}
        </motion.span>
      </div>

      {/* Right — controls */}
      <div className="flex items-center gap-5">
        {/* Live indicator */}
        <div className="flex items-center gap-2">
          <span className="live-dot" />
          <span className="text-success text-xs font-medium">Live</span>
        </div>

        {/* Search */}
        <button className="p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors">
          <Search size={18} />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-white/[0.05] text-text-secondary hover:text-text-primary transition-colors">
          <Bell size={18} />
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-[10px] font-bold flex items-center justify-center text-white">
            3
          </span>
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-white/[0.08]">
          <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
            <User size={16} className="text-white" />
          </div>
          <span className="text-sm text-text-secondary hidden sm:inline">
            Demo User
          </span>
        </div>
      </div>
    </header>
  );
}
