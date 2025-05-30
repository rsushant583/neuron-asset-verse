
import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Upload, 
  Shuffle, 
  Vote, 
  Wallet, 
  Settings 
} from 'lucide-react';

interface MobileDashboardNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileDashboardNavigation = ({ activeTab, setActiveTab }: MobileDashboardNavigationProps) => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', tab: 'overview', id: 'overview' },
    { icon: Upload, label: 'Upload', tab: 'upload', id: 'upload' },
    { icon: Shuffle, label: 'Remixes', tab: 'remixes', id: 'remixes' },
    { icon: Vote, label: 'Voting', tab: 'voting', id: 'voting' },
    { icon: Wallet, label: 'Wallet', tab: 'wallet', id: 'wallet' },
    { icon: Settings, label: 'Settings', tab: 'settings', id: 'settings' },
  ];

  const handleNavigation = (tab: string) => {
    setActiveTab(tab);
    
    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-morphism border-t border-white/10 px-1 py-2 backdrop-blur-xl bg-black/90">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.tab;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.tab)}
                className="relative flex flex-col items-center justify-center p-2 rounded-xl min-w-[50px] flex-1"
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.1 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDashboardTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyber-blue/25 to-cyber-purple/25 rounded-xl"
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#00d4ff' : '#9ca3af'
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 mb-1"
                >
                  <Icon size={18} />
                </motion.div>
                
                <motion.span
                  animate={{ 
                    color: isActive ? '#00d4ff' : '#9ca3af',
                    fontSize: isActive ? '10px' : '9px'
                  }}
                  className="relative z-10 font-medium text-center leading-tight"
                >
                  {item.label}
                </motion.span>
              </motion.button>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default MobileDashboardNavigation;
