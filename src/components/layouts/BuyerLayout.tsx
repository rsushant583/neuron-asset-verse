
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, History, Star, User } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

interface BuyerLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BuyerLayout = ({ children, activeTab, setActiveTab }: BuyerLayoutProps) => {
  const menuItems = [
    { id: 'overview', label: 'Overview', icon: ShoppingBag },
    { id: 'purchases', label: 'My Purchases', icon: History },
    { id: 'recommended', label: 'Recommended', icon: Star },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyber-darker via-black to-cyber-dark">
      <DashboardHeader />
      
      <div className="flex">
        {/* Buyer Sidebar */}
        <motion.div
          className="w-64 glass-morphism border-r border-cyber-blue/20 min-h-screen"
          initial={{ x: -100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-4">
            <h2 className="text-xl font-bold text-white mb-6">Buyer Dashboard</h2>
            <div className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant={isActive ? "default" : "ghost"}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full justify-start ${
                      isActive 
                        ? 'bg-cyber-blue/20 text-cyber-blue border border-cyber-blue/30' 
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </Button>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default BuyerLayout;
