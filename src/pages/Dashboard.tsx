import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import MobileDashboardHeader from '@/components/mobile/MobileDashboardHeader';
import MobileDashboardNavigation from '@/components/mobile/MobileDashboardNavigation';
import UploadIdea from '@/components/dashboard/UploadIdea';
import ProductsOverview from '@/components/dashboard/ProductsOverview';
import EarningsWidget from '@/components/dashboard/EarningsWidget';
import TokenWallet from '@/components/dashboard/TokenWallet';
import RemixHistory from '@/components/dashboard/RemixHistory';
import DAOVoting from '@/components/dashboard/DAOVoting';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className={`grid grid-cols-1 ${!isMobile ? 'lg:grid-cols-3' : ''} gap-4 md:gap-6`}>
            <div className={!isMobile ? 'lg:col-span-2' : ''}>
              <ProductsOverview />
            </div>
            <div className="space-y-4 md:space-y-6">
              <EarningsWidget />
              <TokenWallet />
            </div>
          </div>
        );
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
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Notification Settings</h3>
                <p className="text-gray-400">Configure how you receive updates</p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Privacy Settings</h3>
                <p className="text-gray-400">Control your data and privacy preferences</p>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <ProductsOverview />;
    }
  };

  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark pb-20">
        <MobileDashboardHeader activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <main className="p-4 safe-area-inset">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </main>
        
        <MobileDashboardNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark">
      <DashboardSidebar 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <DashboardHeader />
        
        <main className="p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {renderContent()}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
