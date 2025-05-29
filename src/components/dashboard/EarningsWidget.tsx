
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Coins } from 'lucide-react';

const EarningsWidget = () => {
  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <DollarSign className="text-cyber-blue" size={20} />
          <span>Earnings Overview</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <motion.div
            className="text-3xl font-bold text-cyber-blue"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
          >
            $2,847.50
          </motion.div>
          <div className="text-sm text-gray-400">Total Lifetime Earnings</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300">This Month</span>
            <div className="flex items-center space-x-1">
              <TrendingUp className="text-green-400" size={16} />
              <span className="text-white">$450.20</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">$MM Tokens</span>
            <div className="flex items-center space-x-1">
              <Coins className="text-cyber-purple" size={16} />
              <span className="text-white">1,247</span>
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Avg. per Product</span>
            <span className="text-white">$142.30</span>
          </div>
        </div>

        <div className="pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center">
            +18% from last month
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EarningsWidget;
