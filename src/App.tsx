import { Routes, Route } from 'react-router-dom';
import { StorePage } from '@/pages/StorePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CoreAIPage } from '@/pages/CoreAIPage';
import { IdentityPage } from '@/pages/IdentityPage';
import { FederatedPage } from '@/pages/FederatedPage';
import { AnalyticsPage } from '@/pages/AnalyticsPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

export default function App() {
  return (
    <Routes>
      {/* E-Commerce Demo Store — standalone page */}
      <Route path="/" element={<StorePage />} />
      
      {/* Enterprise Dashboard — shared layout with sidebar */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/core-ai" element={<CoreAIPage />} />
        <Route path="/identity" element={<IdentityPage />} />
        <Route path="/federated" element={<FederatedPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
      </Route>
    </Routes>
  );
}
