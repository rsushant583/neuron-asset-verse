
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MobileHero = () => {
  const [scrollY, setScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-8 pb-24">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black via-cyber-darker to-black"
        style={{
          transform: `translateY(${scrollY * 0.5}px)`,
        }}
      />

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-cyber-blue rounded-full opacity-60"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 text-center max-w-sm mx-auto"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="mb-6"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-r from-cyber-blue to-cyber-purple flex items-center justify-center neural-glow mb-4">
            <Sparkles size={32} className="text-white" />
          </div>
        </motion.div>

        <motion.h1 
          className="text-4xl font-black tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <span className="bg-gradient-to-r from-cyber-blue via-cyber-purple to-cyber-pink bg-clip-text text-transparent">
            AI Turns Ideas
          </span>
          <br />
          <span className="text-white">
            Into Assets
          </span>
        </motion.h1>

        <motion.p 
          className="text-gray-300 text-lg leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Transform your thoughts into digital products. Earn from remixes. Own your knowledge forever.
        </motion.p>

        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-cyber-blue to-cyber-purple text-white font-bold py-4 text-lg rounded-2xl shadow-lg hover:shadow-cyber-blue/25 transition-all duration-300"
            onClick={() => navigate('/dashboard')}
          >
            <span>Start Creating</span>
            <ArrowRight size={20} className="ml-2" />
          </Button>
          
          <Button 
            variant="outline" 
            size="lg" 
            className="w-full glass-morphism border-cyber-purple/50 text-white font-bold py-4 text-lg rounded-2xl hover:bg-cyber-purple/10 transition-all duration-300"
            onClick={() => navigate('/explorer')}
          >
            Explore Products
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 mt-12 pt-8 border-t border-white/10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-blue">1.2K+</div>
            <div className="text-xs text-gray-400">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-purple">250+</div>
            <div className="text-xs text-gray-400">Creators</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyber-pink">50K+</div>
            <div className="text-xs text-gray-400">Remixes</div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-1 h-8 bg-gradient-to-b from-cyber-blue to-transparent rounded-full" />
      </motion.div>
    </section>
  );
};

export default MobileHero;
