
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Share2, Star, Users, Zap, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import NFTModal from './NFTModal';

interface NFTGridProps {
  filters: {
    topic: string;
    sortBy: string;
    priceRange: number[];
  };
  searchQuery: string;
}

const NFTGrid = ({ filters, searchQuery }: NFTGridProps) => {
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [likedNFTs, setLikedNFTs] = useState(new Set());

  // Mock NFT data
  const allNFTs = [
    {
      id: 1,
      title: "Advanced Meditation Techniques for Busy Professionals",
      creator: "Sarah Wilson",
      preview: "Discover powerful 5-minute meditation practices that fit into your hectic schedule...",
      price: 25,
      remixes: 432,
      rating: 4.6,
      views: 1250,
      image: "/placeholder.svg",
      tags: ["Health", "Mindfulness", "Productivity"],
      topic: "health",
      format: "Audio Course"
    },
    {
      id: 2,
      title: "NFT Art Creation with AI Tools",
      creator: "Marcus Rodriguez",
      preview: "Learn to create stunning NFT artwork using cutting-edge AI generation tools...",
      price: 78,
      remixes: 289,
      rating: 4.8,
      views: 987,
      image: "/placeholder.svg",
      tags: ["AI", "Art", "NFT"],
      topic: "ai",
      format: "Video Tutorial"
    },
    {
      id: 3,
      title: "The Psychology of Persuasive Writing",
      creator: "Dr. Emma Chen",
      preview: "Master the psychological principles that make writing irresistibly persuasive...",
      price: 56,
      remixes: 567,
      rating: 4.9,
      views: 1876,
      image: "/placeholder.svg",
      tags: ["Writing", "Psychology", "Marketing"],
      topic: "creative",
      format: "eBook"
    },
    {
      id: 4,
      title: "DeFi Yield Farming Strategies 2024",
      creator: "Alex Thompson",
      preview: "Navigate the complex world of DeFi yield farming with proven strategies...",
      price: 134,
      remixes: 234,
      rating: 4.5,
      views: 743,
      image: "/placeholder.svg",
      tags: ["DeFi", "Crypto", "Finance"],
      topic: "finance",
      format: "Strategy Guide"
    },
    {
      id: 5,
      title: "Building Habits That Stick: Science-Based Approach",
      creator: "Dr. Michael Park",
      preview: "Transform your life with evidence-based habit formation techniques...",
      price: 42,
      remixes: 721,
      rating: 4.7,
      views: 2134,
      image: "/placeholder.svg",
      tags: ["Habits", "Psychology", "Self-Improvement"],
      topic: "lifestyle",
      format: "Interactive Course"
    },
    {
      id: 6,
      title: "Startup Pitch Deck Mastery",
      creator: "Lisa Chang",
      preview: "Create compelling pitch decks that secure funding from investors...",
      price: 89,
      remixes: 156,
      rating: 4.8,
      views: 564,
      image: "/placeholder.svg",
      tags: ["Business", "Startups", "Fundraising"],
      topic: "business",
      format: "Template Pack"
    }
  ];

  // Filter and search logic
  const filteredNFTs = allNFTs.filter(nft => {
    const matchesTopic = filters.topic === 'all' || nft.topic === filters.topic;
    const matchesPrice = nft.price >= filters.priceRange[0] && nft.price <= filters.priceRange[1];
    const matchesSearch = searchQuery === '' || 
      nft.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.creator.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesTopic && matchesPrice && matchesSearch;
  });

  // Sort logic
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return b.id - a.id;
      case 'remixes':
        return b.remixes - a.remixes;
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default: // popularity
        return b.views - a.views;
    }
  });

  const toggleLike = (nftId: number) => {
    setLikedNFTs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nftId)) {
        newSet.delete(nftId);
      } else {
        newSet.add(nftId);
      }
      return newSet;
    });
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-white">
            {sortedNFTs.length} Knowledge NFTs
          </h2>
          <div className="text-sm text-gray-400">
            Showing results for "{filters.topic === 'all' ? 'All Topics' : filters.topic}"
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              className="group relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              layout
            >
              <div className="glass-morphism rounded-xl p-6 border border-white/10 hover:border-cyber-blue/50 transition-all duration-300 group-hover:transform group-hover:scale-[1.02] cursor-pointer"
                   onClick={() => setSelectedNFT(nft)}>
                
                {/* Image */}
                <div className="relative mb-4 overflow-hidden rounded-lg">
                  <img
                    src={nft.image}
                    alt={nft.title}
                    className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Format Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="text-xs">
                      {nft.format}
                    </Badge>
                  </div>

                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(nft.id);
                      }}
                      className={`p-2 rounded-full transition-colors ${
                        likedNFTs.has(nft.id) 
                          ? 'bg-red-500 text-white' 
                          : 'bg-black/50 text-gray-300 hover:text-red-400'
                      }`}
                    >
                      <Heart size={14} className={likedNFTs.has(nft.id) ? 'fill-current' : ''} />
                    </button>
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 bg-black/50 rounded-full text-gray-300 hover:text-cyber-blue transition-colors"
                    >
                      <Share2 size={14} />
                    </button>
                  </div>

                  {/* Tags */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex flex-wrap gap-1">
                      {nft.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs border-white/30 text-white">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1 line-clamp-2 group-hover:text-cyber-blue transition-colors">
                    {nft.title}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">by {nft.creator}</p>
                  <p className="text-sm text-gray-300 line-clamp-2">{nft.preview}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Star size={12} className="mr-1 text-yellow-400 fill-current" />
                      {nft.rating}
                    </div>
                    <div className="flex items-center">
                      <Users size={12} className="mr-1" />
                      {nft.remixes}
                    </div>
                    <div className="flex items-center">
                      <Eye size={12} className="mr-1" />
                      {nft.views}
                    </div>
                  </div>
                </div>

                {/* Price and Action */}
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <div className="text-xl font-bold text-white">${nft.price}</div>
                    <div className="text-xs text-gray-400">ETH</div>
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink"
                  >
                    <Zap size={14} className="mr-1" />
                    Remix
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {sortedNFTs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-white mb-2">No NFTs found</h3>
            <p className="text-gray-400">Try adjusting your filters or search terms</p>
          </div>
        )}
      </div>

      {/* NFT Detail Modal */}
      {selectedNFT && (
        <NFTModal 
          nft={selectedNFT} 
          onClose={() => setSelectedNFT(null)} 
        />
      )}
    </>
  );
};

export default NFTGrid;
