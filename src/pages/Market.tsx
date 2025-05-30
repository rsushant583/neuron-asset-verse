
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Star, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const Market = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const marketStats = [
    { label: 'Total Volume', value: '$2.4M', change: '+12.5%' },
    { label: 'Active Ideas', value: '1,247', change: '+8.2%' },
    { label: 'Top Creator', value: '@alex_mind', change: '+24.1%' },
    { label: 'Floor Price', value: '0.05 ETH', change: '+5.7%' }
  ];

  const trendingIdeas = [
    { title: 'AI Art Generator Prompt', price: '0.25 ETH', remixes: 42, rating: 4.9 },
    { title: 'Smart Contract Template', price: '0.18 ETH', remixes: 38, rating: 4.8 },
    { title: 'UX Design Framework', price: '0.32 ETH', remixes: 51, rating: 4.9 },
    { title: 'Marketing Strategy Guide', price: '0.15 ETH', remixes: 29, rating: 4.7 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black overflow-x-hidden">
      {!isMobile && <Navigation />}
      
      <div className={`${!isMobile ? 'pt-20' : 'pt-4'} ${isMobile ? 'pb-20' : ''}`}>
        {/* Header */}
        <motion.div
          className="max-w-7xl mx-auto px-4 md:px-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              Knowledge <span className="text-glow bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">Marketplace</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Discover, trade, and remix the world's most valuable digital knowledge assets
            </p>
          </div>

          {/* Market Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {marketStats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="glass-morphism p-4 rounded-lg border border-cyber-blue/20"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-center">
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400 mb-1">{stat.label}</div>
                  <div className="text-xs text-green-400">{stat.change}</div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search knowledge assets..."
                className="w-full pl-10 pr-4 py-3 bg-white/5 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-blue/50"
              />
            </div>
            <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white px-6">
              <Filter size={18} className="mr-2" />
              Filter
            </Button>
          </div>
        </motion.div>

        {/* Trending Section */}
        <motion.div
          className="max-w-7xl mx-auto px-4 md:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-center mb-6">
            <TrendingUp className="text-cyber-blue mr-3" size={24} />
            <h2 className="text-2xl font-bold text-white">Trending Ideas</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {trendingIdeas.map((idea, index) => (
              <motion.div
                key={idea.title}
                className="glass-morphism p-6 rounded-lg border border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300 cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className="aspect-square bg-gradient-to-br from-cyber-blue/20 to-cyber-purple/20 rounded-lg mb-4 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple neural-glow" />
                </div>
                
                <h3 className="text-white font-semibold mb-2 line-clamp-2">{idea.title}</h3>
                
                <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                  <span>{idea.remixes} remixes</span>
                  <div className="flex items-center">
                    <Star className="text-yellow-400 mr-1" size={14} />
                    <span>{idea.rating}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-cyber-blue font-bold">{idea.price}</span>
                  <Button size="sm" className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white">
                    View
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Market;
