
import { motion } from 'framer-motion';
import { Heart, Share2, Star, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileNFTCardProps {
  nft: {
    id: number;
    title: string;
    creator: string;
    preview: string;
    price: number;
    remixes: number;
    rating: number;
    views: number;
    image: string;
    tags: string[];
    format: string;
  };
  onSelect: (nft: any) => void;
}

const MobileNFTCard = ({ nft, onSelect }: MobileNFTCardProps) => {
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    // Haptic feedback
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      onClick={() => onSelect(nft)}
    >
      <div className="glass-morphism rounded-3xl p-4 border border-white/10 hover:border-cyber-blue/30 transition-all duration-300">
        {/* Image */}
        <div className="relative mb-4 overflow-hidden rounded-2xl">
          <img
            src={nft.image}
            alt={nft.title}
            className="w-full h-40 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          {/* Format Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant="secondary" className="text-xs bg-black/50 text-white border-none">
              {nft.format}
            </Badge>
          </div>

          {/* Like Button */}
          <motion.button
            onClick={handleLike}
            className={`absolute top-3 right-3 p-2 rounded-full transition-colors ${
              isLiked 
                ? 'bg-red-500 text-white' 
                : 'bg-black/50 text-gray-300'
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <Heart size={14} className={isLiked ? 'fill-current' : ''} />
          </motion.button>

          {/* Tags */}
          <div className="absolute bottom-3 left-3 right-3">
            <div className="flex flex-wrap gap-1">
              {nft.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs border-white/30 text-white bg-black/30">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <div>
            <h3 className="text-white font-semibold text-lg leading-tight line-clamp-2 mb-1">
              {nft.title}
            </h3>
            <p className="text-gray-400 text-sm">by {nft.creator}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-400">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <Star size={12} className="mr-1 text-yellow-400 fill-current" />
                {nft.rating}
              </div>
              <div className="flex items-center">
                <Users size={12} className="mr-1" />
                {nft.remixes}
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-white">${nft.price}</div>
            </div>
          </div>

          {/* Action Button */}
          <Button
            size="sm"
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink rounded-xl"
          >
            <Zap size={14} className="mr-1" />
            Remix Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default MobileNFTCard;
