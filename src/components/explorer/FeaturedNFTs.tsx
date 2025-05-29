
import { motion } from 'framer-motion';
import { Star, Users, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const FeaturedNFTs = () => {
  const featuredNFTs = [
    {
      id: 1,
      title: "The Ultimate AI Prompt Engineering Guide",
      creator: "Alex Chen",
      preview: "Master the art of crafting powerful AI prompts that generate exceptional results...",
      price: 45,
      remixes: 1247,
      rating: 4.9,
      image: "/placeholder.svg",
      tags: ["AI", "Productivity", "Guide"],
      featured: true
    },
    {
      id: 2,
      title: "Crypto Trading Psychology Masterclass",
      creator: "Maya Patel",
      preview: "Understand the mental game behind successful crypto trading...",
      price: 89,
      remixes: 892,
      rating: 4.8,
      image: "/placeholder.svg",
      tags: ["Finance", "Psychology", "Trading"],
      featured: true
    },
    {
      id: 3,
      title: "Zero to Hero: Content Creation Blueprint",
      creator: "Jordan Kim",
      preview: "Transform your ideas into viral content with this comprehensive blueprint...",
      price: 67,
      remixes: 654,
      rating: 4.7,
      image: "/placeholder.svg",
      tags: ["Creative", "Marketing", "Social Media"],
      featured: true
    }
  ];

  return (
    <section className="py-16 px-6 bg-gradient-to-r from-cyber-blue/5 to-cyber-purple/5">
      <div className="max-w-7xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-bold text-white mb-4">Featured Knowledge NFTs</h2>
          <p className="text-gray-300">Curated by our community and trending this week</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredNFTs.map((nft, index) => (
            <motion.div
              key={nft.id}
              className="group relative"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="glass-morphism rounded-2xl p-6 border border-cyber-blue/20 hover:border-cyber-blue/50 transition-all duration-300 group-hover:transform group-hover:scale-105">
                {/* Featured Badge */}
                <div className="absolute -top-3 -right-3">
                  <Badge className="bg-gradient-to-r from-cyber-pink to-cyber-purple text-white">
                    <Star size={12} className="mr-1" />
                    Featured
                  </Badge>
                </div>

                {/* NFT Image */}
                <div className="relative mb-6 overflow-hidden rounded-lg">
                  <img
                    src={nft.image}
                    alt={nft.title}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex flex-wrap gap-2">
                      {nft.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-cyber-blue transition-colors">
                    {nft.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-3">by {nft.creator}</p>
                  <p className="text-gray-300 text-sm line-clamp-3">{nft.preview}</p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-yellow-400">
                      <Star size={16} className="mr-1 fill-current" />
                      <span className="text-sm">{nft.rating}</span>
                    </div>
                    <div className="flex items-center text-cyber-blue">
                      <Users size={16} className="mr-1" />
                      <span className="text-sm">{nft.remixes}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white">${nft.price}</div>
                    <div className="text-xs text-gray-400">ETH</div>
                  </div>
                </div>

                {/* Action Button */}
                <Button className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink transition-all duration-300">
                  <Zap size={16} className="mr-2" />
                  Remix Now
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedNFTs;
