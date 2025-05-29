
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Sparkles, BookOpen, MessageSquare, Code, FileText } from 'lucide-react';

const UploadIdea = () => {
  const [selectedFormat, setSelectedFormat] = useState('');
  const [idea, setIdea] = useState('');
  const [generating, setGenerating] = useState(false);

  const formats = [
    { id: 'ebook', name: 'eBook', icon: BookOpen, description: 'Comprehensive digital book' },
    { id: 'script', name: 'Script', icon: FileText, description: 'YouTube/Podcast script' },
    { id: 'chatbot', name: 'Chatbot', icon: MessageSquare, description: 'Interactive AI assistant' },
    { id: 'code', name: 'Code Template', icon: Code, description: 'Reusable code snippets' },
  ];

  const handleGenerate = async () => {
    setGenerating(true);
    // Simulate AI generation
    setTimeout(() => {
      setGenerating(false);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="glass-morphism border-cyber-blue/20">
          <CardHeader>
            <CardTitle className="text-2xl text-white flex items-center space-x-2">
              <Upload className="text-cyber-blue" />
              <span>Transform Your Idea</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Idea Input */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                What knowledge do you want to share?
              </label>
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="Example: How I built a $100k/year meditation practice using ancient breathing techniques..."
                className="min-h-[120px] bg-white/5 border-cyber-blue/20 text-white placeholder-gray-500"
              />
            </div>

            {/* Format Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4">
                Choose output format
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {formats.map((format) => {
                  const Icon = format.icon;
                  return (
                    <motion.button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                        selectedFormat === format.id
                          ? 'border-cyber-blue bg-cyber-blue/20'
                          : 'border-gray-600 hover:border-cyber-blue/50'
                      }`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className="mx-auto mb-2 text-cyber-blue" size={24} />
                      <div className="text-white font-medium">{format.name}</div>
                      <div className="text-xs text-gray-400 mt-1">{format.description}</div>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={!idea || !selectedFormat || generating}
              className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white py-3"
            >
              {generating ? (
                <motion.div
                  className="flex items-center space-x-2"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Sparkles className="animate-spin" />
                  <span>AI is working its magic...</span>
                </motion.div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Sparkles />
                  <span>Generate AI Product</span>
                </div>
              )}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Preview Area */}
      {generating && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-morphism rounded-lg p-6 border border-cyber-purple/20"
        >
          <div className="text-center">
            <motion.div
              className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
            <h3 className="text-xl font-bold text-white mb-2">Creating Your Product</h3>
            <p className="text-gray-400">Our AI is analyzing your idea and generating content...</p>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default UploadIdea;
