
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Trophy, Vote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const Community = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const communityStats = [
    { icon: Users, label: 'Active Members', value: '12,847', color: 'text-cyber-blue' },
    { icon: MessageCircle, label: 'Discussions', value: '3,426', color: 'text-cyber-purple' },
    { icon: Trophy, label: 'Top Contributors', value: '156', color: 'text-cyber-pink' },
    { icon: Vote, label: 'DAO Proposals', value: '89', color: 'text-green-400' }
  ];

  const topContributors = [
    { name: 'Alex Chen', avatar: '🧠', contributions: 127, reputation: 4.9 },
    { name: 'Sarah Kim', avatar: '🚀', contributions: 98, reputation: 4.8 },
    { name: 'Mike Torres', avatar: '⚡', contributions: 89, reputation: 4.7 },
    { name: 'Lisa Wang', avatar: '🎨', contributions: 76, reputation: 4.6 }
  ];

  const recentDiscussions = [
    { title: 'Future of AI-Generated Art', replies: 23, time: '2h ago', author: 'Alex Chen' },
    { title: 'Best Practices for Knowledge NFTs', replies: 18, time: '4h ago', author: 'Sarah Kim' },
    { title: 'DAO Governance Improvements', replies: 31, time: '6h ago', author: 'Mike Torres' },
    { title: 'Remix Economy Insights', replies: 15, time: '8h ago', author: 'Lisa Wang' }
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
              MetaMind <span className="text-glow bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">Community</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Connect with creators, share ideas, and shape the future of the knowledge economy
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {communityStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  className="glass-morphism p-4 md:p-6 rounded-lg border border-cyber-blue/20 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Icon size={24} className={`${stat.color} mx-auto mb-2`} />
                  <div className="text-xl md:text-2xl font-bold text-white">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Discussions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">Recent Discussions</h2>
                <Button className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white">
                  Start Discussion
                </Button>
              </div>

              <div className="space-y-4">
                {recentDiscussions.map((discussion, index) => (
                  <motion.div
                    key={discussion.title}
                    className="glass-morphism p-4 md:p-6 rounded-lg border border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300 cursor-pointer"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <h3 className="text-white font-semibold mb-2">{discussion.title}</h3>
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>by {discussion.author}</span>
                      <div className="flex items-center space-x-4">
                        <span>{discussion.replies} replies</span>
                        <span>{discussion.time}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* DAO Voting Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">Active DAO Proposals</h2>
              
              <div className="glass-morphism p-6 rounded-lg border border-cyber-blue/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">Platform Fee Reduction</h3>
                  <span className="text-green-400 text-sm">Active</span>
                </div>
                <p className="text-gray-400 mb-4">
                  Proposal to reduce platform fees from 5% to 3% to encourage more creators.
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-4">
                    <span className="text-green-400">👍 847 (67%)</span>
                    <span className="text-red-400">👎 421 (33%)</span>
                  </div>
                  <Button size="sm" className="bg-gradient-to-r from-cyber-blue to-cyber-purple text-white">
                    Vote
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Top Contributors */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-xl font-bold text-white mb-6">Top Contributors</h2>
              
              <div className="space-y-4">
                {topContributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.name}
                    className="glass-morphism p-4 rounded-lg border border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">{contributor.avatar}</div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{contributor.name}</div>
                        <div className="text-sm text-gray-400">
                          {contributor.contributions} contributions • ⭐ {contributor.reputation}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Community Guidelines */}
            <motion.div
              className="glass-morphism p-6 rounded-lg border border-cyber-blue/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-white font-semibold mb-4">Community Guidelines</h3>
              <ul className="text-gray-400 text-sm space-y-2">
                <li>• Respect all community members</li>
                <li>• Share knowledge generously</li>
                <li>• Provide constructive feedback</li>
                <li>• Follow intellectual property rules</li>
                <li>• Participate in DAO governance</li>
              </ul>
            </motion.div>
          </div>
        </div>
      </div>

      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Community;
