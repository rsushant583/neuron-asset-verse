
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const CreatorOnboarding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({
    ideaType: '',
    outputFormats: [],
    royaltyRate: 5
  });

  const steps = [
    {
      title: "What's your expertise?",
      description: "Choose the type of knowledge you want to monetize",
      options: [
        { id: 'lifestyle', label: 'Lifestyle & Wellness', icon: '🧘', color: 'from-green-400 to-emerald-500' },
        { id: 'business', label: 'Business & Finance', icon: '💼', color: 'from-blue-400 to-cyan-500' },
        { id: 'creative', label: 'Creative Arts', icon: '🎨', color: 'from-purple-400 to-pink-500' },
        { id: 'tech', label: 'Technology', icon: '💻', color: 'from-cyber-blue to-cyber-purple' },
        { id: 'education', label: 'Education & Skills', icon: '📚', color: 'from-orange-400 to-yellow-500' },
        { id: 'other', label: 'Other', icon: '✨', color: 'from-gray-400 to-gray-600' }
      ]
    },
    {
      title: "Output formats",
      description: "Select how you want AI to transform your knowledge",
      options: [
        { id: 'ebook', label: 'eBook', icon: '📖', color: 'from-blue-400 to-blue-600' },
        { id: 'audiobook', label: 'Audiobook', icon: '🎧', color: 'from-green-400 to-green-600' },
        { id: 'course', label: 'Mini Course', icon: '🎓', color: 'from-purple-400 to-purple-600' },
        { id: 'bot', label: 'Chatbot', icon: '🤖', color: 'from-cyber-blue to-cyber-purple' },
        { id: 'templates', label: 'Templates', icon: '📋', color: 'from-pink-400 to-pink-600' },
        { id: 'scripts', label: 'Scripts', icon: '📝', color: 'from-orange-400 to-orange-600' }
      ]
    },
    {
      title: "Set your royalties",
      description: "Choose your ongoing revenue percentage",
      type: 'slider'
    },
    {
      title: "Ready to mint!",
      description: "Review and confirm your NFT creation",
      type: 'summary'
    }
  ];

  const handleOptionSelect = (stepType: string, optionId: string) => {
    if (stepType === 'ideaType') {
      setSelectedOptions(prev => ({ ...prev, ideaType: optionId }));
    } else if (stepType === 'outputFormats') {
      setSelectedOptions(prev => ({
        ...prev,
        outputFormats: prev.outputFormats.includes(optionId)
          ? prev.outputFormats.filter(id => id !== optionId)
          : [...prev.outputFormats, optionId]
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleMint = () => {
    console.log('Minting NFT with options:', selectedOptions);
    // Simulate minting process
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  const currentStepData = steps[currentStep - 1];

  return (
    <>
      <section className="scroll-section bg-gradient-to-b from-cyber-darker to-black">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-5xl font-bold">
              <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
                Start Your Creator Journey
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Transform your unique knowledge into AI-powered digital products in minutes
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => setIsModalOpen(true)}
                size="lg"
                className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink text-white font-bold px-12 py-6 text-xl rounded-full neural-glow transition-all duration-500"
              >
                Begin Creation Process
              </Button>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-6 mt-16">
              {[
                { icon: '⚡', title: 'Fast Setup', desc: '5-minute wizard' },
                { icon: '🤖', title: 'AI Powered', desc: 'Automated generation' },
                { icon: '💰', title: 'Instant Monetization', desc: 'Earn from day one' }
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="glass-morphism p-6 rounded-lg border border-cyber-blue/20"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                >
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div
              className="relative w-full max-w-2xl bg-black/90 border border-cyber-blue/30 rounded-2xl overflow-hidden neural-glow"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
            >
              {/* Progress Bar */}
              <div className="w-full h-1 bg-gray-800">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyber-blue to-cyber-purple"
                  initial={{ width: 0 }}
                  animate={{ width: `${(currentStep / steps.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>

              <div className="p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <motion.h3
                    className="text-2xl font-bold text-white mb-2"
                    key={currentStep}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {currentStepData.title}
                  </motion.h3>
                  <p className="text-gray-400">{currentStepData.description}</p>
                </div>

                {/* Step Content */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {currentStepData.type === 'slider' ? (
                      <div className="space-y-6">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-cyber-blue">
                            {selectedOptions.royaltyRate}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={selectedOptions.royaltyRate}
                          onChange={(e) => setSelectedOptions(prev => ({ ...prev, royaltyRate: parseInt(e.target.value) }))}
                          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <div className="flex justify-between text-sm text-gray-400">
                          <span>1%</span>
                          <span>20%</span>
                        </div>
                      </div>
                    ) : currentStepData.type === 'summary' ? (
                      <div className="space-y-4">
                        <Card className="bg-gray-900/50 border-cyber-blue/20">
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              <div>
                                <span className="text-gray-400">Expertise:</span>
                                <span className="text-white ml-2 capitalize">{selectedOptions.ideaType}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Formats:</span>
                                <span className="text-white ml-2">{selectedOptions.outputFormats.join(', ')}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Royalty Rate:</span>
                                <span className="text-cyber-blue ml-2 font-bold">{selectedOptions.royaltyRate}%</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        {currentStepData.options?.map((option) => (
                          <motion.div
                            key={option.id}
                            className={`cursor-pointer rounded-lg p-4 border-2 transition-all ${
                              (currentStep === 1 && selectedOptions.ideaType === option.id) ||
                              (currentStep === 2 && selectedOptions.outputFormats.includes(option.id))
                                ? 'border-cyber-blue bg-cyber-blue/10'
                                : 'border-gray-600 hover:border-gray-500'
                            }`}
                            onClick={() => handleOptionSelect(
                              currentStep === 1 ? 'ideaType' : 'outputFormats',
                              option.id
                            )}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <div className={`text-2xl mb-2 w-8 h-8 rounded-full bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                              {option.icon}
                            </div>
                            <div className="text-white font-medium">{option.label}</div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Navigation */}
                <div className="flex justify-between mt-8">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="glass-morphism border-gray-600 text-white hover:bg-gray-800"
                  >
                    Previous
                  </Button>
                  
                  {currentStep === steps.length ? (
                    <Button
                      onClick={handleMint}
                      className="bg-gradient-to-r from-cyber-blue to-cyber-purple hover:from-cyber-purple hover:to-cyber-pink"
                    >
                      Mint NFT 🚀
                    </Button>
                  ) : (
                    <Button
                      onClick={nextStep}
                      disabled={
                        (currentStep === 1 && !selectedOptions.ideaType) ||
                        (currentStep === 2 && selectedOptions.outputFormats.length === 0)
                      }
                      className="bg-cyber-blue hover:bg-cyber-blue/80 text-black"
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CreatorOnboarding;
