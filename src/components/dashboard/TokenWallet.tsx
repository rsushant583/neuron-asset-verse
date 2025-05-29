
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Send, Download } from 'lucide-react';

const TokenWallet = () => {
  return (
    <Card className="glass-morphism border-cyber-purple/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Wallet className="text-cyber-purple" size={20} />
          <span>Token Wallet</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <motion.div
            className="text-2xl font-bold text-cyber-purple"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            1,247 $MM
          </motion.div>
          <div className="text-sm text-gray-400">MetaMind Tokens</div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Available</span>
            <span className="text-white">1,000 $MM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Staked</span>
            <span className="text-white">200 $MM</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Pending</span>
            <span className="text-white">47 $MM</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-3">
          <Button variant="outline" size="sm" className="border-cyber-purple/50 text-cyber-purple">
            <Send size={16} className="mr-1" />
            Send
          </Button>
          <Button variant="outline" size="sm" className="border-cyber-blue/50 text-cyber-blue">
            <Download size={16} className="mr-1" />
            Stake
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TokenWallet;
