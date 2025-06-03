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
import VersionControl from '@/components/VersionControl';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  
  const userId = 'user123'; // This would come from auth context

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleVoiceCommand = (command: string) => {
    console.log('Dashboard handling voice command:', command);
    
    // Handle voice commands specific to dashboard
    if (command === 'show_drafts' || command.includes('drafts')) {
      setActiveTab('drafts');
      document.getElementById('version-control')?.scrollIntoView({ behavior: 'smooth' });
    } 
    else if (command.includes('create') && command.includes('medical')) {
      navigate('/create?category=medical');
    } 
    else if (command.includes('create') && command.includes('business')) {
      navigate('/create?category=business');
    }
    else if (command.includes('create') && (command.includes('ebook') || command.includes('book'))) {
      navigate('/create');
    } 
    else if (command.includes('marketplace') || command.includes('market')) {
      navigate('/market');
    } 
    else if (command.includes('upload') || command.includes('idea')) {
      setActiveTab('upload');
    } 
    else if (command.includes('earnings') || command.includes('wallet')) {
      setActiveTab('wallet');
    } 
    else if (command.includes('voting') || command.includes('dao')) {
      setActiveTab('voting');
    }
    else if (command.includes('overview') || command.includes('home')) {
      setActiveTab('overview');
    }
    else if (command.includes('settings')) {
      setActiveTab('settings');
    }
    // Handle title setting commands
    else if (command.startsWith('set_title_')) {
      const title = command.replace('set_title_', '').replace(/_/g, ' ');
      // This would be handled by the creation wizard
      console.log('Setting title to:', title);
    }
    // Handle category setting commands
    else if (command.startsWith('set_category_')) {
      const category = command.replace('set_category_', '');
      // This would be handled by the creation wizard
      console.log('Setting category to:', category);
    }
  };

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
      case 'drafts':
        return (
          <div className="space-y-6">
            <VersionControl 
              userId={userId}
              onDraftSelect={(draft) => {
                // Navigate to creator wizard with the selected draft
                navigate(`/create?draftId=${draft.id}`);
              }}
              onCommand={handleVoiceCommand}
            />
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
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Voice Settings</h3>
                <p className="text-gray-400 mb-4">Configure voice assistant preferences</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="form-checkbox" />
                    <span className="text-white">Enable voice commands</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="form-checkbox" />
                    <span className="text-white">Voice feedback</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="form-checkbox" />
                    <span className="text-white">Continuous listening</span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Accessibility Settings</h3>
                <p className="text-gray-400 mb-4">Enhance usability for better experience</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-white">High contrast mode</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-white">Large text mode</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-white">Reduce animations</span>
                  </label>
                </div>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-lg font-semibold text-cyber-blue mb-2">Auto-save Settings</h3>
                <p className="text-gray-400 mb-4">Manage automatic draft saving</p>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="form-checkbox" />
                    <span className="text-white">Enable auto-save every 30 seconds</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" className="form-checkbox" />
                    <span className="text-white">Save to cloud automatically</span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        );
      default:
        return <ProductsOverview />;
    }
  };

  // Update sidebar to include drafts tab
  const enhancedSidebarProps = {
    activeTab,
    setActiveTab,
    collapsed: sidebarCollapsed,
    setCollapsed: setSidebarCollapsed,
    extraTabs: [
      {
        id: 'drafts',
        label: 'Draft Versions',
        icon: 'FileText',
        description: 'Manage your eBook drafts'
      }
    ]
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
        <VoiceAssistant onCommand={handleVoiceCommand} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark">
      <DashboardSidebar {...enhancedSidebarProps} />
      
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
      
      <VoiceAssistant onCommand={handleVoiceCommand} />
    </div>
  );
};

export default Dashboard;
