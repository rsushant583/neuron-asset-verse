import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Wallet, ExternalLink, Copy, Check } from 'lucide-react';

interface WalletConnectProps {
  onConnect?: (address: string) => void;
}

const WalletConnect = ({ onConnect }: WalletConnectProps) => {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if wallet is already connected
    const checkConnection = async () => {
      if (window.ethereum && window.ethereum.selectedAddress) {
        setAddress(window.ethereum.selectedAddress);
        if (onConnect) {
          onConnect(window.ethereum.selectedAddress);
        }
      }
    };

    checkConnection();
  }, [onConnect]);

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: "Wallet Not Found",
        description: "Please install MetaMask or another Ethereum wallet",
        variant: "destructive"
      });
      return;
    }

    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        
        toast({
          title: "Wallet Connected",
          description: "Your wallet has been connected successfully"
        });
        
        if (onConnect) {
          onConnect(accounts[0]);
        }
      }
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive"
      });
    } finally {
      setConnecting(false);
    }
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const viewOnExplorer = () => {
    if (address) {
      const network = import.meta.env.VITE_BLOCKCHAIN_NETWORK || 'polygon-mumbai';
      const explorerUrl = network === 'polygon-mainnet'
        ? `https://polygonscan.com/address/${address}`
        : `https://mumbai.polygonscan.com/address/${address}`;
      
      window.open(explorerUrl, '_blank');
    }
  };

  return (
    <div className="space-y-4">
      {!address ? (
        <Button
          onClick={connectWallet}
          disabled={connecting}
          className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
        >
          <Wallet className="mr-2" size={18} />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      ) : (
        <div className="glass-morphism p-4 rounded-lg border border-cyber-blue/20">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Connected Wallet</span>
            <div className="flex space-x-2">
              <button
                onClick={copyAddress}
                className="text-gray-400 hover:text-white transition-colors"
                title="Copy address"
              >
                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
              <button
                onClick={viewOnExplorer}
                className="text-gray-400 hover:text-white transition-colors"
                title="View on explorer"
              >
                <ExternalLink size={16} />
              </button>
            </div>
          </div>
          <div className="text-cyber-blue font-mono text-sm">{formatAddress(address)}</div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;