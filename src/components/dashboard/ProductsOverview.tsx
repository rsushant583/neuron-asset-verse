
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Heart, Shuffle, TrendingUp, MoreHorizontal } from 'lucide-react';

const ProductsOverview = () => {
  const products = [
    {
      id: 1,
      title: "The Minimalist Entrepreneur Playbook",
      type: "eBook",
      views: 1247,
      likes: 89,
      remixes: 23,
      earnings: 450,
      status: "published",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop"
    },
    {
      id: 2,
      title: "AI Productivity Assistant Bot",
      type: "Chatbot",
      views: 892,
      likes: 56,
      remixes: 12,
      earnings: 280,
      status: "published",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop"
    },
    {
      id: 3,
      title: "Sleep Optimization Protocol",
      type: "Script",
      views: 634,
      likes: 41,
      remixes: 8,
      earnings: 195,
      status: "draft",
      image: "https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Your Products</h2>
        <Button className="bg-cyber-blue hover:bg-cyber-blue/80">
          Create New Product
        </Button>
      </div>

      <div className="grid gap-6">
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card className="glass-morphism border-cyber-blue/20 hover:border-cyber-blue/40 transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  {/* Product Image */}
                  <div className="w-24 h-16 rounded-lg overflow-hidden flex-shrink-0">
                    <img 
                      src={product.image} 
                      alt={product.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-white text-lg">{product.title}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm bg-cyber-purple/20 text-cyber-purple px-2 py-1 rounded">
                            {product.type}
                          </span>
                          <span className={`text-sm px-2 py-1 rounded ${
                            product.status === 'published' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="text-gray-400">
                        <MoreHorizontal size={20} />
                      </Button>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center space-x-6 mt-4">
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Eye size={16} />
                        <span className="text-sm">{product.views}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Heart size={16} />
                        <span className="text-sm">{product.likes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400">
                        <Shuffle size={16} />
                        <span className="text-sm">{product.remixes}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-cyber-blue">
                        <TrendingUp size={16} />
                        <span className="text-sm font-medium">${product.earnings}</span>
                      </div>
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

export default ProductsOverview;
