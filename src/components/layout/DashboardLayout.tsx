/**
 * DashboardLayout — Shell that combines Sidebar + TopBar + content area.
 * Used as a layout route in react-router-dom so child pages render via <Outlet />.
 */

import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { TopBar } from '@/components/layout/TopBar';
import { useDashboardStore } from '@/store/dashboardStore';

export function DashboardLayout() {
  const startSimulation = useDashboardStore((s) => s.startSimulation);
  const stopSimulation = useDashboardStore((s) => s.stopSimulation);

  const sidebarCollapsed = useDashboardStore((s) => s.sidebarCollapsed);

  // Start live data simulation when the dashboard shell mounts
  useEffect(() => {
    startSimulation();
    return () => stopSimulation();
  }, [startSimulation, stopSimulation]);

  return (
    <div className="flex h-screen overflow-hidden bg-bg-0">
      {/* Sidebar — fixed, width handled internally */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 transition-all duration-300">
        <TopBar />
        <main className="flex-1 overflow-y-auto bg-mesh px-8 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
