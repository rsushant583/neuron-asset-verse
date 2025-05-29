
import { motion } from 'framer-motion';
import { useState } from 'react';

const TokenomicsSection = () => {
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  const nodes = [
    {
      id: 1,
      title: "Create",
      description: "Earn 100 $MM tokens for each knowledge product created",
      icon: "🎨",
      color: "from-cyber-blue to-cyan-400",
      position: { top: "20%", left: "30%" }
    },
    {
      id: 2,
      title: "Remix",
      description: "Get 25 $MM tokens when others build upon your work",
      icon: "🔄",
      color: "from-cyber-purple to-violet-400",
      position: { top: "60%", left: "70%" }
    },
    {
      id: 3,
      title: "Vote",
      description: "Earn 10 $MM tokens for participating in governance",
      icon: "🗳️",
      color: "from-cyber-pink to-pink-400",
      position: { top: "80%", left: "20%" }
    },
    {
      id: 4,
      title: "Royalties",
      description: "Receive 5% royalties in $MM for every sale",
      icon: "💰",
      color: "from-emerald-400 to-green-400",
      position: { top: "30%", left: "80%" }
    },
    {
      id: 5,
      title: "Stake",
      description: "Lock $MM tokens to earn 15% APY and boost rewards",
      icon: "🔒",
      color: "from-orange-400 to-yellow-400",
      position: { top: "70%", left: "40%" }
    }
  ];

  const totalSupply = "1,000,000,000";
  const circulatingSupply = "250,000,000";

  return (
    <section className="scroll-section bg-gradient-to-br from-black via-cyber-darker to-black">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-bold mb-6">
            <span className="bg-gradient-to-r from-cyber-blue to-cyber-purple bg-clip-text text-transparent">
              MetaMind Tokenomics
            </span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The $MM token powers our knowledge economy with sustainable rewards and governance
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Interactive Circular Diagram */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative w-96 h-96 mx-auto">
              {/* Central Hub */}
              <motion.div 
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center text-2xl font-bold neural-glow"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                $MM
              </motion.div>

              {/* Interactive Nodes */}
              {nodes.map((node, index) => (
                <motion.div
                  key={node.id}
                  className="absolute w-16 h-16 cursor-pointer"
                  style={node.position}
                  whileHover={{ scale: 1.2 }}
                  onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  viewport={{ once: true }}
                >
                  <div className={`w-full h-full rounded-full bg-gradient-to-r ${node.color} flex items-center justify-center text-2xl neural-glow transition-all duration-300 ${selectedNode === node.id ? 'ring-4 ring-white/50' : ''}`}>
                    {node.icon}
                  </div>
                  
                  {/* Connection Lines */}
                  <svg className="absolute top-8 left-8 w-32 h-32 pointer-events-none">
                    <line 
                      x1="0" y1="0" 
                      x2="64" y2="64" 
                      stroke="url(#connectionGradient)" 
                      strokeWidth="2" 
                      opacity="0.3"
                    />
                    <defs>
                      <linearGradient id="connectionGradient">
                        <stop offset="0%" stopColor="#00d4ff" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                </motion.div>
              ))}

              {/* Orbital Particles */}
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-cyber-blue rounded-full opacity-60"
                  animate={{
                    x: [0, 100, 0, -100, 0],
                    y: [0, -100, 0, 100, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 1,
                    ease: "linear"
                  }}
                  style={{
                    top: "50%",
                    left: "50%",
                    transformOrigin: "0 0"
                  }}
                />
              ))}
            </div>
          </motion.div>

          {/* Token Details */}
          <div className="space-y-8">
            {/* Selected Node Details */}
            <motion.div 
              className="glass-morphism p-6 rounded-2xl border border-cyber-blue/20 min-h-[200px]"
              layout
            >
              {selectedNode ? (
                <motion.div
                  key={selectedNode}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {(() => {
                    const node = nodes.find(n => n.id === selectedNode);
                    return (
                      <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${node?.color} flex items-center justify-center text-xl`}>
                            {node?.icon}
                          </div>
                          <h3 className="text-2xl font-bold text-white">{node?.title}</h3>
                        </div>
                        <p className="text-gray-300 text-lg leading-relaxed">
                          {node?.description}
                        </p>
                      </div>
                    );
                  })()}
                </motion.div>
              ) : (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="text-4xl mb-4">💡</div>
                    <p className="text-gray-400">Click on any node to learn more about $MM token utilities</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Token Stats */}
            <motion.div 
              className="grid grid-cols-2 gap-4"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="glass-morphism p-4 rounded-lg border border-cyber-purple/20">
                <h4 className="text-cyber-purple font-semibold mb-2">Total Supply</h4>
                <p className="text-2xl font-bold text-white">{totalSupply}</p>
              </div>
              <div className="glass-morphism p-4 rounded-lg border border-cyber-blue/20">
                <h4 className="text-cyber-blue font-semibold mb-2">Circulating</h4>
                <p className="text-2xl font-bold text-white">{circulatingSupply}</p>
              </div>
            </motion.div>

            {/* Distribution Chart */}
            <motion.div 
              className="glass-morphism p-6 rounded-lg border border-cyber-pink/20"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              viewport={{ once: true }}
            >
              <h4 className="text-cyber-pink font-semibold mb-4">Token Distribution</h4>
              <div className="space-y-3">
                {[
                  { label: "Creator Rewards", percentage: 40, color: "bg-cyber-blue" },
                  { label: "Community Treasury", percentage: 25, color: "bg-cyber-purple" },
                  { label: "Team & Advisors", percentage: 20, color: "bg-cyber-pink" },
                  { label: "Liquidity", percentage: 15, color: "bg-emerald-400" }
                ].map((item, index) => (
                  <div key={item.label} className="flex items-center space-x-3">
                    <div className="w-16 text-sm text-gray-400">{item.percentage}%</div>
                    <div className="flex-1 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className={`h-full ${item.color}`}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <div className="text-sm text-white">{item.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenomicsSection;
