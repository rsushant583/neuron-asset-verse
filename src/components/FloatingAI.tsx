
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const FloatingAI = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm MetaMind AI. I can help you turn your knowledge into profitable NFT products. What would you like to create?",
      isAI: true
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const quickActions = [
    { text: "How do I create my first NFT?", icon: "❓" },
    { text: "What formats can AI generate?", icon: "🤖" },
    { text: "How much can I earn?", icon: "💰" },
    { text: "Show me successful creators", icon: "⭐" }
  ];

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isAI: false
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        text: getAIResponse(inputMessage),
        isAI: true
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (input: string) => {
    const responses = {
      "how": "Creating your first NFT is simple! Just share your expertise - it could be anything from 'How I meal prep for the week' to 'My 3-step morning routine'. Our AI will transform it into multiple products like eBooks, audio guides, and interactive bots.",
      "format": "I can generate: 📖 eBooks, 🎧 Audiobooks, 🎓 Mini-courses, 🤖 Chatbots, 📋 Templates, 📝 Scripts, and more! Each format is optimized for different learning styles.",
      "earn": "Creators typically earn 100-500 $MM tokens per product, plus 5-15% royalties on all sales. Popular products can generate $500-5000+ monthly in passive income!",
      "creator": "Our top creators include Maya (wellness guides, 20k followers), Alex (AI prompts, $3k/month), and Jordan (crypto trading strategies, 50+ products). Want to see their work?"
    };

    const key = Object.keys(responses).find(k => input.toLowerCase().includes(k));
    return key ? responses[key as keyof typeof responses] : 
      "That's a great question! I can help you with creating NFT products, understanding tokenomics, finding your niche, or connecting with other creators. What specific area interests you most?";
  };

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    handleSendMessage();
  };

  return (
    <>
      {/* Floating Orb */}
      <motion.div
        className="floating-orb"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{
          boxShadow: [
            "0 0 20px rgba(0, 212, 255, 0.3)",
            "0 0 40px rgba(124, 58, 237, 0.5)",
            "0 0 20px rgba(0, 212, 255, 0.3)"
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="text-white text-2xl"
        >
          {isOpen ? '✕' : '🧠'}
        </motion.div>
      </motion.div>

      {/* Chat Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed bottom-24 right-8 z-50 w-96 h-[500px]"
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <Card className="w-full h-full bg-black/95 border-cyber-blue/30 neural-glow">
              <CardContent className="p-0 h-full flex flex-col">
                {/* Header */}
                <div className="p-4 border-b border-cyber-blue/20 bg-gradient-to-r from-cyber-blue/10 to-cyber-purple/10">
                  <div className="flex items-center space-x-3">
                    <motion.div
                      className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    >
                      🧠
                    </motion.div>
                    <div>
                      <h3 className="text-white font-bold">MetaMind AI</h3>
                      <p className="text-cyber-blue text-sm">Your Knowledge Assistant</p>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      className={`flex ${message.isAI ? 'justify-start' : 'justify-end'}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          message.isAI
                            ? 'bg-gradient-to-r from-cyber-blue/20 to-cyber-purple/20 text-white border border-cyber-blue/30'
                            : 'bg-cyber-blue text-black'
                        }`}
                      >
                        <p className="text-sm">{message.text}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="p-3 border-t border-cyber-blue/20">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {quickActions.map((action, index) => (
                      <motion.button
                        key={action.text}
                        onClick={() => handleQuickAction(action.text)}
                        className="text-xs p-2 bg-gray-800/50 hover:bg-cyber-blue/20 rounded border border-gray-600 hover:border-cyber-blue/50 text-white transition-all duration-200"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <span className="mr-1">{action.icon}</span>
                        {action.text}
                      </motion.button>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Ask me anything..."
                      className="flex-1 bg-gray-800/50 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-cyber-blue"
                    />
                    <Button
                      onClick={handleSendMessage}
                      size="sm"
                      className="bg-cyber-blue hover:bg-cyber-blue/80 text-black px-3"
                    >
                      →
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingAI;
