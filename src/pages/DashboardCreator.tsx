
import React, { useState } from 'react';
import { useRoleBasedRedirect } from '@/hooks/useRoleBasedRedirect';
import CreatorLayout from '@/components/layouts/CreatorLayout';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import UploadIdea from '@/components/dashboard/UploadIdea';
import RemixHistory from '@/components/dashboard/RemixHistory';
import DAOVoting from '@/components/dashboard/DAOVoting';
import TokenWallet from '@/components/dashboard/TokenWallet';
import EarningsWidget from '@/components/dashboard/EarningsWidget';
import { motion } from 'framer-motion';

const DashboardCreator = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useRoleBasedRedirect();

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <CreatorDashboard />;
      case 'upload':
        return <UploadIdea />;
      case 'remixes':
        return <RemixHistory />;
      case 'voting':
        return <DAOVoting />;
      case 'wallet':
        return (
          <div className="space-y-6">
            <TokenWallet />
            <EarningsWidget />
          </div>
        );
      case 'settings':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism p-6 rounded-xl border border-cyber-blue/20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Account Settings</h3>
                <p className="text-gray-400">Manage your account preferences and security</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Creator Tools</h3>
                <p className="text-gray-400">Configure your creator dashboard and tools</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <CreatorDashboard />;
    }
  };

  return (
    <CreatorLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      sidebarCollapsed={sidebarCollapsed}
      setSidebarCollapsed={setSidebarCollapsed}
    >
      {renderContent()}
    </CreatorLayout>
  );
};

export default DashboardCreator;
