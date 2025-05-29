
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import MobileHero from '@/components/mobile/MobileHero';
import ScrollNarrative from '@/components/ScrollNarrative';
import CreatorGalaxy from '@/components/CreatorGalaxy';
import TokenomicsSection from '@/components/TokenomicsSection';
import CreatorOnboarding from '@/components/CreatorOnboarding';
import Footer from '@/components/Footer';
import FloatingAI from '@/components/FloatingAI';

const Index = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-cyber-darker to-black overflow-x-hidden">
      {!isMobile && <Navigation />}
      
      {isMobile ? <MobileHero /> : <HeroSection />}
      
      <ScrollNarrative />
      <CreatorGalaxy />
      <TokenomicsSection />
      <CreatorOnboarding />
      <Footer />
      <FloatingAI />
    </div>
  );
};

export default Index;
