import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../app/layout/AppLayout';
import DashboardPage from '../features/dashboard/DashboardPage';
import OnboardingPage from '../features/onboarding/OnboardingPage';
import AIChatAssistant from '../features/aiChat/AIChatAssistant';

// Lazy-loaded pages (still static imports for simplicity without react-router)
import PortfolioPage from '../pages/Portfolio';
import MarketsPage from '../pages/Markets';
import RewardsPage from '../pages/Rewards';
import SettingsPage from '../pages/Settings';

const PAGES = {
  dashboard: DashboardPage,
  portfolio: PortfolioPage,
  markets:   MarketsPage,
  ai:        AIChatAssistant,
  rewards:   RewardsPage,
  settings:  SettingsPage,
};

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#080b14] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">F</div>
        <div className="w-5 h-5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
      </motion.div>
    </div>
  );
}

export default function AppRoutes() {
  const { user, profile, loading } = useAuth();
  const [page, setPage] = useState('dashboard');

  if (loading) return <LoadingScreen />;

  // Show onboarding for new users who haven't set risk profile
  if (user && profile && !profile.riskProfile) {
    return <OnboardingPage onComplete={() => {}} />;
  }

  // Show auth if not logged in — imported inline to avoid circular deps
  if (!user) {
    const AuthPage = React.lazy(() => import('../pages/Auth'));
    return (
      <React.Suspense fallback={<LoadingScreen />}>
        <AuthPage />
      </React.Suspense>
    );
  }

  const Page = PAGES[page] || DashboardPage;

  return (
    <AppLayout page={page} onNav={setPage}>
      <Page />
    </AppLayout>
  );
}
