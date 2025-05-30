
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navigation from '@/components/Navigation';
import MobileNavigation from '@/components/mobile/MobileNavigation';

const Create = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const creationSteps = [
    {
      icon: Brain,
      title: 'Share Your Idea',
      description: 'Upload your knowledge, concept, or creative insight',
      color: 'from-cyber-blue to-cyber-purple'
    },
    {
      icon: Sparkles,
      title: 'AI Enhancement',
      description: 'Our AI analyzes and enriches your content',
      color: 'from-cyber-purple to-cyber-pink'
    },
    {
      icon: Upload,
      title: 'Mint as NFT',
      description: 'Transform your idea into a tradeable digital asset',
      color: 'from-cyber-pink to-cyber-blue'
    }
  ];

  const categories = [
    'Art & Design', 'Technology', 'Business', 'Science', 'Education', 'Entertainment'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black overflow-x-hidden">
      {!isMobile && <Navigation />}
      
      <div className={`${!isMobile ? 'pt-20' : 'pt-4'} ${isMobile ? 'pb-20' : ''}`}>
        {/* Header */}
        <motion.div
          className="max-w-4xl mx-auto px-4 md:px-6 text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Create Your <span className="text-glow bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">Knowledge NFT</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Transform your unique insights into valuable digital assets that can be traded, remixed, and evolved by the community
          </p>
        </motion.div>

        {/* Creation Steps */}
        <motion.div
          className="max-w-6xl mx-auto px-4 md:px-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {creationSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  className="text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center neural-glow`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Creation Form */}
        <motion.div
          className="max-w-2xl mx-auto px-4 md:px-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass-morphism p-6 md:p-8 rounded-lg border border-cyber-blue/20">
            <form className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Idea Title</label>
                <input
                  type="text"
                  placeholder="Give your idea a compelling name..."
                  className="w-full px-4 py-3 bg-white/5 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-blue/50"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Category</label>
                <select className="w-full px-4 py-3 bg-white/5 border border-cyber-blue/20 rounded-lg text-white focus:outline-none focus:border-cyber-blue/50">
                  <option value="">Select a category...</option>
                  {categories.map(category => (
                    <option key={category} value={category} className="bg-black">
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Description</label>
                <textarea
                  rows={4}
                  placeholder="Describe your idea in detail. What makes it unique and valuable?"
                  className="w-full px-4 py-3 bg-white/5 border border-cyber-blue/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-blue/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Upload Files (Optional)</label>
                <div className="border-2 border-dashed border-cyber-blue/30 rounded-lg p-8 text-center hover:border-cyber-blue/50 transition-colors cursor-pointer">
                  <Upload size={32} className="text-cyber-blue mx-auto mb-2" />
                  <p className="text-gray-400 mb-2">Drag & drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Support for images, documents, and media files</p>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-4">
                <Button 
                  type="button"
                  variant="outline" 
                  className="flex-1 border-cyber-blue/50 text-cyber-blue hover:bg-cyber-blue/20"
                >
                  Save as Draft
                </Button>
                <Button 
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-cyber-blue to-cyber-purple text-white"
                >
                  Create NFT
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>

      {isMobile && <MobileNavigation />}
    </div>
  );
};

export default Create;
