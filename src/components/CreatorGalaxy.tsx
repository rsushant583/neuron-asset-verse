
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Three.js Creator Card Component
function CreatorCard({ position, creator, onClick }: any) {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01;
      meshRef.current.position.y += Math.sin(state.clock.elapsedTime + position[0]) * 0.01;
    }
  });

  return (
    <group position={position} onClick={onClick}>
      <mesh ref={meshRef} castShadow receiveShadow>
        <boxGeometry args={[2, 3, 0.1]} />
        <meshStandardMaterial 
          color={creator.color} 
          transparent 
          opacity={0.8}
          emissive={creator.color}
          emissiveIntensity={0.2}
        />
      </mesh>
      <Text
        position={[0, -2, 0.1]}
        fontSize={0.3}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {creator.name}
      </Text>
      <Text
        position={[0, -2.5, 0.1]}
        fontSize={0.2}
        color="#00d4ff"
        anchorX="center"
        anchorY="middle"
      >
        {creator.products} products
      </Text>
    </group>
  );
}

// 3D Scene Component
function Galaxy({ creators, onCreatorClick }: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const positions = useMemo(() => {
    return creators.map((_: any, i: number) => {
      const radius = 8 + Math.random() * 4;
      const angle = (i / creators.length) * Math.PI * 2;
      const height = (Math.random() - 0.5) * 6;
      return [
        Math.cos(angle) * radius,
        height,
        Math.sin(angle) * radius
      ];
    });
  }, [creators]);

  return (
    <group ref={groupRef}>
      {creators.map((creator: any, index: number) => (
        <CreatorCard
          key={creator.id}
          position={positions[index]}
          creator={creator}
          onClick={() => onCreatorClick(creator)}
        />
      ))}
      
      {/* Ambient particles */}
      {Array.from({ length: 50 }).map((_, i) => (
        <mesh key={i} position={[
          (Math.random() - 0.5) * 30,
          (Math.random() - 0.5) * 20,
          (Math.random() - 0.5) * 30
        ]}>
          <sphereGeometry args={[0.05]} />
          <meshBasicMaterial color="#00d4ff" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

const CreatorGalaxy = () => {
  const creators = [
    { id: 1, name: "Alex Chen", products: 12, color: "#00d4ff", specialty: "AI Prompts" },
    { id: 2, name: "Maya Patel", products: 8, color: "#7c3aed", specialty: "Wellness Guides" },
    { id: 3, name: "Jordan Kim", products: 15, color: "#ec4899", specialty: "Crypto Trading" },
    { id: 4, name: "Riley Thompson", products: 6, color: "#8b5cf6", specialty: "Creative Writing" },
    { id: 5, name: "Casey Martinez", products: 20, color: "#06b6d4", specialty: "Life Hacks" },
    { id: 6, name: "Sam Wilson", products: 9, color: "#f59e0b", specialty: "Productivity" },
  ];

  const handleCreatorClick = (creator: any) => {
    console.log('Selected creator:', creator);
    // Could open a modal or navigate to creator details
  };

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
            <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
              <ambientLight intensity={0.3} />
              <pointLight position={[10, 10, 10]} intensity={1} color="#00d4ff" />
              <pointLight position={[-10, -10, -10]} intensity={0.5} color="#7c3aed" />
              <Galaxy creators={creators} onCreatorClick={handleCreatorClick} />
              <OrbitControls enablePan={false} enableZoom={true} enableRotate={true} />
            </Canvas>
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
