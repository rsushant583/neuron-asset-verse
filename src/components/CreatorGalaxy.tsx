import { useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

// Simplified CreatorGalaxy component without Three.js dependencies
const CreatorGalaxy = () => {
  const creators = [
    { id: 1, name: "Alex Chen", products: 12, color: "#00d4ff", specialty: "AI Prompts" },
    { id: 2, name: "Maya Patel", products: 8, color: "#7c3aed", specialty: "Wellness Guides" },
    { id: 3, name: "Jordan Kim", products: 15, color: "#ec4899", specialty: "Crypto Trading" },
    { id: 4, name: "Riley Thompson", products: 6, color: "#8b5cf6", specialty: "Creative Writing" },
    { id: 5, name: "Casey Martinez", products: 20, color: "#06b6d4", specialty: "Life Hacks" },
    { id: 6, name: "Sam Wilson", products: 9, color: "#f59e0b", specialty: "Productivity" },
  ];

  return (
    <section className="scroll-section bg-gradient-to-b from-black to-cyber-darker">
      <div className="w-full max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              Creator Galaxy
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Explore the universe of knowledge creators and their AI-generated products
          </p>
        </motion.div>

        <div className="relative">
          <div className="h-[600px] w-full rounded-2xl overflow-hidden glass-morphism border border-cyber-blue/20">
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-white text-xl">Interactive 3D Galaxy View</p>
            </div>
          </div>

          {/* Overlay instructions */}
          <div className="absolute top-4 left-4 glass-morphism p-3 rounded-lg">
            <p className="text-cyber-blue text-sm font-mono">
              Click & drag to explore • Scroll to zoom
            </p>
          </div>
        </div>

        {/* Creator Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          viewport={{ once: true }}
        >
          {creators.slice(0, 6).map((creator, index) => (
            <motion.div
              key={creator.id}
              className="glass-morphism p-4 rounded-lg border border-cyber-blue/20 hover:border-cyber-purple/40 transition-all duration-300 cursor-pointer"
              whileHover={{ scale: 1.05, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-full" 
                  style={{ backgroundColor: creator.color }}
                />
                <div>
                  <h3 className="text-white font-semibold">{creator.name}</h3>
                  <p className="text-gray-400 text-sm">{creator.specialty}</p>
                  <p className="text-cyber-blue text-xs">{creator.products} products</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default CreatorGalaxy;