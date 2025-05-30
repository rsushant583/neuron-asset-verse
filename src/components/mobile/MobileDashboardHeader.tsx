
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Upload, 
  Shuffle, 
  Vote,
  ChevronDown,
  Bell,
  User,
  Wallet,
  Settings
} from 'lucide-react';

interface MobileDashboardHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const MobileDashboardHeader = ({ activeTab, setActiveTab }: MobileDashboardHeaderProps) => {
  const [showMenu, setShowMenu] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'upload', label: 'Upload Idea', icon: Upload },
    { id: 'remixes', label: 'Remix History', icon: Shuffle },
    { id: 'voting', label: 'DAO Voting', icon: Vote },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const activeItem = menuItems.find(item => item.id === activeTab);
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  return (
    <>
      <motion.header
        className="sticky top-0 z-40 glass-morphism border-b border-cyber-blue/20 p-4 safe-area-inset-top"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          {/* Logo and Active Tab */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple neural-glow" />
            <div>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center space-x-2 text-white active:scale-95 transition-transform"
              >
                <ActiveIcon size={20} />
                <span className="font-semibold text-sm">{activeItem?.label}</span>
                <motion.div
                  animate={{ rotate: showMenu ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white p-2 active:scale-95 transition-transform">
              <Bell size={18} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-pink rounded-full animate-pulse"></span>
            </Button>
            
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2 active:scale-95 transition-transform">
              <User size={18} />
            </Button>
          </div>
        </div>
      </motion.header>

      {/* Dropdown Menu Overlay */}
      <AnimatePresence>
        {showMenu && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setShowMenu(false)}
            />
            
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute top-20 left-4 right-4 z-40 glass-morphism rounded-2xl border border-cyber-blue/20 overflow-hidden shadow-2xl"
            >
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setActiveTab(item.id);
                      setShowMenu(false);
                    }}
                    className={`w-full flex items-center space-x-3 p-4 transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? 'bg-cyber-blue/20 text-cyber-blue border-l-4 border-cyber-blue' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="ml-auto w-2 h-2 bg-cyber-blue rounded-full"
                      />
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MobileDashboardHeader;
