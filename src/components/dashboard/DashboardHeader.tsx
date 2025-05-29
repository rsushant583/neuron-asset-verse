
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Bell, Search, User } from 'lucide-react';

const DashboardHeader = () => {
  return (
    <motion.header
      className="glass-morphism border-b border-cyber-blue/20 p-4"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Welcome back, Alex</h1>
          <p className="text-gray-400">Transform your knowledge into digital assets</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search products..."
              className="pl-10 pr-4 py-2 bg-white/5 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-blue/50"
            />
          </div>
          
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative text-gray-400 hover:text-white">
            <Bell size={20} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-pink rounded-full"></span>
          </Button>
          
          {/* Profile */}
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
            <User size={20} />
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
