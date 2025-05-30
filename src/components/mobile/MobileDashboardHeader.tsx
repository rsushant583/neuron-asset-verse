
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Upload, 
  Shuffle, 
  Vote,
  ChevronDown,
  Bell,
  User
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
  ];

  const activeItem = menuItems.find(item => item.id === activeTab);
  const ActiveIcon = activeItem?.icon || LayoutDashboard;

  return (
    <motion.header
      className="sticky top-0 z-40 glass-morphism border-b border-cyber-blue/20 p-4"
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
              className="flex items-center space-x-2 text-white"
            >
              <ActiveIcon size={20} />
              <span className="font-semibold">{activeItem?.label}</span>
              <ChevronDown size={16} className={`transition-transform ${showMenu ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white p-2">
            <Bell size={18} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyber-pink rounded-full"></span>
          </Button>
          
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
            <User size={18} />
          </Button>
        </div>
      </div>

      {/* Dropdown Menu */}
      {showMenu && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-full left-0 right-0 mt-1 mx-4 glass-morphism rounded-lg border border-cyber-blue/20 overflow-hidden"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setShowMenu(false);
                }}
                className={`w-full flex items-center space-x-3 p-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-cyber-blue/20 text-cyber-blue' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </motion.header>
  );
};

export default MobileDashboardHeader;
