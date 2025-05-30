
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, Search, Upload, Wallet, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { icon: Home, label: 'Home', path: '/', id: 'home' },
    { icon: Search, label: 'Explore', path: '/explorer', id: 'explore' },
    { icon: Upload, label: 'Create', path: '/create', id: 'create' },
    { icon: Wallet, label: 'Market', path: '/market', id: 'market' },
    { icon: User, label: 'Profile', path: '/dashboard', id: 'profile' },
  ];

  const handleNavigation = (path: string, id: string) => {
    setActiveTab(path);
    navigate(path);
    
    // Add haptic feedback simulation
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-area-inset-bottom"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="glass-morphism border-t border-white/10 px-2 py-2 backdrop-blur-xl bg-black/90">
        <div className="flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = activeTab === item.path;
            const Icon = item.icon;
            
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item.path, item.id)}
                className="relative flex flex-col items-center justify-center p-2 rounded-2xl min-w-[60px]"
                whileTap={{ scale: 0.85 }}
                transition={{ duration: 0.1 }}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 rounded-2xl"
                    transition={{ duration: 0.3 }}
                  />
                )}
                
                <motion.div
                  animate={{ 
                    scale: isActive ? 1.1 : 1,
                    color: isActive ? '#00d4ff' : '#9ca3af'
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10"
                >
                  <Icon size={20} />
                </motion.div>
                
                <motion.span
                  animate={{ 
                    color: isActive ? '#00d4ff' : '#9ca3af',
                    fontSize: isActive ? '11px' : '10px'
                  }}
                  className="relative z-10 mt-1 font-medium"
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

export default MobileNavigation;
