
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shuffle, User, TrendingUp } from 'lucide-react';

const RemixHistory = () => {
  const remixes = [
    {
      id: 1,
      originalTitle: "The Minimalist Entrepreneur Playbook",
      remixTitle: "Minimalist Entrepreneur for Teens",
      remixer: "Sarah Kim",
      earnings: 45,
      views: 234,
      date: "2 days ago"
    },
    {
      id: 2,
      originalTitle: "AI Productivity Assistant Bot",
      remixTitle: "AI Study Buddy for Students", 
      remixer: "Mike Johnson",
      earnings: 32,
      views: 156,
      date: "5 days ago"
    },
    {
      id: 3,
      originalTitle: "Sleep Optimization Protocol",
      remixTitle: "Sleep Hacks for New Parents",
      remixer: "Lisa Chen",
      earnings: 28,
      views: 189,
      date: "1 week ago"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Remix History</h2>
        <div className="text-sm text-gray-400">
          Total remix earnings: $105
        </div>
      </div>

      <div className="grid gap-4">
        {remixes.map((remix, index) => (
          <motion.div
            key={remix.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-morphism border-cyber-blue/20">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shuffle className="text-cyber-blue" size={16} />
                      <span className="text-sm text-gray-400">{remix.date}</span>
                    </div>
                    
                    <h3 className="font-semibold text-white mb-1">
                      {remix.remixTitle}
                    </h3>
                    <p className="text-sm text-gray-400 mb-3">
                      Remixed from: <span className="text-cyber-blue">{remix.originalTitle}</span>
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <User size={14} />
                        <span>by {remix.remixer}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <TrendingUp size={14} />
                        <span>{remix.views} views</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-lg font-bold text-cyber-blue">
                      +${remix.earnings}
                    </div>
                    <div className="text-xs text-gray-400">
                      Remix royalty
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default RemixHistory;
