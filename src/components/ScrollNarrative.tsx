
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const ScrollNarrative = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const steps = [
    {
      icon: "📥",
      title: "Upload Your Idea",
      description: "Share your unique knowledge",
      example: "\"How I beat insomnia with Ayurveda\"",
      color: "from-cyber-blue to-cyber-purple"
    },
    {
      icon: "⚙️",
      title: "AI Transformation",
      description: "Watch AI create multiple products",
      example: "eBook + Voice Bot + YouTube Script",
      color: "from-cyber-purple to-cyber-pink"
    },
    {
      icon: "🧬",
      title: "NFT Minting",
      description: "Your products become tradeable assets",
      example: "3D collectible cards with royalties",
      color: "from-cyber-pink to-cyber-blue"
    },
    {
      icon: "🔄",
      title: "Remix Economy",
      description: "Others build upon your work",
      example: "Community-driven improvements",
      color: "from-cyber-blue to-cyber-purple"
    },
    {
      icon: "🪙",
      title: "Token Rewards",
      description: "Earn $MM tokens continuously",
      example: "Passive income from your knowledge",
      color: "from-cyber-purple to-cyber-pink"
    },
    {
      icon: "🧠",
      title: "DAO Governance",
      description: "Vote on platform decisions",
      example: "Shape the future of knowledge economy",
      color: "from-cyber-pink to-cyber-blue"
    }
  ];

  return (
    <div ref={containerRef} className="relative">
      {steps.map((step, index) => {
        const stepProgress = useTransform(
          scrollYProgress,
          [index / steps.length, (index + 1) / steps.length],
          [0, 1]
        );
        
        const y = useTransform(stepProgress, [0, 1], [100, -100]);
        const opacity = useTransform(stepProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);
        const scale = useTransform(stepProgress, [0, 0.5, 1], [0.8, 1, 0.8]);

        return (
          <motion.section 
            key={index}
            className="scroll-section px-6"
            style={{ opacity, scale }}
          >
            <motion.div 
              className="max-w-4xl mx-auto grid md:grid-cols-2 gap-12 items-center"
              style={{ y }}
            >
              <div className="space-y-6">
                <motion.div 
                  className="text-8xl mb-4"
                  animate={{ rotate: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  {step.icon}
                </motion.div>
                <h2 className={`text-5xl font-bold bg-gradient-to-r ${step.color} bg-clip-text text-transparent`}>
                  {step.title}
                </h2>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {step.description}
                </p>
                <div className="glass-morphism p-4 rounded-lg border border-cyber-blue/20">
                  <p className="text-cyber-blue font-mono text-sm">
                    {step.example}
                  </p>
                </div>
              </div>

              <motion.div 
                className="relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className={`w-80 h-80 rounded-2xl bg-gradient-to-br ${step.color} p-1`}>
                  <div className="w-full h-full bg-black/90 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                    <div className="text-center space-y-4">
                      <div className="text-6xl">{step.icon}</div>
                      <div className="text-white text-xl font-semibold">{step.title}</div>
                      <div className="w-16 h-1 bg-gradient-to-r from-cyber-blue to-cyber-purple mx-auto rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                {/* Floating elements around the card */}
                <motion.div 
                  className="absolute -top-4 -right-4 w-8 h-8 bg-cyber-blue rounded-full opacity-60"
                  animate={{ y: [0, -20, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
                <motion.div 
                  className="absolute -bottom-4 -left-4 w-6 h-6 bg-cyber-pink rounded-full opacity-60"
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 1 }}
                />
              </motion.div>
            </motion.div>
          </motion.section>
        );
      })}
    </div>
  );
};

export default ScrollNarrative;
