
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Users, Eye, Heart, Share2, Zap, Download, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface NFTModalProps {
  nft: any;
  onClose: () => void;
}

const NFTModal = ({ nft, onClose }: NFTModalProps) => {
  const [activeTab, setActiveTab] = useState('preview');

  const remixHistory = [
    { id: 1, creator: 'Alice Johnson', title: 'Extended Version with Case Studies', remixes: 45, date: '2 days ago' },
    { id: 2, creator: 'Bob Smith', title: 'Beginner-Friendly Adaptation', remixes: 23, date: '1 week ago' },
    { id: 3, creator: 'Carol Davis', title: 'Advanced Techniques Expansion', remixes: 67, date: '2 weeks ago' }
  ];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden glass-morphism rounded-2xl border border-cyber-blue/30"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center">
                <span className="text-white font-semibold">
                  {nft.creator.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-white">{nft.title}</h2>
                <p className="text-gray-400">by {nft.creator}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="flex h-[calc(90vh-140px)]">
            {/* Left Panel - Preview */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="mb-6">
                <img
                  src={nft.image}
                  alt={nft.title}
                  className="w-full h-64 object-cover rounded-lg mb-4"
                />
                
                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {nft.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="border-cyber-blue/50 text-cyber-blue">
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star size={16} className="text-yellow-400 fill-current" />
                    </div>
                    <div className="text-sm font-semibold text-white">{nft.rating}</div>
                    <div className="text-xs text-gray-400">Rating</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Users size={16} className="text-cyber-blue" />
                    </div>
                    <div className="text-sm font-semibold text-white">{nft.remixes}</div>
                    <div className="text-xs text-gray-400">Remixes</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Eye size={16} className="text-cyber-purple" />
                    </div>
                    <div className="text-sm font-semibold text-white">{nft.views}</div>
                    <div className="text-xs text-gray-400">Views</div>
                  </div>
                  <div className="text-center p-3 bg-white/5 rounded-lg">
                    <div className="text-sm font-semibold text-white">${nft.price}</div>
                    <div className="text-xs text-gray-400">ETH</div>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                  <p className="text-gray-300 leading-relaxed">{nft.preview}</p>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                    <TabsTrigger value="remixes">Remixes</TabsTrigger>
                    <TabsTrigger value="details">Details</TabsTrigger>
                  </TabsList>

                  <TabsContent value="preview" className="mt-4">
                    <div className="p-4 bg-white/5 rounded-lg">
                      <p className="text-gray-300 mb-4">
                        This is a comprehensive guide that covers all the essential aspects of the topic. 
                        The content is structured to provide maximum value and practical insights.
                      </p>
                      <div className="space-y-2 text-sm text-gray-400">
                        <div>• Introduction and foundational concepts</div>
                        <div>• Step-by-step practical exercises</div>
                        <div>• Real-world case studies and examples</div>
                        <div>• Advanced techniques and strategies</div>
                        <div>• Resource links and further reading</div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="remixes" className="mt-4">
                    <div className="space-y-3">
                      {remixHistory.map((remix) => (
                        <div key={remix.id} className="p-4 bg-white/5 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium text-white">{remix.title}</h4>
                            <span className="text-xs text-gray-400">{remix.date}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">by {remix.creator}</p>
                            <div className="flex items-center text-xs text-cyber-blue">
                              <Users size={12} className="mr-1" />
                              {remix.remixes} remixes
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="details" className="mt-4">
                    <div className="space-y-4">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Format</h4>
                        <p className="text-gray-300">{nft.format}</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">License</h4>
                        <p className="text-gray-300">Creative Commons with Attribution</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <h4 className="font-medium text-white mb-2">Created</h4>
                        <p className="text-gray-300">March 15, 2024</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Panel - Actions */}
            <div className="w-80 p-6 border-l border-white/10 bg-white/5">
              <div className="space-y-4">
                {/* Main Actions */}
                <Button className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-lg py-3">
                  <Zap size={20} className="mr-2" />
                  Remix for ${nft.price}
                </Button>

                <Button variant="outline" className="w-full border-cyber-blue/50 text-cyber-blue">
                  <Download size={16} className="mr-2" />
                  Preview Download
                </Button>

                {/* Secondary Actions */}
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Heart size={16} className="mr-1" />
                    Like
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Share2 size={16} className="mr-1" />
                    Share
                  </Button>
                  <Button variant="ghost" size="sm" className="flex-1">
                    <Flag size={16} className="mr-1" />
                    Report
                  </Button>
                </div>

                {/* Creator Info */}
                <div className="p-4 bg-white/5 rounded-lg">
                  <h4 className="font-medium text-white mb-3">About the Creator</h4>
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">
                        {nft.creator.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{nft.creator}</div>
                      <div className="text-sm text-gray-400">Verified Creator</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="font-semibold text-white">127</div>
                      <div className="text-gray-400">Products</div>
                    </div>
                    <div className="text-center p-2 bg-white/5 rounded">
                      <div className="font-semibold text-white">4.8</div>
                      <div className="text-gray-400">Rating</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    View Profile
                  </Button>
                </div>

                {/* Remix Incentives */}
                <div className="p-4 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10 rounded-lg border border-cyber-blue/20">
                  <h4 className="font-medium text-white mb-2">Remix Incentives</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Revenue Share:</span>
                      <span className="text-cyber-blue">15%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Remix Bonus:</span>
                      <span className="text-cyber-purple">5 MMT</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NFTModal;
