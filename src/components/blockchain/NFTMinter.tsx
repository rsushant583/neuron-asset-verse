import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Zap, Upload, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface NFTMinterProps {
  productId: string;
  productTitle: string;
  onSuccess?: (mintRequestId: string) => void;
  onError?: (error: Error) => void;
}

const NFTMinter = ({ productId, productTitle, onSuccess, onError }: NFTMinterProps) => {
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'preparing' | 'minting' | 'success' | 'error'>('idle');
  const [mintRequestId, setMintRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  const handleMint = async () => {
    try {
      setMinting(true);
      setStatus('preparing');
      
      // Create mint request in database
      const { data: mintRequest, error: mintRequestError } = await supabase
        .from('nft_mint_requests')
        .insert([
          {
            ai_product_id: productId,
            status: 'pending'
          }
        ])
        .select()
        .single();
      
      if (mintRequestError) throw mintRequestError;
      
      setMintRequestId(mintRequest.id);
      setStatus('minting');
      
      // In a real implementation, this would trigger a backend process
      // For now, we'll simulate the minting process with a timeout
      setTimeout(() => {
        setStatus('success');
        setMinting(false);
        
        toast({
          title: "NFT Minted Successfully",
          description: `Your product "${productTitle}" has been minted as an NFT`
        });
        
        if (onSuccess) {
          onSuccess(mintRequest.id);
        }
      }, 3000);
      
    } catch (error: any) {
      console.error('Minting error:', error);
      setStatus('error');
      setMinting(false);
      
      toast({
        title: "Minting Failed",
        description: error.message || "Failed to mint NFT",
        variant: "destructive"
      });
      
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <Card className="glass-morphism border-cyber-blue/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <Zap className="text-cyber-blue" />
          <span>Mint as NFT</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <p className="text-gray-300 mb-4">
            Transform your product into a blockchain-verified NFT to enable royalties and ownership verification.
          </p>
          
          {status === 'idle' && (
            <Button
              onClick={handleMint}
              disabled={minting}
              className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white"
            >
              <Zap className="mr-2" size={18} />
              Mint NFT
            </Button>
          )}
          
          {status === 'preparing' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-blue mx-auto"></div>
              <p className="text-cyber-blue">Preparing metadata...</p>
            </motion.div>
          )}
          
          {status === 'minting' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="relative w-20 h-20 mx-auto">
                <motion.div
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple opacity-50"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Upload className="text-white" size={24} />
                </div>
              </div>
              <p className="text-cyber-blue">Minting on blockchain...</p>
            </motion.div>
          )}
          
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <Check className="text-green-500" size={32} />
              </div>
              <p className="text-green-500 font-semibold">NFT Minted Successfully!</p>
              <p className="text-gray-400 text-sm">
                Your NFT is now on the blockchain. You'll receive an email when the process is complete.
              </p>
            </motion.div>
          )}
          
          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-4"
            >
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <AlertCircle className="text-red-500" size={32} />
              </div>
              <p className="text-red-500 font-semibold">Minting Failed</p>
              <p className="text-gray-400 text-sm">
                There was an error minting your NFT. Please try again later.
              </p>
              <Button
                onClick={handleMint}
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                Retry
              </Button>
            </motion.div>
          )}
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">NFT Benefits</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 mt-0.5" size={16} />
              <span>Earn royalties when your content is remixed or resold</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 mt-0.5" size={16} />
              <span>Verifiable ownership on the blockchain</span>
            </li>
            <li className="flex items-start">
              <Check className="text-green-500 mr-2 mt-0.5" size={16} />
              <span>Participate in the MetaMind DAO governance</span>
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default NFTMinter;