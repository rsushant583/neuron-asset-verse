
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import ScrollNarrative from '@/components/ScrollNarrative';
import CreatorGalaxy from '@/components/CreatorGalaxy';
import TokenomicsSection from '@/components/TokenomicsSection';
import CreatorOnboarding from '@/components/CreatorOnboarding';
import FloatingAI from '@/components/FloatingAI';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="relative">
      <Navigation />
      
      <main>
        <HeroSection />
        <ScrollNarrative />
        <CreatorGalaxy />
        <TokenomicsSection />
        <CreatorOnboarding />
      </main>
      
      <Footer />
      <FloatingAI />
    </div>
  );
};

export default Index;
